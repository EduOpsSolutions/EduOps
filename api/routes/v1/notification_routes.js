import express from 'express';
import { getNotifications, markAsRead, createNotification } from '../../controller/notification_controller.js';
import {
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  validateUserIsTeacher,
  validateUserIsStudent,
} from '../../middleware/authValidator.js';


const router = express.Router();

// Get notifications for current user
router.get('/', 
    verifyToken, 
    getNotifications
);

// Mark a notification as read
router.post('/mark-read', 
    verifyToken, 
    markAsRead
);

// Create a notification
router.post('/', 
    verifyToken, 
    validateIsActiveUser,
    validateUserIsAdmin,
    createNotification
);

export { router };