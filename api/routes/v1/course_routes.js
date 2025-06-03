import express from 'express';
import {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
} from '../../controller/course_controller.js';


const router = express.Router();

//router.use(validateLogin);

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/create', createCourse);
router.put('/:id', updateCourse);
router.delete('/delete/:id', deleteCourse);

export { router };