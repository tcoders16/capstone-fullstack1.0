// backend/src/routes/reportRoutes.js

import express from 'express';
import { handlePromptSubmit } from '../controllers/promptController.js';

const router = express.Router();

// POST /api/prompts/report
// Actual route handler
router.post('/', handlePromptSubmit);

export default router;
