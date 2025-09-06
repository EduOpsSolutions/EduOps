import express from 'express';
import { uploadSingle } from '../../middleware/multerMiddleware.js';
import { uploadFileController } from '../../controller/upload_controller.js';
import { uploadMultiple } from '../../middleware/multerMiddleware.js';
import { uploadMultipleFilesController } from '../../controller/upload_controller.js';
import { verifyToken } from '../../middleware/authValidator.js';
import { validateWebClientOrigin } from '../../middleware/webClientValidator.js';

const router = express.Router();

//recommended for single upload
router.post('/', uploadSingle('file'), verifyToken, uploadFileController);

//recommended for multiple files
router.post(
  '/multiple',
  uploadMultiple('files'),
  verifyToken,
  uploadMultipleFilesController
);

//restricted to web client only - for enrollment form use only
router.post(
  '/guest',
  validateWebClientOrigin,
  uploadSingle('file'),
  uploadFileController
);
router.post(
  '/guest/multiple',
  validateWebClientOrigin,
  uploadMultiple('files'),
  uploadMultipleFilesController
);

export { router };
