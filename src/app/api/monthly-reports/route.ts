import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Import models with explicit path
const MonthlyStockSheet = mongoose.models.MonthlyStockSheet || mongoose.model('MonthlyStockSheet');
const ComprehensiveStockTransaction = mongoose.models.ComprehensiveStockTransaction || mongoose.model('ComprehensiveStockTransaction');

// GET /api/monthly-reports - Get monthly reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Check authentication
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    let isAuthenticated = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      isAuthenticated = true;
    }

    if (cookieHeader && cookieHeader.includes('stockToken=')) {
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    if (month && year) {
      // Get specific monthly report
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const monthlySheet = await MonthlyStockSheet.findOne({ month: monthKey, year: parseInt(year) })
        .populate('transactions');

      if (!monthlySheet) {
        return NextResponse.json({
          success: true,
          data: {
            monthlySheet: null,
            message: 'No data found for this month'
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: { monthlySheet }
      });
    } else {
      // Get all monthly reports
      const monthlySheets = await MonthlyStockSheet.find()
        .sort({ year: -1, month: -1 })
        .limit(24); // Last 24 months

      return NextResponse.json({
        success: true,
        data: { monthlySheets }
      });
    }
  } catch (error) {
    console.error('Monthly Reports GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monthly reports' },
      { status: 500 }
    );
  }
}

// POST /api/monthly-reports - Generate monthly report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month, year } = body;

    // Check authentication
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    let isAuthenticated = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      isAuthenticated = true;
    }

    if (cookieHeader && cookieHeader.includes('stockToken=')) {
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    const monthKey = `${year}-${String(month).padStart(2, '0')}`;

    // Get all transactions for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const transactions = await ComprehensiveStockTransaction.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    if (transactions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No transactions found for this month'
      }, { status: 404 });
    }

    // Calculate opening balance (from previous month or initial)
    let openingBalance = { farmLive: 0, storeDressed: 0, reformer: 0, total: 0 };

    const previousMonth = new Date(parseInt(year), parseInt(month) - 2, 1);
    const previousMonthKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

    const previousSheet = await MonthlyStockSheet.findOne({ month: previousMonthKey });
    if (previousSheet) {
      openingBalance = previousSheet.closingBalance;
    } else {
      // Use first transaction's stock balance as opening
      const firstTransaction = transactions[0];
      if (firstTransaction.stockBalance) {
        openingBalance = {
          farmLive: firstTransaction.stockBalance.farmLive || 0,
          storeDressed: firstTransaction.stockBalance.storeDressed || 0,
          reformer: firstTransaction.stockBalance.reformer || 0,
          total: firstTransaction.stockBalance.total || 0
        };
      }
    }

    // Calculate summary
    let summary = {
      totalPurchases: 0,
      totalSales: 0,
      totalMortality: 0,
      totalTransfers: 0,
      revenue: 0
    };

    transactions.forEach((transaction: any) => {
      if (transaction.description === 'farm_production' || transaction.description === 'reformers' || transaction.description === 'purchase') {
        summary.totalPurchases += (transaction.purchase.farmProduction || 0) + (transaction.purchase.reformers || 0);
      }

      if (transaction.description.startsWith('sales_')) {
        summary.totalSales += (transaction.sales.liveFarm || 0) + (transaction.sales.reformer || 0) + (transaction.sales.dressedStore || 0);
        summary.revenue += transaction.amount || 0;
      }

      if (transaction.description === 'mortality_theft_loss') {
        summary.totalMortality += (transaction.mortalityTheftLoss.farmLive || 0) + (transaction.mortalityTheftLoss.storeDressed || 0) + (transaction.mortalityTheftLoss.reformer || 0);
      }

      if (transaction.description === 'broiler_transfer') {
        summary.totalTransfers += (transaction.broilerTransfer.outForReformer || 0) + (transaction.broilerTransfer.outForFarm || 0) + (transaction.broilerTransfer.inForStore || 0);
      }
    });

    // Get closing balance (from last transaction)
    const lastTransaction = transactions[transactions.length - 1];
    const closingBalance = lastTransaction.stockBalance || { farmLive: 0, storeDressed: 0, reformer: 0, total: 0 };

    // Create or update monthly sheet
    let monthlySheet = await MonthlyStockSheet.findOne({ month: monthKey, year: parseInt(year) });

    if (!monthlySheet) {
      monthlySheet = new MonthlyStockSheet({
        month: monthKey,
        year: parseInt(year),
        transactions: transactions.map((t: any) => t._id),
        openingBalance,
        closingBalance,
        summary
      });
    } else {
      monthlySheet.transactions = transactions.map((t: any) => t._id);
      monthlySheet.openingBalance = openingBalance;
      monthlySheet.closingBalance = closingBalance;
      monthlySheet.summary = summary;
    }

    await monthlySheet.save();

    return NextResponse.json({
      success: true,
      data: { monthlySheet }
    });
  } catch (error) {
    console.error('Monthly Reports POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate monthly report' },
      { status: 500 }
    );
  }
}
