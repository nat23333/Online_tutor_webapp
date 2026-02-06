import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, studentId, amount, tutorId } = body;

    if (!sessionId || !studentId || !amount || !tutorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // TODO: Insert into database
    const order = {
      orderId,
      sessionId,
      studentId,
      amount,
      tutorId,
      status: 'pending_payment',
      expiryTime: expiryTime.toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
