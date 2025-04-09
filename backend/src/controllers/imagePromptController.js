// ✅ backend/src/controllers/imagePromptController.js
import ImagePromptModel from '../models/imagePromptModel.js';
import openai from '../config/openaiConfig.js';
import fs from 'fs';

export const handleImageUpload = async (req, res) => {
  try {
    const { filename, path } = req.file;

    // Step 1: Fake label analysis — later can plug in actual CV logic
    const fakeLabels = ['black', 'Logitech', 'mouse', 'scratched', 'USB'];

    // Step 2: Use ChatGPT to turn labels into structured JSON
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `
Analyze these labels from an image: ${fakeLabels.join(', ')}
Convert them into JSON with:
{
  "type": "",
  "brand": "",
  "color": "",
  "features": [],
  "details": []
}
If any data is missing, leave it empty.
          `,
        },
      ],
      temperature: 0.3,
    });

    const structured = JSON.parse(gptResponse.choices[0].message.content);

    // Step 3: Save to DB
    const saved = await ImagePromptModel.create({
      filename,
      rawLabels: fakeLabels,
      structured,
    });

    console.log("🧠 Structured Image JSON:", structured);

    res.status(200).json({ id: saved._id, structured });
  } catch (err) {
    console.error("❌ Error in image controller:", err.message);
    res.status(500).json({ error: 'Image processing failed' });
  }
};