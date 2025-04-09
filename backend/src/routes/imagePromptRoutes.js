// ✅ backend/src/routes/imagePromptRoutes.js
import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { handleImageUpload } from '../controllers/imagePromptController.js';

const router = express.Router();

router.post('/upload', upload.single('image'), handleImageUpload);

export default router;