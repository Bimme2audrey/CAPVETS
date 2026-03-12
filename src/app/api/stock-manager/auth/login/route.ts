import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Mock credentials for stock manager
    if (username === 'stock@capvets.com' && password === 'stock123') {
      // Generate a simple token (in production, use JWT)
      const token = 'stock_token_' + Date.now() + '_' + Math.random().toString(36).substring(2);

      // Set token in cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: 'stock_manager_001',
          name: 'Stock Manager',
          email: username,
          role: 'stock_manager'
        }
      });

      // Set HTTP-only cookie
      response.cookies.set('stockToken', token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Stock manager login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
