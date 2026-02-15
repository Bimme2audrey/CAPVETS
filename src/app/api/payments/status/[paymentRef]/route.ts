import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ paymentRef: string }> }
) {
  try {
    const { paymentRef } = await context.params;

    // TODO: Check actual payment status with MeSomb
    // For now, return a mock completed status after some delay
    const mockStatus = Math.random() > 0.3 ? 'COMPLETED' : 'PENDING';

    return NextResponse.json({
      success: true,
      status: mockStatus,
      paymentRef
    });

  } catch (error: any) {
    console.error('Payment status check error:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to check payment status"
    }, { status: 500 });
  }
}
