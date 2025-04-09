// ✅ backend/src/controllers/imagePromptController.js
import ImagePromptModel from '../models/imagePromptModel.js';
import openai from '../config/openaiConfig.js';
import fs from 'fs';
import path from 'path';

export const handleImageUpload = async (req, res) => {
  try {
    const { filename, path: imagePath } = req.file;
    console.log("📸 Received image:", filename);

    // 🖼 Convert image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg'; // optionally detect

    // 🔍 Step 1: Ask GPT-4 Vision to analyze the image
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // replace if using a different one
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Please analyze this image and identify the object.
Extract and return only a valid JSON object in this format:
{
  "type": "",
  "brand": "",
  "color": "",
  "features": [],
  "details": []
}
DO NOT include any explanations. Only JSON output.
              `,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const rawContent = gptResponse.choices[0].message.content;
    console.log("📩 Raw GPT Vision response:", rawContent);

    // 🧠 Extract JSON from response
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ GPT response did not contain valid JSON.");
      return res.status(400).json({ error: 'Invalid JSON response from GPT Vision' });
    }

    const structured = JSON.parse(jsonMatch[0]);
    console.log("🧠 Structured Image JSON:", structured);

    // 💾 Save to DB
    const saved = await ImagePromptModel.create({
      filename,
      rawLabels: [], // Add raw vision labels if using any
      structured,
    });

    return res.status(200).json({ id: saved._id, structured });

  } catch (err) {
    console.error("❌ Error in GPT Vision analysis:", err.message);
    return res.status(500).json({ error: 'Image analysis failed' });
  }
};