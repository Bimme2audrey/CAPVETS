import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  url: String,
  secure_url: String,
  type: String,
  description: String,
  public_id: String,
  uploadDate: { type: Date, default: Date.now }
});

export default mongoose.models.Media || mongoose.model('Media', mediaSchema);
