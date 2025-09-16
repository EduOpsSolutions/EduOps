import express from 'express';
import { createEnrollmentRequest, trackEnrollment } from '../../controller/enrollment_controller.js';
import { validateEnrollment } from '../../middleware/enrollmentValidator.js';
import { getEnrollmentRequests } from '../../controller/enrollment_controller.js';
import { verifyToken } from '../../utils/verifyToken.js';
import {
  validateIsActiveUser,
  validateUserIsAdmin,
} from '../../middleware/authValidator.js';

const router = express.Router();

router.post('/enroll', validateEnrollment, createEnrollmentRequest);
router.post('/track', trackEnrollment); // Public endpoint for enrollment tracking
router.get(
  '/requests',
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  getEnrollmentRequests
);
export { router };
