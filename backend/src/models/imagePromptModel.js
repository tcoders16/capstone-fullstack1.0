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
  description: {
    type: String,
    default: 'No description provided.',
  },
  location: {
    type: String,
    default: 'Unknown location',
  },
  postedBy: {
    type: String,
    default: 'Unknown authority',
  }
}, {
  timestamps: true, // adds createdAt and updatedAt
});

const ImagePromptModel = mongoose.model('ImagePrompt', imagePromptSchema);

export default ImagePromptModel;