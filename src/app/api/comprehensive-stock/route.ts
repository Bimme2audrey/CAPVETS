import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ComprehensiveStockTransaction, MonthlyStockSheet, StockCategory } from '@/lib/models/comprehensive-stock.model';

// GET /api/comprehensive-stock - Get all stock transactions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    const location = searchParams.get('location');

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

    // Build query
    let query: any = {};

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Apply category filtering
    if (category && category !== 'all') {
      switch (category) {
        case 'purchases':
          query.$or = [
            { description: 'initial_stock' },
            { description: 'purchase_day_old_chicks' },
            { description: 'purchase_matured_broilers' }
          ];
          break;
        case 'sales':
          query.$or = [
            { description: 'sale_live_farm' },
            { description: 'sale_live_reformers' },
            { description: 'sale_dressed_farm' },
            { description: 'sale_dressed_cold_store' }
          ];
          break;
        case 'transfers':
          query.$or = [
            { description: 'transfer_farm_to_cold' },
            { description: 'transfer_reformers_to_cold' }
          ];
          break;
        case 'mortality':
          query.$or = [
            { description: 'mortality_farm' },
            { description: 'mortality_reformers' }
          ];
          break;
        case 'theft':
          query.$or = [
            { description: 'theft_farm' },
            { description: 'theft_cold_store' }
          ];
          break;
        case 'losses':
          query.$or = [
            { description: 'loss_farm' },
            { description: 'loss_cold_store' }
          ];
          break;
        case 'adjustments':
          query.$or = [
            { description: 'adjustment_positive' },
            { description: 'adjustment_negative' }
          ];
          break;
        case 'samples':
          query.description = 'free_sample';
          break;
        case 'returns':
          query.$or = [
            { description: 'return_live' },
            { description: 'return_dressed' }
          ];
          break;
      }
    }

    // Get transactions
    const transactions = await ComprehensiveStockTransaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(500);

    // Get stock categories for current balances
    const stockCategories = await StockCategory.find({});

    // Calculate current balances
    const currentBalances = {
      farmLive: 0,
      storeDressed: 0,
      reformer: 0,
      total: 0
    };

    stockCategories.forEach((category: any) => {
      if (category.type === 'live_broilers' && category.location === 'farm') {
        currentBalances.farmLive += category.currentQuantity;
      } else if (category.type === 'dressed_broilers' && category.location === 'store') {
        currentBalances.storeDressed += category.currentQuantity;
      } else if (category.type === 'reformers') {
        currentBalances.reformer += category.currentQuantity;
      }
    });

    currentBalances.total = currentBalances.farmLive + currentBalances.storeDressed + currentBalances.reformer;

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        currentBalances,
        stockCategories
      }
    });
  } catch (error) {
    console.error('Comprehensive Stock GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

// POST /api/comprehensive-stock - Add new comprehensive stock transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    // Create transaction
    const transaction = new ComprehensiveStockTransaction({
      ...body,
      date: new Date(body.date),
      createdAt: new Date()
    });

    await transaction.save();

    // Update stock categories based on transaction
    await updateStockCategories(transaction);

    // Update or create monthly sheet
    await updateMonthlySheet(transaction);

    return NextResponse.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Comprehensive Stock POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create stock transaction' },
      { status: 500 }
    );
  }
}

// Helper function to update stock categories
async function updateStockCategories(transaction: any) {
  const categories = await StockCategory.find({});

  // Update based on transaction type
  if (transaction.description === 'sales_live_farm') {
    const farmCategory = categories.find((c: any) => c.type === 'live_broilers' && c.location === 'farm');
    if (farmCategory) {
      farmCategory.currentQuantity -= transaction.sales.liveFarm || 0;
      farmCategory.lastUpdated = new Date();
      await farmCategory.save();
    }
  }

  if (transaction.description === 'sales_dressed_store') {
    const storeCategory = categories.find((c: any) => c.type === 'dressed_broilers' && c.location === 'store');
    if (storeCategory) {
      storeCategory.currentQuantity -= transaction.sales.dressedStore || 0;
      storeCategory.lastUpdated = new Date();
      await storeCategory.save();
    }
  }

  if (transaction.description === 'farm_production') {
    const farmCategory = categories.find((c: any) => c.type === 'live_broilers' && c.location === 'farm');
    if (farmCategory) {
      farmCategory.currentQuantity += transaction.purchase.farmProduction || 0;
      farmCategory.lastUpdated = new Date();
      await farmCategory.save();
    }
  }

  if (transaction.description === 'broiler_transfer') {
    // Update farm (out)
    const farmCategory = categories.find((c: any) => c.type === 'live_broilers' && c.location === 'farm');
    if (farmCategory) {
      farmCategory.currentQuantity -= transaction.broilerTransfer.outForReformer || 0;
      farmCategory.currentQuantity -= transaction.broilerTransfer.outForFarm || 0;
      farmCategory.lastUpdated = new Date();
      await farmCategory.save();
    }

    // Update store (in)
    const storeCategory = categories.find((c: any) => c.type === 'dressed_broilers' && c.location === 'store');
    if (storeCategory) {
      storeCategory.currentQuantity += transaction.broilerTransfer.inForStore || 0;
      storeCategory.lastUpdated = new Date();
      await storeCategory.save();
    }

    // Update reformer (in)
    const reformerCategory = categories.find((c: any) => c.type === 'reformers');
    if (reformerCategory) {
      reformerCategory.currentQuantity += transaction.broilerTransfer.outForReformer || 0;
      reformerCategory.lastUpdated = new Date();
      await reformerCategory.save();
    }
  }

  if (transaction.description === 'mortality_theft_loss') {
    // Update farm losses
    const farmCategory = categories.find((c: any) => c.type === 'live_broilers' && c.location === 'farm');
    if (farmCategory) {
      farmCategory.currentQuantity -= transaction.mortalityTheftLoss.farmLive || 0;
      farmCategory.lastUpdated = new Date();
      await farmCategory.save();
    }

    // Update store losses
    const storeCategory = categories.find((c: any) => c.type === 'dressed_broilers' && c.location === 'store');
    if (storeCategory) {
      storeCategory.currentQuantity -= transaction.mortalityTheftLoss.storeDressed || 0;
      storeCategory.lastUpdated = new Date();
      await storeCategory.save();
    }

    // Update reformer losses
    const reformerCategory = categories.find((c: any) => c.type === 'reformers');
    if (reformerCategory) {
      reformerCategory.currentQuantity -= transaction.mortalityTheftLoss.reformer || 0;
      reformerCategory.lastUpdated = new Date();
      await reformerCategory.save();
    }
  }
}

// Helper function to update monthly sheet
async function updateMonthlySheet(transaction: any) {
  const date = new Date(transaction.date);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const monthKey = `${year}-${month}`;

  let monthlySheet = await MonthlyStockSheet.findOne({ month: monthKey, year });

  if (!monthlySheet) {
    // Create new monthly sheet
    const previousMonth = new Date(year, date.getMonth(), 0);
    const previousMonthKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

    let openingBalance = { farmLive: 0, storeDressed: 0, reformer: 0, total: 0 };

    // Get previous month closing balance
    const previousSheet = await MonthlyStockSheet.findOne({ month: previousMonthKey });
    if (previousSheet) {
      openingBalance = previousSheet.closingBalance;
    }

    monthlySheet = new MonthlyStockSheet({
      month: monthKey,
      year: year,
      transactions: [],
      openingBalance,
      closingBalance: { ...openingBalance },
      summary: {
        totalPurchases: 0,
        totalSales: 0,
        totalMortality: 0,
        totalTransfers: 0,
        revenue: 0
      }
    });
  }

  // Add transaction to monthly sheet
  monthlySheet.transactions.push(transaction._id);

  // Update summary
  if (transaction.description === 'farm_production' || transaction.description === 'reformers' || transaction.description === 'purchase') {
    monthlySheet.summary.totalPurchases += (transaction.purchase.farmProduction || 0) + (transaction.purchase.reformers || 0);
  }

  if (transaction.description.startsWith('sales_')) {
    monthlySheet.summary.totalSales += (transaction.sales.liveFarm || 0) + (transaction.sales.reformer || 0) + (transaction.sales.dressedStore || 0);
    monthlySheet.summary.revenue += transaction.amount || 0;
  }

  if (transaction.description === 'mortality_theft_loss') {
    monthlySheet.summary.totalMortality += (transaction.mortalityTheftLoss.farmLive || 0) + (transaction.mortalityTheftLoss.storeDressed || 0) + (transaction.mortalityTheftLoss.reformer || 0);
  }

  if (transaction.description === 'broiler_transfer') {
    monthlySheet.summary.totalTransfers += (transaction.broilerTransfer.outForReformer || 0) + (transaction.broilerTransfer.outForFarm || 0) + (transaction.broilerTransfer.inForStore || 0);
  }

  // Update closing balance
  monthlySheet.closingBalance = transaction.stockBalance;

  await monthlySheet.save();
}
