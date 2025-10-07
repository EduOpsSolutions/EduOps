import admin from 'firebase-admin';
import { filePaths } from '../constants/file_paths.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse service account JSON from env
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fallback to individual env variables
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECTID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  });
}

export const storage = admin.storage().bucket();

export const uploadFile = async (file, directory) => {
  try {
    // Use the buffer from memory storage
    const fileBuffer = file.buffer;

    // Generate filename since memory storage doesn't create one
    const path = await import('path');
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${file.fieldname}_${name}_${new Date()
      .toISOString()
      .replace(/:/g, '-')}${ext}`;

    let file_dir = 'uncategorized';
    switch (directory) {
      case filePaths.userProfiles:
        file_dir = 'user-profile';
        break;
      case filePaths.posts:
        file_dir = 'posts';
        break;
      case filePaths.documents:
        file_dir = 'documents';
        break;
      case filePaths.enrollment:
        file_dir = 'enrollment';
        break;
      case filePaths.proofIds:
        file_dir = 'proof-ids';
        break;
      case filePaths.paymentProofs:
        file_dir = 'payment-proofs';
        break;
      case filePaths.uncategorized:
      default:
        file_dir = 'uncategorized';
    }
    const file_path = `${file_dir}/${filename}`;
    const fileUpload = storage.file(file_path);

    // Upload with Admin SDK
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
        },
      },
    });

    // Make file publicly accessible
    await fileUpload.makePublic();

    // Get the download URL
    const downloadURL = `https://storage.googleapis.com/${storage.name}/${file_path}`;

    const db_file_record = await prisma.files.create({
      data: {
        url: downloadURL,
        token: (() => {
          try {
            const urlObj = new URL(downloadURL);
            return urlObj.searchParams.get('token');
          } catch (e) {
            console.error('Failed to parse token from downloadURL:', e);
            return null;
          }
        })(),
        fileName: filename,
        originalName: file.originalname,
        directory: file_dir,
      },
    });

    return {
      success: true,
      database_ref: db_file_record,
      downloadURL,
      fileName: filename,
      originalName: file.originalname,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const uploadMultipleFiles = async (files, directory) => {
  try {
    const uploadedFiles = [];
    const failedFiles = [];
    for (const file of files) {
      const result = await uploadFile(file, directory).catch((error) => {
        console.error('Error uploading file:', error);
      });
      if (result.success === true) {
        uploadedFiles.push(result);
      } else {
        failedFiles.push(file.originalname);
      }
    }

    return {
      uploadedFiles,
      failedFiles,
    };
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};
