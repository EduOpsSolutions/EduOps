import express from 'express';
import {
  getGradesByCourse,
  setOrUpdateGrade,
  uploadGradeFile,
  getGradeFiles,
  approveGrade,
  getStudentsBySchedule,
  getGradesByStudent,
  updateGradesVisibility
} from '../../controller/grades_controller.js';
import multerMiddleware from '../../middleware/multerMiddleware.js';
import {
  verifyToken,
  validateUserIsAdmin,
  validateUserIsTeacher,
  validateUserIsStudent,
} from '../../middleware/authValidator.js';

const router = express.Router();

// Students Grade
router.get(
    '/student/:studentId',
    verifyToken,
    validateUserIsStudent,
    getGradesByStudent
);

// List all students and their grades for a course (admin, teacher, student)
router.get(
  '/course/:courseId',
  verifyToken,
  getGradesByCourse
);

// List all students in a schedule for grading (admin)
router.get(
  '/schedule/:scheduleId',
  verifyToken,
  validateUserIsAdmin,
  getStudentsBySchedule
);

// Set or update a student's grade (admin)
router.post(
  '/',
  verifyToken,
  validateUserIsAdmin,
  setOrUpdateGrade
);

// Upload a grade breakdown file (admin)
router.post(
  '/:studentGradeId/files',
  verifyToken,
  validateUserIsAdmin,
  multerMiddleware.single('file'),
  uploadGradeFile
);

// List/download files for a grade (admin, teacher, student)
router.get(
  '/:studentGradeId/files',
  verifyToken,
  getGradeFiles
);

// Approve a grade (admin)
router.post(
  '/:studentGradeId/approve',
  verifyToken,
  validateUserIsAdmin,
  approveGrade
);

// Update grades visibility for a course/period (admin)
router.patch(
  '/visibility',
  verifyToken,
  validateUserIsAdmin,
  updateGradesVisibility
);

export { router };
