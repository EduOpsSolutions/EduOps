import express from 'express';
import {
  getLogs,
  getLogById,
  updateLog,
  deleteLog,
  bulkDeleteLogs
} from '../../controller/logs_controller.js';
import {
  verifyToken,
  validateUserIsAdmin,
  validateIsActiveUser
} from '../../middleware/authValidator.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(verifyToken); // Verify JWT token
router.use(validateIsActiveUser); // Ensure user account is active
router.use(validateUserIsAdmin); // Ensure user is admin

// Logs management (admin only)
router.get('/', getLogs); // Get all logs with filtering and pagination
router.get('/:id', getLogById); // Get a specific log by ID
router.put('/:id', updateLog); // Update a log (for corrections)
router.delete('/:id', deleteLog); // Soft delete a log
router.post('/bulk-delete', bulkDeleteLogs); // Bulk soft delete multiple logs

export { router };
