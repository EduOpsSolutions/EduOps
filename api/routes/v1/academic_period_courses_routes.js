import express from 'express';
import {
    getCoursesForPeriod,
    addCourseToPeriod,
    removeCourseFromPeriod,
} from '../../controller/academic_period_courses_controller.js';
import {
  validateLogin,
  validatePassword,
  validateUserIsAdmin,
  validateIsActiveUser,
  verifyToken
} from "../../middleware/authValidator.js";


const router = express.Router();

router.get('/:periodId/courses', getCoursesForPeriod);

router.post('/:periodId/courses', 
    verifyToken,
    validateIsActiveUser,
    validateUserIsAdmin,
    addCourseToPeriod

);
router.delete('/:periodId/courses/:id', 
    verifyToken,
    validateIsActiveUser,
    validateUserIsAdmin,
    removeCourseFromPeriod
);

export { router };
