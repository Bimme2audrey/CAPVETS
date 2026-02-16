import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/lib/models/order.model';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { statusType, newStatus } = await request.json();
    const orderId = params.id;

    if (!orderId || !statusType || !newStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['payment', 'delivery'].includes(statusType)) {
      return NextResponse.json(
        { error: 'Invalid status type' },
        { status: 400 }
      );
    }

    // Validate status values
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    const validDeliveryStatuses = ['pending', 'scheduled', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

    if (statusType === 'payment' && !validPaymentStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    if (statusType === 'delivery' && !validDeliveryStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid delivery status' },
        { status: 400 }
      );
    }

    // Update the order
    const updateField = statusType === 'payment' ? 'paymentStatus' : 'deliveryStatus';
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { [updateField]: newStatus },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${statusType === 'payment' ? 'Payment' : 'Delivery'} status updated successfully`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
