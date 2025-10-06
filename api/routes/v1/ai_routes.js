import express from 'express';
import { askGemini } from '../../controller/ai_controller.js';

export const router = express.Router();

router.post('/ask', askGemini);

export default router;
