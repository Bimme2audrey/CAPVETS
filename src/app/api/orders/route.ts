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

// GET all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const orderData = await request.json();

    const order = new Order(orderData);
    await order.save();

    return NextResponse.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}
