import PromptModel from '../models/promptModel.js';
import openai from '../config/openaiConfig.js';

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

    // 4️⃣ Fetch from DB to confirm it's stored
    const fetched = await PromptModel.findById(savedPrompt._id);
    console.log("🔁 Fetched from DB:", fetched);

    return res.status(200).json({
      id: fetched._id,
      raw: fetched.promptText,
      structured: {
        type: fetched.type,
        brand: fetched.brand,
        color: fetched.color,
        features: fetched.features,
        details: fetched.details,
      },
    });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    return res.status(500).json({ error: 'Server error' });
  }
};