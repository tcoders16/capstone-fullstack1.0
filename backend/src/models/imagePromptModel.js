// ✅ backend/src/models/imagePromptModel.js
import mongoose from 'mongoose';

const imagePromptSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  structured: {
    type: Object,
    default: {},
  },
  rawLabels: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

// ✅ Define THEN export
const imagePromptModel = mongoose.model('ImagePrompt', imagePromptSchema);

export default imagePromptModel;