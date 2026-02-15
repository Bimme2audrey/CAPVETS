import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/lib/models/order.model';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find();

    // Calculate stats
    const totalOrders = orders.length;
    const ordersToday = orders.filter((order: any) => new Date(order.createdAt) >= today).length;

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    // Payment method stats (mock data for now)
    const mtnRevenue = Math.floor(totalRevenue * 0.6);
    const orangeRevenue = Math.floor(totalRevenue * 0.4);
    const mtnCount = Math.floor(totalOrders * 0.6);
    const orangeCount = Math.floor(totalOrders * 0.4);

    return NextResponse.json({
      totalOrders,
      ordersToday,
      totalRevenue,
      mtnRevenue,
      orangeRevenue,
      mtnCount,
      orangeCount
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
