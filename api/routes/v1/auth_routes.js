import express from 'express';
const router = express.Router();
import {
  login,
  register,
  forgotPassword,
  changePassword,
  resetPassword,
  requestResetPassword,
  adminResetPassword,
} from '../../controller/auth_controller.js';
import {
  validateLogin,
  validatePassword,
  validateUserIsAdmin,
  validateIsActiveUser,
} from '../../middleware/authValidator.js';
import { verifyToken } from '../../middleware/authValidator.js';

router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/register', register);
router.post('/change-password', validatePassword, verifyToken, changePassword);
router.post('/reset-password', verifyToken, resetPassword);

router.post(
  '/admin-reset-password',
  verifyToken,
  validateUserIsAdmin,
  validateIsActiveUser,
  adminResetPassword
);

router.post('/request-reset-password', requestResetPassword);

//for token verification
router.get('/verify', verifyToken, (req, res) => {
  try {
    // If we reach here, the token is valid (verifyToken passed)
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: req.user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token verification failed',
    });
  }
});

router.get('/verify-token', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user,
  });
});

export { router };
