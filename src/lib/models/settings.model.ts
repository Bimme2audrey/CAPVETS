import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  businessName: {
    type: String,
    default: 'CAPVETS'
  },
  contact: {
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    }
  },
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  deliverySettings: {
    defaultRadius: {
      type: Number,
      default: 20
    },
    baseFee: {
      type: Number,
      default: 1000
    },
    maxDistance: {
      type: Number,
      default: 50
    },
    businessCoordinates: {
      lat: {
        type: Number,
        default: 4.061579298251527
      },
      lng: {
        type: Number,
        default: 9.75264045767144
      }
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
settingsSchema.pre('save', function (next: any) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
