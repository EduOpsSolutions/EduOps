import admin from "firebase-admin";
import { randomUUID } from "crypto";
import { filePaths } from "../constants/file_paths.js";
import { PrismaClient } from "@prisma/client";
import { logUserActivity, logError, ModuleTypes } from "./logger.js";

const prisma = new PrismaClient();

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  let credential;
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // JSON string for service account
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } else if (process.env.FIREBASE_CREDENTIALS_PATH) {
      // File path for service account JSON
      const fs = await import("fs");
      const path = process.env.FIREBASE_CREDENTIALS_PATH;
      const raw = fs.readFileSync(path, "utf-8");
      const serviceAccount = JSON.parse(raw);
      credential = admin.credential.cert(serviceAccount);
    } else if (
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    ) {
      // Default ADC flow (requires env var to be set in runtime environment)
      credential = admin.credential.applicationDefault();
    } else {
      logError(
        "File Storage - No Firebase credentials found",
        new Error("No Firebase credentials found"),
        null,
        ModuleTypes.SYSTEM
      );
      throw new Error(
        "No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT (JSON) or FIREBASE_CREDENTIALS_PATH."
      );
    }
  } catch (e) {
    console.error(
      "Failed to initialize Firebase Admin credentials:",
      e.message
    );
    logError(
      "File Storage - Failed to initialize Firebase Admin credentials",
      e,
      null,
      ModuleTypes.SYSTEM
    );
    throw e;
  }

  admin.initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
    projectId: process.env.FIREBASE_PROJECTID,
  });
}

const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGEBUCKET);

export const uploadFile = async (file, directory) => {
  try {
    // Use the buffer from memory storage
    const fileBuffer = file.buffer;

    // Generate filename since memory storage doesn't create one
    const path = await import("path");
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${file.fieldname}_${name}_${new Date()
      .toISOString()
      .replace(/:/g, "-")}${ext}`;

    let file_dir = "uncategorized";
    switch (directory) {
      case filePaths.userProfiles:
        file_dir = "user-profile";
        break;
      case filePaths.posts:
        file_dir = "posts";
        break;
      case filePaths.documents:
        file_dir = "documents";
        break;
      case filePaths.enrollment:
        file_dir = "enrollment";
        break;
      case filePaths.proofIds:
        file_dir = "proof-ids";
        break;
      case filePaths.paymentProofs:
        file_dir = "payment-proofs";
        break;
      case filePaths.grades:
        file_dir = 'grades';
        break;
      case filePaths.uncategorized:
      default:
        file_dir = "uncategorized";
    }
    const objectPath = `${file_dir}/${filename}`;
    const fileRef = bucket.file(objectPath);

    const downloadToken = randomUUID();
    await fileRef.save(fileBuffer, {
      resumable: false,
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    });

    const encodedPath = encodeURIComponent(objectPath);
    const bucketName = process.env.FIREBASE_STORAGEBUCKET;
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    const db_file_record = await prisma.files.create({
      data: {
        url: downloadURL,
        token: downloadToken,
        fileName: filename,
        originalName: file.originalname,
        directory: file_dir,
      },
    });
    logUserActivity(
      "File Storage - File uploaded successfully",
      null,
      ModuleTypes.SYSTEM,
      `File ${file.originalname} uploaded successfully URL: ${downloadURL}`
    );

    return {
      success: true,
      database_ref: db_file_record,
      downloadURL,
      fileName: filename,
      originalName: file.originalname,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    logError(
      "File Storage - Error uploading file",
      error,
      null,
      ModuleTypes.SYSTEM
    );
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const uploadMultipleFiles = async (files, directory) => {
  try {
    logUserActivity(
      "File Storage - Uploading multiple files",
      null,
      ModuleTypes.SYSTEM,
      `Uploading ${files.length} files to ${directory}`
    );
    const uploadedFiles = [];
    const failedFiles = [];
    for (const file of files) {
      const result = await uploadFile(file, directory).catch((error) => {
        console.error("Error uploading file:", error);
        logError(
          "File Storage - Error uploading file",
          error,
          null,
          ModuleTypes.SYSTEM
        );
      });
      if (result.success === true) {
        uploadedFiles.push(result);
        logUserActivity(
          "File Storage - File uploaded successfully",
          null,
          ModuleTypes.SYSTEM,
          `File ${file.originalname} uploaded successfully`
        );
      } else {
        failedFiles.push(file.originalname);
        logError(
          "File Storage - File upload failed",
          error,
          null,
          ModuleTypes.SYSTEM
        );
      }
    }

    return {
      uploadedFiles,
      failedFiles,
    };
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    logError(
      "File Storage - Error uploading multiple files",
      error,
      null,
      ModuleTypes.SYSTEM
    );
    throw new Error(`Upload failed: ${error.message}`);
  }
};
