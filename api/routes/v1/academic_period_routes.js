import express from 'express';
import {
    getAcademicPeriods,
    getAcademicPeriod,
    createAcademicPeriod,
    updateAcademicPeriod,
    deleteAcademicPeriod,
    endEnrollment,
} from '../../controller/academic_period_controller.js';
import {
    verifyToken,
    validateIsActiveUser,
    validateUserIsAdmin
} from '../../middleware/authValidator.js';

const router = express.Router();

// Anyone logged in and active can view periods
router.get('/', 
    // verifyToken, 
    // validateIsActiveUser, 
    getAcademicPeriods
);
router.get('/:id', 
    verifyToken, 
    validateIsActiveUser, 
    getAcademicPeriod
);

// Only admins can create, update, delete, or end enrollment
router.post('/create', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin, 
    createAcademicPeriod
);
router.put('/:id', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin, 
    updateAcademicPeriod
);
router.patch('/:id/end-enrollment', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin, 
    endEnrollment
);
router.delete('/delete/:id', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin, 
    deleteAcademicPeriod
);

export { router };