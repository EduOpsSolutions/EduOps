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
router.get('/', verifyToken, validateUserIsAdmin, getAllUsers);
router.get('/:id', verifyToken, validateUserIsAdmin, getUserById);
router.post(
  '/create/',
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
