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
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `
You are a lost & found assistant.

Analyze this user prompt: "${promptText}"

Extract and return only the following JSON format:
{
  "type": "",
  "brand": "",
  "color": "",
  "features": [],
  "details": []
}
Do not include any explanation.
          `,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    // ✅ Clean and extract JSON from GPT response
    const rawContent = gptResponse.choices[0].message.content;
    console.log("📩 Raw GPT response:", rawContent);

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in GPT response");

    const structured = JSON.parse(jsonMatch[0]);
    console.log("🧠 Structured JSON from GPT:", structured);

    // 💾 Save to MongoDB
    const savedPrompt = await PromptModel.create({
      promptText,
      ...structured,
    });
    console.log("📦 Saved to MongoDB:", savedPrompt);

    // 🔍 Match against image prompts
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

    // ✅ Final structured response
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
        description: bestMatch.description || "No description provided.",
        location: bestMatch.location || "Unknown location",
        postedBy: bestMatch.postedBy || "Unknown authority",
        postedAt: bestMatch.createdAt,
      } : null
    });

  } catch (err) {
    console.error("❌ Server error:", err.message);
    return res.status(500).json({ error: 'Server error' });
  }
};