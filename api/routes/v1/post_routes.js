import express from 'express';
import {
  getPosts,
  createPost,
  updatePost,
  archivePost,
  unarchivePost,
  deletePost,
  addFilesToPost,
  deletePostFile,
} from '../../controller/post_controller.js';
import {
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
} from '../../middleware/authValidator.js';
import { uploadMultiple } from '../../middleware/multerMiddleware.js';

const router = express.Router();


// All users (students, teachers, admins) can view posts if active
router.get('/', 
  verifyToken, 
  validateIsActiveUser, 
  getPosts
);

// Admin-only post management
router.post('/create', 
  verifyToken, 
  validateIsActiveUser, 
  validateUserIsAdmin, 
  uploadMultiple('files', 5), 
  createPost
);

router.put('/:id', 
  verifyToken, 
  validateIsActiveUser, 
  validateUserIsAdmin, 
  updatePost
);

router.patch('/:id/archive', 
  verifyToken, 
  validateIsActiveUser, 
  validateUserIsAdmin, 
  archivePost
);

router.patch('/:id/unarchive', 
  verifyToken, 
  validateIsActiveUser, 
  validateUserIsAdmin, 
  unarchivePost
);

router.delete('/:id', 
  verifyToken, 
  validateIsActiveUser, 
  validateUserIsAdmin, 
  deletePost
);

// File management for posts (admin only)
router.post('/:id/files', 
  verifyToken, 
  validateIsActiveUser, 
  validateUserIsAdmin, 
  uploadMultiple('files', 5), 
  addFilesToPost
);

router.delete('/:postId/files/:fileId', 
  verifyToken, 
  validateIsActiveUser, 
  validateUserIsAdmin, 
  deletePostFile
);

export { router };
