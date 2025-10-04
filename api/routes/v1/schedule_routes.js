import express from 'express';
import {
  getSchedules,
  getSchedule,
  getSchedulesByPeriod,
  getSchedulesByTeacher,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../../controller/schedule_controller.js';
import {
  validateCreateSchedule,
  validateUpdateSchedule,
  validateTimeConstraints,
  validateDateBoundaries,
} from '../../middleware/scheduleValidator.js';
import {
  verifyToken,
  validateUserIsAdmin,
} from '../../middleware/authValidator.js';

const router = express.Router();

/**
 * GET /api/v1/schedules
 * Get all schedules
 * Public route - anyone can view schedules
 */
router.get('/', verifyToken, getSchedules);

/**
 * GET /api/v1/schedules/:id
 * Get a single schedule by ID
 * Public route - anyone can view a schedule
 */
router.get('/:id', verifyToken, getSchedule);

/**
 * GET /api/v1/schedules/period/:periodId
 * Get schedules by academic period
 * Public route - anyone can view schedules by period
 */
router.get('/period/:periodId', verifyToken, getSchedulesByPeriod);

/**
 * GET /api/v1/schedules/teacher/:teacherId
 * Get schedules by teacher
 * Public route - anyone can view schedules by teacher
 */
router.get('/teacher/:teacherId', verifyToken, getSchedulesByTeacher);

/**
 * POST /api/v1/schedules
 * Create a new schedule
 * Admin-only route
 */
router.post(
  '/',
  verifyToken,
  validateUserIsAdmin,
  validateCreateSchedule,
  validateTimeConstraints,
  validateDateBoundaries,
  createSchedule
);

/**
 * PUT /api/v1/schedules/:id
 * Update a schedule
 * Admin-only route
 */
router.put(
  '/:id',
  verifyToken,
  validateUserIsAdmin,
  validateUpdateSchedule,
  validateTimeConstraints,
  validateDateBoundaries,
  updateSchedule
);

/**
 * DELETE /api/v1/schedules/:id
 * Delete a schedule (soft delete)
 * Admin-only route
 */
router.delete('/:id', verifyToken, validateUserIsAdmin, deleteSchedule);

export { router };
