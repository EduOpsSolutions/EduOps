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

// Document management role-based access functions
const validateUserRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.data?.role;

    if (!userRole) {
      return res.status(401).json({
        error: true,
        message: 'User role not found',
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: true,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

const validateDocumentAccess = (operation = 'read') => {
  return async (req, res, next) => {
    try {
      const userRole = req.user?.data?.role;
      const documentId = req.params.id || req.body.documentId;

      if (!documentId) {
        return res.status(400).json({
          error: true,
          message: 'Document ID is required',
        });
      }

      const { default: DocumentModel } = await import(
        '../model/document_model.js'
      );
      const document = await DocumentModel.getDocumentTemplateById(documentId);

      if (!document) {
        return res.status(404).json({
          error: true,
          message: 'Document not found',
        });
      }

      const accessRules = {
        admin: ['public', 'student', 'teacher', 'admin'],
        teacher: ['public', 'teacher'],
        student: ['public', 'student'],
      };

      const userAccess = accessRules[userRole] || accessRules.student;

      if (!userAccess.includes(document.privacy.toLowerCase())) {
        return res.status(403).json({
          error: true,
          message:
            'Access denied. Insufficient permissions to access this document.',
        });
      }

      req.document = document;
      next();
    } catch (error) {
      console.error('Document access validation error:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to validate document access',
      });
    }
  };
};

export {
  validateLogin,
  validateUserIsAdmin,
  validateUserIsTeacher,
  validateUserIsStudent,
  verifyToken,
  validateIsActiveUser,
  validatePassword,
  validateUserRole,
  validateDocumentAccess,
};
