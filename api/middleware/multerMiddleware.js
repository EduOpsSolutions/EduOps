import multer from 'multer';
import path from 'path';

// Multer storage configuration - using memory storage
const storage = multer.memoryStorage();

// File filter function for validation
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.pdf',
    '.doc',
    '.docx',
  ];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`
      ),
      false
    );
  }
};

// Multer configuration with file size limits
const multerConfig = {
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 5, // Maximum 5 files
  },
};

// Create multer instance
const upload = multer(multerConfig);

// Middleware functions for different upload scenarios
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: true,
            message: 'File too large. Maximum size is 100MB.',
          });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            error: true,
            message: 'Unexpected field name for file upload.',
          });
        }
        return res.status(400).json({
          error: true,
          message: `Upload error: ${error.message}`,
        });
      } else if (error) {
        return res.status(400).json({
          error: true,
          message: error.message,
        });
      }
      next();
    });
  };
};

export const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: true,
            message:
              'One or more files are too large. Maximum size is 100MB per file.',
          });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: true,
            message: `Too many files. Maximum is ${maxCount} files.`,
          });
        }
        return res.status(400).json({
          error: true,
          message: `Upload error: ${error.message}`,
        });
      } else if (error) {
        return res.status(400).json({
          error: true,
          message: error.message,
        });
      }
      next();
    });
  };
};

export const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: true,
            message:
              'One or more files are too large. Maximum size is 100MB per file.',
          });
        }
        return res.status(400).json({
          error: true,
          message: `Upload error: ${error.message}`,
        });
      } else if (error) {
        return res.status(400).json({
          error: true,
          message: error.message,
        });
      }
      next();
    });
  };
};

export default upload;
