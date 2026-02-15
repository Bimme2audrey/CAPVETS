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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { orderData, paymentRef, paymentMethod, phoneNumber } = await request.json();

    // Update order with payment information
    const updatedOrder = await Order.findByIdAndUpdate(
      orderData._id,
      {
        paymentRef,
        paymentMethod,
        paymentPhone: phoneNumber,
        paymentAmount: orderData.total,
        paymentStatus: 'COMPLETED',
        paymentCompletedAt: new Date(),
        status: 'CONFIRMED'
      },
      { new: true }
    );

    if (!updatedOrder) {
      // Create new order if it doesn't exist
      const newOrder = new Order({
        ...orderData,
        paymentRef,
        paymentMethod,
        paymentPhone: phoneNumber,
        paymentAmount: orderData.total,
        paymentStatus: 'COMPLETED',
        paymentCompletedAt: new Date(),
        status: 'CONFIRMED'
      });
      await newOrder.save();
    }

    return NextResponse.json({
      success: true,
      message: "Payment completed and order created successfully"
    });

  } catch (error) {
    console.error('Payment completion error:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to complete payment"
    }, { status: 500 });
  }
}
