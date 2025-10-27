import express from 'express';
const router = express.Router();
import assessmentController from '../../controller/assessment_controller.js';
import {
  validateLogin,
  validatePassword,
  validateUserIsAdmin,
  validateIsActiveUser,
} from "../../middleware/authValidator.js";
import { verifyToken } from "../../middleware/authValidator.js";

router.get('/:studentId', 
    verifyToken, 
    validateIsActiveUser, 
    assessmentController.getAssessmentByStudent
);

router.get('/', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin, 
    assessmentController.listAssessments
);

export { router };