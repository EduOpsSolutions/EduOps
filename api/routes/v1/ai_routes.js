import express from 'express';
import { askGemini } from '../../controller/ai_controller.js';
import { verifyToken } from '../../utils/verifyToken.js';
import { validateUserIsAdmin } from '../../middleware/authValidator.js';

export const router = express.Router();

router.post('/ask', verifyToken, validateUserIsAdmin, askGemini);

export default router;
