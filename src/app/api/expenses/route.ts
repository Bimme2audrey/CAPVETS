import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Simple expense schema
const ExpenseSchema = new mongoose.Schema({
  date: Date,
  category: String,
  description: String,
  amount: Number,
  paymentMode: String,
  reference: String,
  recordedBy: String,
  createdAt: { type: Date, default: Date.now }
});

const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

// GET /api/expenses - Get all expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Check authentication
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

    // Build query
    let query: any = {};
    
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Get expenses
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(500);

    return NextResponse.json({
      success: true,
      data: expenses
    });

  } catch (error) {
    console.error('Expenses GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Add new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, category, description, amount, paymentMode, reference } = body;

    // Check authentication
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

    // Create expense
    const expense = new Expense({
      date: new Date(date),
      category,
      description,
      amount: parseFloat(amount),
      paymentMode,
      reference,
      recordedBy: 'Stock Manager' // In production, get from token
    });

    await expense.save();

    return NextResponse.json({
      success: true,
      message: 'Expense added successfully',
      data: expense
    });

  } catch (error) {
    console.error('Expenses POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add expense' },
      { status: 500 }
    );
  }
}
