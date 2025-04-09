import PromptModel from '../models/promptModel.js';
import ImagePromptModel from '../models/imagePromptModel.js';
import openai from '../config/openaiConfig.js';
import { calculateMatchScore } from '../services/comparePrompts.js';

export const handlePromptSubmit = async (req, res) => {
  const { promptText } = req.body;

  if (!promptText) {
    return res.status(400).json({ error: '❌ Prompt text is required' });
  }

  console.log("📥 Received prompt from frontend:", promptText);

  try {
    // 🧠 1. Ask GPT to extract structured info
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `
You are a lost & found assistant.

Analyze this user prompt: "${promptText}"

Extract and return a JSON object with the following:
{
  "type": "",
  "brand": "",
  "color": "",
  "features": [],
  "details": []
}
If any information is missing, leave it blank or an empty array.
          `,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    // 2️⃣ Parse structured output from GPT
    const structured = JSON.parse(gptResponse.choices[0].message.content);
    console.log("🧠 Structured JSON from GPT:", structured);

    // 3️⃣ Save full object to MongoDB
    const savedPrompt = await PromptModel.create({
      promptText,
      ...structured,
    });

    console.log("📦 Saved to MongoDB:", savedPrompt);

    // 4️⃣ Match against stored image prompts
    const allImages = await ImagePromptModel.find();
    let bestMatch = null;
    let bestScore = 0;

    for (const image of allImages) {
      const score = calculateMatchScore(structured, image.structured);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = image;
      }
    }



    if (bestMatch) {
      console.log("🎯 Best Match Found:");
      console.log("📷 Filename:", bestMatch.filename);
      console.log("🧠 Structured JSON:", JSON.stringify(bestMatch.structured, null, 2));
    } else {
      console.log("❌ No match found in image prompts.");
    }

    // 5️⃣ Send response back to frontend
    return res.status(200).json({
      id: savedPrompt._id,
      raw: savedPrompt.promptText,
      structured: {
        type: savedPrompt.type,
        brand: savedPrompt.brand,
        color: savedPrompt.color,
        features: savedPrompt.features,
        details: savedPrompt.details,
      },
      match: bestMatch ? {
        imageUrl: `/api/uploads/${bestMatch.filename}`,
        imageJson: bestMatch.structured,
        matchScore: bestScore,
      } : null
    });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    return res.status(500).json({ error: 'Server error' });
  }
};