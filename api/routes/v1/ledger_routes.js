import express from 'express';
import {
  validateLogin,
  validatePassword,
  validateUserIsAdmin,
  validateIsActiveUser,
  verifyToken
} from "../../middleware/authValidator.js";
import { getStudentsWithOngoingPeriod } from '../../controller/ledger_controller.js';

const router = express.Router();

router.get('/students/ongoing',
    verifyToken,
    validateIsActiveUser,
    validateUserIsAdmin,
    getStudentsWithOngoingPeriod
);

export { router };