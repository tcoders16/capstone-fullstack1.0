import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  promptText: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: '',
  },
  brand: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  features: {
    type: [String],
    default: [],
  },
  details: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

const PromptModel = mongoose.model('Prompt', promptSchema);

export default PromptModel;