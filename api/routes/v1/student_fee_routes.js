import express from 'express';
import multerMiddleware from '../../middleware/multerMiddleware.js';
import {
  verifyToken,
  validateUserIsAdmin,
  validateUserIsTeacher,
  validateUserIsStudent,
  validateIsActiveUser
} from '../../middleware/authValidator.js';
import studentFee from '../../controller/student_fee_controller.js';
const router = express.Router();

router.get('/',
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  studentFee.listStudentFees
);

router.get('/student/:studentId',
  verifyToken,
  validateIsActiveUser,
  validateUserIsStudent,
  studentFee.getStudentFee
);

router.post('/',
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  studentFee.createStudentFee
);

router.put('/:id',
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  studentFee.updateStudentFee
);

router.delete('/:id',
  verifyToken,
  validateIsActiveUser,
  validateUserIsAdmin,
  studentFee.deleteStudentFee
);

export { router };