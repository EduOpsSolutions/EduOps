import { verifyJWT } from './jwt.js';

export const verifyToken = async (req, res, next) => {
  console.log('AUTHORIZATION', req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  try {
    const { payload, expired } = await verifyJWT(token);
    console.log('RESULT', payload, expired);
    if (!payload && expired) {
      return res.status(401).json({
        error: true,
        message: 'Token expired. Please login again.',
        error_message: 'Token expired. Please login again.',
      });
    }
    if (!payload && !expired) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token. Please login again.',
        error_message: 'Invalid token. Please login again.',
      });
    }
    if (!payload && expired) {
      return res.status(401).json({
        error: true,
        message: 'Token expired. Please login again.',
        error_message: 'Token expired. Please login again.',
      });
    }
    if (expired) {
      return res.status(401).json({
        error: true,
        message: 'Token expired. Please login again.',
        error_message: 'Token expired. Please login again.',
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    //log system error here
    return res.status(500).json({
      error: true,
      message: 'Internal server error. Failed to verify token',
    });
  }
};
