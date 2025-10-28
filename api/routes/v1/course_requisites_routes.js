import {
  validateLogin,
  validatePassword,
  validateUserIsAdmin,
  validateIsActiveUser,
} from "../../middleware/authValidator.js";
import { verifyToken } from "../../middleware/authValidator.js";
import courseRequisiteController from '../../controller/course_requisite_controller.js';
import express from 'express';
const router = express.Router();

router.get('/', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin,
    courseRequisiteController.listRequisites
);

router.post('/', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin,
    courseRequisiteController.createRequisite
);

router.put('/:id', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin,
    courseRequisiteController.updateRequisite
);

router.delete('/:id', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin,
    courseRequisiteController.deleteRequisite
);

export { router };