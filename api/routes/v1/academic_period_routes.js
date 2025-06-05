import express from 'express';
import {
    getAcademicPeriods,
    getAcademicPeriod,
    createAcademicPeriod,
    updateAcademicPeriod,
    deleteAcademicPeriod,
} from '../../controller/academic_period_controller.js';

const router = express.Router();

router.get('/', getAcademicPeriods);
router.get('/:id', getAcademicPeriod);
router.post('/create', createAcademicPeriod);
router.put('/:id', updateAcademicPeriod);
router.delete('/delete/:id', deleteAcademicPeriod);


export { router };