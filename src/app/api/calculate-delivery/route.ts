import { NextRequest, NextResponse } from 'next/server';

interface DeliveryRequest {
  lat: number;
  lng: number;
  orderTotal: number;
}

interface DeliveryResponse {
  distance: number;
  deliveryFee: number;
  estimatedTime: string;
  error?: string;
}

// Base coordinates for CAPVETS store
const STORE_LOCATION = {
  lat: 4.061579298251527,
  lng: 9.75264045767144
};

// Delivery fee calculation rules 
const DELIVERY_RULES = {
  baseFee: 1000, 
  perKmFee: 500, 
  freeDeliveryThreshold: 500000, 
  maxDeliveryFee: 3500, 
  maxDistance: 20 
};

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, orderTotal }: DeliveryRequest = await request.json();

    // Validate input
    if (!lat || !lng || typeof orderTotal !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Validate Google Maps API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Call Google Distance Matrix API
    const origin = `${STORE_LOCATION.lat},${STORE_LOCATION.lng}`;
    const destination = `${lat},${lng}`;

    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=metric&key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'OK' || data.rows[0].elements[0].status !== 'OK') {
      return NextResponse.json(
        { error: 'Unable to calculate distance' },
        { status: 400 }
      );
    }

    const element = data.rows[0].elements[0];
    const distance = element.distance.value / 1000; // Convert meters to kilometers
    const duration = element.duration.text;

    // Check if location is within delivery range
    if (distance > DELIVERY_RULES.maxDistance) {
      return NextResponse.json(
        {
          error: `Location is too far for delivery. Maximum distance is ${DELIVERY_RULES.maxDistance}km`,
          distance: Math.round(distance * 100) / 100,
          deliveryFee: 0,
          estimatedTime: duration
        },
        { status: 400 }
      );
    }

    // Calculate delivery fee
    let deliveryFee = DELIVERY_RULES.baseFee + (distance * DELIVERY_RULES.perKmFee);

    // Apply maximum fee cap
    deliveryFee = Math.min(deliveryFee, DELIVERY_RULES.maxDeliveryFee);

    // Free delivery for large orders
    if (orderTotal >= DELIVERY_RULES.freeDeliveryThreshold) {
      deliveryFee = 0;
    }

    const result: DeliveryResponse = {
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      deliveryFee: Math.round(deliveryFee),
      estimatedTime: duration
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Delivery calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
