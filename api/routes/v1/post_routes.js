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
import { verifyToken, validateIsActiveUser } from '../../middleware/authValidator.js';
import { uploadMultiple } from '../../middleware/multerMiddleware.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/', getPosts); // Get all posts with optional filtering

// Protected routes (require authentication)
router.use(verifyToken); // Apply authentication to all routes below
router.use(validateIsActiveUser); // Ensure user account is active

// Post management
router.post('/create', uploadMultiple('files', 5), createPost); // Create post with up to 5 files
router.put('/:id', updatePost); // Update post
router.patch('/:id/archive', archivePost); // Archive post
router.patch('/:id/unarchive', unarchivePost); // Unarchive post
router.delete('/:id', deletePost); // Delete post (soft delete)

// File management for posts
router.post('/:id/files', uploadMultiple('files', 5), addFilesToPost); // Add files to existing post
router.delete('/:postId/files/:fileId', deletePostFile); // Delete specific file from post


export { router };
