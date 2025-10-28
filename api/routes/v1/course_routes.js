import express from 'express';
import {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
} from '../../controller/course_controller.js';
import {
  validateLogin,
  validatePassword,
  validateUserIsAdmin,
  validateIsActiveUser,
  verifyToken
} from "../../middleware/authValidator.js";

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourse);

router.post('/create', 
    verifyToken,
    validateIsActiveUser,
    validateUserIsAdmin,
    createCourse
);


router.put('/:id',
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin,
    updateCourse
);

router.delete('/delete/:id',
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin, 
    deleteCourse
);

export { router };