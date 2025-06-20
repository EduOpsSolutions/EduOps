import express from 'express';
import {
    getCoursesForPeriod,
    addCourseToPeriod,
    removeCourseFromPeriod,
} from '../../controller/academic_period_courses_controller.js';

const router = express.Router();

router.get('/:periodId/courses', getCoursesForPeriod);
router.post('/:periodId/courses', addCourseToPeriod);
router.delete('/:periodId/courses/:id', removeCourseFromPeriod);

export { router };
