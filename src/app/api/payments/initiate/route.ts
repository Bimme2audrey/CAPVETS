import { NextRequest, NextResponse } from "next/server";

// Generate unique payment reference
const generatePaymentRef = (method: string) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${method.toUpperCase()}-${timestamp}-${random}`;
};

export async function POST(request: NextRequest) {
  try {
    const { orderData, amount, paymentMethod, phoneNumber } =
      await request.json();

    if (!orderData || !amount || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: orderData, amount, paymentMethod",
        },
        { status: 400 },
      );
    }

    // Validate payment method
    const validMethods = ["mtn", "orange"];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method",
        },
        { status: 400 },
      );
    }

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/[\s\-+]/g, "");
    const phoneRegex = /^(6|2)\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number format",
        },
        { status: 400 },
      );
    }

    // Generate payment reference
    const paymentRef = generatePaymentRef(paymentMethod);

    // TODO: Integrate with actual MeSomb payment service
    // For now, return a mock response

    const res = await fetch("https://campay.net/api/get_payment_link/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.CAMPAY_API_KEY}`,
      },
      body: JSON.stringify({
        amount,
        currency: "XAF",
        description: `Payment for order ${orderData.orderId} from ${cleanPhone}`,
        external_reference: paymentRef,
        redirect_url: process.env.NEXT_FRONTEND_URL,
      }),
      redirect: "follow",
    });

    const paymentRedirect = await res.json();

    return NextResponse.json({
      success: true,
      paymentRef,
      paymentRedirect,
      message: "Payment initiated successfully",
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initiate payment",
      },
      { status: 500 },
    );
  }
}
