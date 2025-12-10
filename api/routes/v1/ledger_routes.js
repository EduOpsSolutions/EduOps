import express from 'express';
import {
  validateLogin,
  validatePassword,
  validateUserIsAdmin,
  validateIsActiveUser,
  validateUserIsTeacher,
  verifyToken
} from "../../middleware/authValidator.js";
import { getStudentsWithOngoingPeriod, getStudentLedger, getTeacherLedger } from '../../controller/ledger_controller.js';

const router = express.Router();

router.get('/students/ongoing',
    verifyToken,
    validateIsActiveUser,
    validateUserIsAdmin,
    getStudentsWithOngoingPeriod
);

router.get('/student/:studentId',
    verifyToken,
    validateIsActiveUser,
    //validateUserIsAdmin,
    getStudentLedger
);

router.get('/teacher/:teacherId',
    verifyToken,
    validateIsActiveUser,
    // validateUserIsTeacher,
    getTeacherLedger
);

export { router };