import Joi from 'joi';
import { verifyJWT } from '../utils/jwt.js';
import * as jose from 'jose';

const loginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8).max(100),
});

const changePasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  oldPassword: Joi.string().min(8).max(100).required(),
  newPassword: Joi.string().min(8).max(100).required(),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res
      .status(400)
      .json({ error: true, message: 'Invalid email or password' });
  }

  next();
};

const validateIsActiveUser = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (decoded.payload.data.status !== 'active') {
    return res.status(403).json({
      error: true,
      message: `Account is ${decoded.payload.data.status}`,
    });
  }
  next();
};

const validateUserIsAdmin = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (decoded.payload.data.status !== 'active') {
    return res.status(403).json({
      error: true,
      message: `Account is ${decoded.payload.data.status}`,
    });
  }
  if (decoded.payload.data.role !== 'admin') {
    console.log('decoded', decoded);
    return res
      .status(403)
      .json({ error: true, message: 'User is unauthorized' });
  }
  next();
};

const validateUserIsTeacher = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (decoded.payload.data.status !== 'active') {
    return res.status(403).json({
      error: true,
      message: `Account is ${decoded.payload.data.status}`,
    });
  }
  if (decoded.payload.data.role !== 'teacher') {
    return res
      .status(403)
      .json({ error: true, message: 'User is unauthorized' });
  }
  next();
};

const validateUserIsStudent = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (decoded.payload.data.status !== 'active') {
    return res.status(403).json({
      error: true,
      message: `Account is ${decoded.payload.data.status}`,
    });
  }
  if (decoded.payload.data.role !== 'student') {
    return res
      .status(403)
      .json({ error: true, message: 'User is unauthorized' });
  }
  next();
};

const verifyToken = async (req, res, next) => {
  try {
    // check in headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'TOKEN_ERR',
      });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'TOKEN_ERR',
    });
  }
};

const validatePassword = (req, res, next) => {
  const { error } = changePasswordSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({ error: true, message: 'Invalid password' });
  }
  next();
};

const extractUserIdFromToken = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'No valid authorization token provided',
      });
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];

    // Verify and decode the token
    const decoded = await verifyJWT(token);

    if (!decoded || !decoded.payload) {
      return res.status(401).json({
        error: true,
        message: 'Invalid or expired token',
      });
    }

    // Extract user ID from the decoded payload
    const userId = decoded.payload.data.id;

    // Log the user ID for debugging purposes
    console.log('🔑 Extracted User ID from token:', userId);
    console.log('📋 Full user data from token:', decoded.payload.data);

    // Add the user ID to the request object for controllers to use
    req.userId = userId;
    req.userData = decoded.payload.data; // Also provide full user data if needed

    next();
  } catch (error) {
    console.error('❌ Error extracting user ID from token:', error.message);
    return res.status(401).json({
      error: true,
      message: 'Failed to extract user information from token',
    });
  }
};

export {
  validateLogin,
  validateUserIsAdmin,
  validateUserIsTeacher,
  validateUserIsStudent,
  verifyToken,
  validateIsActiveUser,
  validatePassword,
  extractUserIdFromToken,
};
