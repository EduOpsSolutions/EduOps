import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';

import { initializeApp } from 'firebase/app';
import { filePaths } from '../constants/file_paths.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTHDOMAIN,
  projectId: process.env.FIREBASE_PROJECTID,
  storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
  appId: process.env.FIREBASE_APPID,
  measurementId: process.env.FIREBASE_MEASUREMENTID,
};

const firebaseApp = initializeApp(firebaseConfig);

export const storage = getStorage(firebaseApp);

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
    const storageRef = ref(storage, `${file_dir}/${filename}`);
    const uploadTask = await uploadBytesResumable(storageRef, fileBuffer);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

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
