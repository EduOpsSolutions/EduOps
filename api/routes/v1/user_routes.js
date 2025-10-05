import express from 'express';
const router = express.Router();
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  createStudentAccount,
  inspectEmailExists,
  searchStudentsForCoursePeriod,
  checkStudentScheduleConflicts,
} from '../../controller/user_controller.js';
import {
  validateUpdateUser,
  validateCreateUser,
} from '../../middleware/userValidator.js';

import { validateUserIsAdmin } from '../../middleware/authValidator.js';

import { verifyToken } from '../../utils/verifyToken.js';

/* GET users listing. */
router.post('/deactivate', verifyToken, validateUserIsAdmin, deactivateUser);
router.post('/activate', verifyToken, validateUserIsAdmin, activateUser);
router.get(
  '/inspect-email-exists',
  verifyToken,
  validateUserIsAdmin,
  inspectEmailExists
);
router.put(
  '/:id',
  verifyToken,
  validateUserIsAdmin,
  validateUpdateUser,
  updateUser
);
router.get('/validate-token', verifyToken, getAllUsers);
router.get('/', verifyToken, validateUserIsAdmin, getAllUsers);
router.get(
  '/search-students',
  verifyToken,
  (req, res, next) => {
    // allow admin and teacher
    const role = req.user?.data?.role;
    if (role === 'admin' || role === 'teacher') return next();
    return res
      .status(403)
      .json({ error: true, message: 'User is unauthorized' });
  },
  searchStudentsForCoursePeriod
);
router.post(
  '/students/conflicts',
  verifyToken,
  (req, res, next) => {
    const role = req.user?.data?.role;
    if (role === 'admin' || role === 'teacher') return next();
    return res
      .status(403)
      .json({ error: true, message: 'User is unauthorized' });
  },
  checkStudentScheduleConflicts
);
router.get('/:id', verifyToken, validateUserIsAdmin, getUserById);
router.post(
  '/create',
  verifyToken,
  validateUserIsAdmin,
  validateCreateUser,
  createUser
);
router.delete('/:id', verifyToken, validateUserIsAdmin, deleteUser);
router.post(
  '/create-student-account',
  verifyToken,
  validateUserIsAdmin,
  createStudentAccount
);

export { router };
