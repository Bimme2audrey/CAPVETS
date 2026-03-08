import mongoose, { Schema, Document } from 'mongoose';

// Stock Transaction Model
export interface IStockTransaction extends Document {
  productType: string;
  chickenCategory?: string;
  unit: string;
  transactionType: 'incoming' | 'outgoing';
  quantity: number;
  unitPrice?: number;
  source: string;
  sourceName?: string;
  reference?: string;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Stock Level Model
export interface IStockLevel extends Document {
  productType: string;
  chickenCategory?: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  lastUpdated: Date;
}

const StockTransactionSchema = new Schema<IStockTransaction>({
  productType: { type: String, required: true },
  chickenCategory: { type: String },
  unit: { type: String, required: true },
  transactionType: { type: String, required: true, enum: ['incoming', 'outgoing'] },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number },
  source: { type: String, required: true },
  sourceName: { type: String },
  reference: { type: String },
  notes: { type: String },
  recordedBy: { type: String, required: true }
}, {
  timestamps: true
});

const StockLevelSchema = new Schema<IStockLevel>({
  productType: { type: String, required: true },
  chickenCategory: { type: String },
  unit: { type: String, required: true },
  currentStock: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, required: true, default: 0 },
  maxStockLevel: { type: Number },
  lastUpdated: { type: Date, default: Date.now }
});

export const StockTransaction = mongoose.models.StockTransaction || mongoose.model<IStockTransaction>('StockTransaction', StockTransactionSchema);
export const StockLevel = mongoose.models.StockLevel || mongoose.model<IStockLevel>('StockLevel', StockLevelSchema);
