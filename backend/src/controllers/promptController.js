// ✅ controllers/promptController.js
import PromptModel from '../models/promptModel.js';
import ImagePromptModel from '../models/imagePromptModel.js';
import openai from '../config/openaiConfig.js';
import { calculateMatchScore } from '../services/comparePrompts.js';

const THRESHOLD = 0.65;

export const handlePromptSubmit = async (req, res) => {
  const { promptText } = req.body;
  if (!promptText) return res.status(400).json({ error: '❌ Prompt text is required' });

  try {
    console.log("📥 Received prompt from frontend:", promptText);

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Analyze this user prompt: "${promptText}"\nReturn only JSON in the format:\n{\n  "type": "",\n  "brand": "",\n  "color": "",\n  "features": [],\n  "details": []\n}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const rawContent = gptResponse.choices[0].message.content;
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in GPT response");
    const structured = JSON.parse(jsonMatch[0]);

    const savedPrompt = await PromptModel.create({ promptText, ...structured });

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

    if (bestMatch && bestScore >= THRESHOLD) {
      return res.status(200).json({
        id: savedPrompt._id,
        raw: savedPrompt.promptText,
        structured,
        match: {
          filename: bestMatch.filename,
          imageUrl: `/api/uploads/${bestMatch.filename}`,
          imageJson: bestMatch.structured,
          matchScore: bestScore,
          imageDescription: bestMatch.description || "No description provided.",
          location: bestMatch.location || "Unknown location",
          postedBy: bestMatch.postedBy || "Unknown authority",
          postedAt: bestMatch.createdAt,
        },
      });
    }

    const followUpResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Based on this structured lost item JSON:\n${JSON.stringify(structured, null, 2)}\nSuggest a follow-up question to confirm ownership.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const followUpQuestion = followUpResponse.choices[0].message.content.trim();

    return res.status(200).json({
      id: savedPrompt._id,
      raw: savedPrompt.promptText,
      structured,
      followUpRequired: true,
      followUpQuestion,
    });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const handleReanalyzePrompt = async (req, res) => {
  const { promptId, additionalAnswer } = req.body;
  if (!promptId || !additionalAnswer)
    return res.status(400).json({ error: 'Missing prompt ID or additional answer' });

  try {
    const existingPrompt = await PromptModel.findById(promptId);
    if (!existingPrompt) return res.status(404).json({ error: 'Prompt not found' });

    const combinedPrompt = `${existingPrompt.promptText} ${additionalAnswer}`;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Analyze the following combined user prompt:\n${combinedPrompt}\nReturn JSON only:\n{\n  "type": "",\n  "brand": "",\n  "color": "",\n  "features": [],\n  "details": []\n}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const rawContent = gptResponse.choices[0].message.content;
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON from GPT");
    const structured = JSON.parse(jsonMatch[0]);

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

    if (bestMatch && bestScore >= THRESHOLD) {
      return res.status(200).json({
        match: {
          filename: bestMatch.filename,
          imageUrl: `/api/uploads/${bestMatch.filename}`,
          imageJson: bestMatch.structured,
          matchScore: bestScore,
          imageDescription: bestMatch.description || "No description provided.",
          location: bestMatch.location || "Unknown location",
          postedBy: bestMatch.postedBy || "Unknown authority",
          postedAt: bestMatch.createdAt,
        },
      });
    }

    res.status(200).json({ match: null });
  } catch (err) {
    console.error("❌ Reanalyze error:", err.message);
    res.status(500).json({ error: 'Follow-up analysis failed' });
  }
};