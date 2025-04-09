// ✅ backend/src/config/openaiConfig.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // Ensure environment variables are loaded

// Check if the API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing from your .env file");
  process.exit(1); // Stop the server if the key is missing
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;