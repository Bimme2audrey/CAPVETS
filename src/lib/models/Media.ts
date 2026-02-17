import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  url: String,
  secure_url: String,
  type: String,
  description: String,
  public_id: String,
  productType: {
    type: String,
    enum: ['chicken', 'eggs', 'corn', 'beans', 'soybean', 'palmnuts', 'snails', 'pigs', 'fish', ''],
    default: ''
  },
  chickenCategory: {
    type: String,
    enum: ['1.5-1.6kg', '1.7-1.8kg', '1.9-2.1kg', '2.2-2.3kg', '2.4-3kg', ''],
    default: ''
  },
  uploadDate: { type: Date, default: Date.now }
});

export default mongoose.models.Media || mongoose.model('Media', mediaSchema);
