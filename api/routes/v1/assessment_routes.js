import express from 'express';
const router = express.Router();
import assessmentController from '../../controller/assessment_controller.js';
import {
  validateLogin,
  validatePassword,
  validateUserIsAdmin,
  validateIsActiveUser,
  validateUserIsStudent
} from "../../middleware/authValidator.js";
import { verifyToken } from "../../middleware/authValidator.js";
import { validate } from 'uuid';

router.get('/:studentId', 
    verifyToken, 
    validateIsActiveUser, 
    //validateUserIsAdmin,
    assessmentController.getAssessmentByStudent
);

router.get('/student/:studentId',
    verifyToken,
    validateIsActiveUser,
    validateUserIsStudent,
    assessmentController.getAllAssessmentsForStudent
);

router.get('/', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin, 
    assessmentController.listAssessments
);

export { router };