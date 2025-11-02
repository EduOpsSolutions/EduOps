import express from 'express';
import {
  getSchedules,
  getSchedule,
  getSchedulesByPeriod,
  getSchedulesByTeacher,
  getMySchedules,
  getScheduleStudents,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  addStudentToSchedule,
  removeStudentsFromSchedule,
  validateBulkStudents,
  bulkAddStudentsToSchedule,
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
 * GET /api/v1/schedules/teacher/:teacherId
 * Get schedules by teacher
 * Public route - anyone can view schedules by teacher
 */
router.get('/teacher/:teacherId', verifyToken, getSchedulesByTeacher);

/**
 * GET /api/v1/schedules/mine
 * Get schedules for the logged-in student
 */
router.get('/mine', verifyToken, getMySchedules);

/**
 * GET /api/v1/schedules/:id/students
 * Get students enrolled in a schedule (read-only)
 */
router.get('/:id/students', verifyToken, getScheduleStudents);

/**
 * GET /api/v1/schedules/period/:periodId
 * Get schedules by academic period
 * Public route - anyone can view schedules by period
 */
router.get('/period/:periodId', verifyToken, getSchedulesByPeriod);
/**
 * GET /api/v1/schedules/:id
 * Get a single schedule by ID
 * Public route - anyone can view a schedule
 */
router.get('/:id', verifyToken, getSchedule);

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

/**
 * POST /api/v1/schedules/:id/students
 * Attach a student to a schedule
 * Admins can attach students
 */
router.post(
  '/:id/students',
  verifyToken,
  validateUserIsAdmin,
  addStudentToSchedule
);

/**
 * POST /api/v1/schedules/:id/students:batch-delete
 * Batch remove students from a schedule
 * Admins can remove students
 */
router.post(
  '/:id/students:batch-delete',
  verifyToken,
  validateUserIsAdmin,
  removeStudentsFromSchedule
);

/**
 * POST /api/v1/schedules/:id/students:validate-bulk
 * Validate bulk student IDs from CSV
 * Admins can validate students
 */
router.post(
  '/:id/students:validate-bulk',
  verifyToken,
  validateUserIsAdmin,
  validateBulkStudents
);

/**
 * POST /api/v1/schedules/:id/students:bulk-add
 * Bulk add students to schedule
 * Admins can bulk add students
 */
router.post(
  '/:id/students:bulk-add',
  verifyToken,
  validateUserIsAdmin,
  bulkAddStudentsToSchedule
);

export { router };
