import express from 'express';
import { askGemini, generateAIReport } from '../../controller/ai_controller.js';
import { verifyToken } from '../../utils/verifyToken.js';
import { validateUserIsAdmin } from '../../middleware/authValidator.js';

export const router = express.Router();

router.post('/ask', verifyToken, validateUserIsAdmin, askGemini);
router.post('/generate-report', verifyToken, validateUserIsAdmin, generateAIReport);

export default router;
