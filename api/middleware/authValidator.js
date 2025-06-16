import Joi from 'joi';
import { verifyJWT } from '../utils/jwt.js';

const loginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(8).max(100),
});

export const validateLogin = (req, res, next) => {
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

export const validateUserIsAdmin = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (decoded.payload.data.role !== 'admin') {
    console.log('decoded', decoded);
    return res
      .status(403)
      .json({ error: true, message: 'User is unauthorized' });
  }
  next();
};

export const validateUserIsTeacher = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (decoded.payload.data.role !== 'teacher') {
    return res
      .status(403)
      .json({ error: true, message: 'User is unauthorized' });
  }
  next();
};

export const validateUserIsStudent = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await verifyJWT(token);
  if (decoded.payload.data.role !== 'student') {
    return res
      .status(403)
      .json({ error: true, message: 'User is unauthorized' });
  }
  next();
};
