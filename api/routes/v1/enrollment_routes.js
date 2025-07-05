import express from 'express';
import { createEnrollmentRequest } from '../../controller/enrollment_controller.js';
import { validateEnrollment } from '../../middleware/enrollmentValidator.js';
import { getEnrollmentRequests } from '../../controller/enrollment_controller.js';

const router = express.Router();

router.post('/enroll', validateEnrollment, createEnrollmentRequest);
router.get('/requests', getEnrollmentRequests);
export { router };
