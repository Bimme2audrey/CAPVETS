import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Simple stock schemas
const StockTransactionSchema = new mongoose.Schema({
  productType: String,
  chickenCategory: String,
  unit: String,
  transactionType: String,
  quantity: Number,
  unitPrice: Number,
  source: String,
  sourceName: String,
  reference: String,
  notes: String,
  recordedBy: String,
  createdAt: { type: Date, default: Date.now }
});

const StockLevelSchema = new mongoose.Schema({
  productType: String,
  chickenCategory: String,
  unit: String,
  currentStock: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 0 },
  maxStockLevel: Number,
  lastUpdated: { type: Date, default: Date.now }
});

const StockTransaction = mongoose.models.StockTransaction || mongoose.model('StockTransaction', StockTransactionSchema);
const StockLevel = mongoose.models.StockLevel || mongoose.model('StockLevel', StockLevelSchema);

// GET /api/stock - Get current stock levels
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productType = searchParams.get('productType');

    // Check authentication (admin or stock manager)
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    let isAuthenticated = false;

    // Check for admin token in Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // For now, we'll allow access - in production, verify token properly
      isAuthenticated = true;
    }

    // Check for stock manager token in cookies
    if (cookieHeader && cookieHeader.includes('stockToken=')) {
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query = {};
    if (productType && productType !== 'all') {
      query = { productType };
    }

    // Get current stock levels
    const stockLevels = await StockLevel.find(query).sort({ productType: 1, chickenCategory: 1 });

    // Get recent transactions for each product
    const recentTransactions = await StockTransaction.find(
      productType ? { productType } : {}
    ).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({
      success: true,
      data: {
        stockLevels,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Stock GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

// POST /api/stock - Add new stock transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productType,
      chickenCategory,
      unit,
      transactionType,
      quantity,
      unitPrice,
      source,
      sourceName,
      reference,
      notes,
      recordedBy
    } = body;

    // Check authentication (admin or stock manager)
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    let isAuthenticated = false;

    // Check for admin token in Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      isAuthenticated = true;
    }

    // Check for stock manager token in cookies
    if (cookieHeader && cookieHeader.includes('stockToken=')) {
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!productType || !transactionType || !quantity || !source || !recordedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    // Create stock transaction
    const transaction = new StockTransaction({
      productType,
      chickenCategory: productType === 'chicken' ? chickenCategory : undefined,
      unit: productType === 'chicken' ? '' : unit, // No unit for chickens
      transactionType,
      quantity,
      unitPrice,
      source,
      sourceName,
      reference,
      notes,
      recordedBy,
      createdAt: new Date()
    });

    await transaction.save();

    // Update stock levels
    const stockKey = {
      productType,
      chickenCategory: productType === 'chicken' ? chickenCategory : undefined,
      unit: productType === 'chicken' ? '' : unit // No unit for chickens
    };

    let stockLevel = await StockLevel.findOne(stockKey);

    if (!stockLevel) {
      // Create new stock level if doesn't exist
      stockLevel = new StockLevel({
        ...stockKey,
        currentStock: 0,
        minStockLevel: 10,
        lastUpdated: new Date()
      });
    }

    // Update stock quantity
    if (transactionType === 'incoming') {
      stockLevel.currentStock += quantity;
    } else {
      stockLevel.currentStock -= quantity;
    }

    stockLevel.lastUpdated = new Date();
    await stockLevel.save();

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        updatedStock: stockLevel
      }
    });
  } catch (error) {
    console.error('Stock POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create stock transaction' },
      { status: 500 }
    );
  }
}
