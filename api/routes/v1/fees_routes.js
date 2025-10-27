import express from 'express';
import { 
    listCourseBatchPairs, 
    listFees, 
    addFee, 
    updateFee, 
    deleteFee 
} from '../../controller/fees_controller.js';
import { verifyToken, validateIsActiveUser, validateUserIsAdmin } from '../../middleware/authValidator.js';

const router = express.Router();

router.get('/course-batches', 
    verifyToken, 
    validateIsActiveUser, 
    validateUserIsAdmin, 
    listCourseBatchPairs
);

router.get('/',
    verifyToken,
    validateIsActiveUser,
    validateUserIsAdmin,
    listFees
);

router.post('/',
    verifyToken,
    validateIsActiveUser,
    validateUserIsAdmin,
    addFee
);

router.put('/:id',
    verifyToken,
    validateIsActiveUser,
    validateUserIsAdmin,
    updateFee
);

router.delete('/:id',
    verifyToken,
    validateIsActiveUser,
    validateUserIsAdmin,
    deleteFee
);

export { router };

