import mongoose from 'mongoose';

// Order Item Schema for individual products
const orderItemSchema = new mongoose.Schema({
  productType: {
    type: String,
    enum: ['chicken', 'eggs', 'corn', 'beans', 'soybean', 'palmnuts'],
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  // Chicken-specific fields
  chickenNature: {
    type: String,
    enum: ['live', 'ready-to-cook'],
    default: 'live'
  },
  weightRange: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  cutUp: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  cutPieces: {
    type: String,
    default: ''
  },
  // Pricing for this item
  unitPrice: {
    type: Number,
    required: true
  },
  itemTotal: {
    type: Number,
    required: true
  },
  cutUpFee: {
    type: Number,
    default: 0
  }
});

const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  // Array of order items
  items: [orderItemSchema],
  specialInstructions: {
    type: String,
    default: ''
  },
  orderType: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  preferredTime: {
    type: String,
    default: ''
  },
  // Order totals
  subtotal: {
    type: Number,
    required: true
  },
  totalCutUpFee: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'scheduled', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // Payment Information
  paymentRef: {
    type: String,
    required: false
  },
  paymentMethod: {
    type: String,
    enum: ['mtn', 'orange', 'moov', 'express_union', 'TEST'],
    required: false
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  paymentAmount: {
    type: Number,
    required: false
  },
  paymentPhone: {
    type: String,
    required: false
  },
  paymentCompletedAt: {
    type: Date,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
orderSchema.pre('save', function (next: any) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
