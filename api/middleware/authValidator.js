import Joi from 'joi';
import { verifyJWT } from '../utils/jwt.js';
import * as jose from 'jose';

const loginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8).max(100),
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
};
