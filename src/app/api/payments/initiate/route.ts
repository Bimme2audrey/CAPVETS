import { NextRequest, NextResponse } from 'next/server';

// Generate unique payment reference
const generatePaymentRef = (method: string) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${method.toUpperCase()}-${timestamp}-${random}`;
};

export async function POST(request: NextRequest) {
  try {
    const { orderData, amount, paymentMethod, phoneNumber } = await request.json();

    if (!orderData || !amount || !paymentMethod) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: orderData, amount, paymentMethod"
      }, { status: 400 });
    }

    // Validate payment method
    const validMethods = ["mtn", "orange"];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json({
        success: false,
        message: "Invalid payment method"
      }, { status: 400 });
    }

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/[\s\-+]/g, "");
    const phoneRegex = /^(6|2)\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json({
        success: false,
        message: "Invalid phone number format"
      }, { status: 400 });
    }

    // Generate payment reference
    const paymentRef = generatePaymentRef(paymentMethod);

    // TODO: Integrate with actual MeSomb payment service
    // For now, return a mock response
    return NextResponse.json({
      success: true,
      paymentRef,
      message: "Payment initiated successfully"
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to initiate payment"
    }, { status: 500 });
  }
}
