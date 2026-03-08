import mongoose, { Schema, Document } from 'mongoose';

// Comprehensive Stock Transaction Model for poultry business
export interface IComprehensiveStockTransaction extends Document {
  date: Date;
  description: 'initial_stock' | 'farm_production' | 'reformers' | 'purchase' | 'sales_live_farm' | 'sales_reformer' | 'sales_dressed_store' | 'broiler_transfer' | 'mortality_theft_loss' | 'adjustment';
  supplierCustomer?: string;
  reference?: string;
  amount?: number;
  purchase: {
    farmProduction?: number;
    reformers?: number;
  };
  sales: {
    liveFarm?: number;
    reformer?: number;
    dressedStore?: number;
  };
  broilerTransfer: {
    outForReformer?: number;
    outForFarm?: number;
    inForStore?: number;
  };
  mortalityTheftLoss: {
    farmLive?: number;
    storeDressed?: number;
    reformer?: number;
  };
  stockBalance: {
    farmLive?: number;
    storeDressed?: number;
    reformer?: number;
    total?: number;
  };
  modeOfOperation?: 'cash_in_hand' | 'bank_transfer' | 'momo';
  remarks?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComprehensiveStockTransactionSchema = new Schema<IComprehensiveStockTransaction>({
  date: { type: Date, required: true },
  description: {
    type: String,
    required: true,
    enum: ['initial_stock', 'farm_production', 'reformers', 'purchase', 'sales_live_farm', 'sales_reformer', 'sales_dressed_store', 'broiler_transfer', 'mortality_theft_loss', 'adjustment']
  },
  supplierCustomer: { type: String },
  reference: { type: String },
  amount: { type: Number },
  purchase: {
    farmProduction: { type: Number, default: 0 },
    reformers: { type: Number, default: 0 }
  },
  sales: {
    liveFarm: { type: Number, default: 0 },
    reformer: { type: Number, default: 0 },
    dressedStore: { type: Number, default: 0 }
  },
  broilerTransfer: {
    outForReformer: { type: Number, default: 0 },
    outForFarm: { type: Number, default: 0 },
    inForStore: { type: Number, default: 0 }
  },
  mortalityTheftLoss: {
    farmLive: { type: Number, default: 0 },
    storeDressed: { type: Number, default: 0 },
    reformer: { type: Number, default: 0 }
  },
  stockBalance: {
    farmLive: { type: Number, default: 0 },
    storeDressed: { type: Number, default: 0 },
    reformer: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  modeOfOperation: {
    type: String,
    enum: ['cash_in_hand', 'bank_transfer', 'momo']
  },
  remarks: { type: String },
  recordedBy: { type: String, required: true }
}, {
  timestamps: true
});

// Monthly Stock Sheet Model for reporting
export interface IMonthlyStockSheet extends Document {
  month: String; // "2024-01"
  year: Number;
  transactions: mongoose.Types.ObjectId[]; // References to ComprehensiveStockTransaction
  openingBalance: {
    farmLive: number;
    storeDressed: number;
    reformer: number;
    total: number;
  };
  closingBalance: {
    farmLive: number;
    storeDressed: number;
    reformer: number;
    total: number;
  };
  summary: {
    totalPurchases: number;
    totalSales: number;
    totalMortality: number;
    totalTransfers: number;
    revenue: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MonthlyStockSheetSchema = new Schema<IMonthlyStockSheet>({
  month: { type: String, required: true }, // "2024-01"
  year: { type: Number, required: true },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'ComprehensiveStockTransaction' }],
  openingBalance: {
    farmLive: { type: Number, default: 0 },
    storeDressed: { type: Number, default: 0 },
    reformer: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  closingBalance: {
    farmLive: { type: Number, default: 0 },
    storeDressed: { type: Number, default: 0 },
    reformer: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  summary: {
    totalPurchases: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalMortality: { type: Number, default: 0 },
    totalTransfers: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Stock Category Model for better organization
export interface IStockCategory extends Document {
  name: string;
  type: 'live_broilers' | 'dressed_broilers' | 'reformers';
  location: 'farm' | 'store' | 'reformer';
  currentQuantity: number;
  minLevel: number;
  maxLevel: number;
  unitPrice: number;
  lastUpdated: Date;
}

const StockCategorySchema = new Schema<IStockCategory>({
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['live_broilers', 'dressed_broilers', 'reformers']
  },
  location: {
    type: String,
    required: true,
    enum: ['farm', 'store', 'reformer']
  },
  currentQuantity: { type: Number, default: 0 },
  minLevel: { type: Number, default: 0 },
  maxLevel: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

export const ComprehensiveStockTransaction = mongoose.models.ComprehensiveStockTransaction || mongoose.model<IComprehensiveStockTransaction>('ComprehensiveStockTransaction', ComprehensiveStockTransactionSchema);
export const MonthlyStockSheet = mongoose.models.MonthlyStockSheet || mongoose.model<IMonthlyStockSheet>('MonthlyStockSheet', MonthlyStockSheetSchema);
export const StockCategory = mongoose.models.StockCategory || mongoose.model<IStockCategory>('StockCategory', StockCategorySchema);
