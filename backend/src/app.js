// ✅ backend/src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import imagePromptRoutes from './routes/imagePromptRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config(); // Load .env variables

const app = express();

// Path fix for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded images statically
app.use('/api/uploads', express.static(path.join(__dirname, './uploads')));

// ✅ Route mounting
app.use('/api/prompt/report', reportRoutes);         // POST /api/prompt/report
app.use('/api/images', imagePromptRoutes);           // POST /api/images/upload

// ✅ MongoDB Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});