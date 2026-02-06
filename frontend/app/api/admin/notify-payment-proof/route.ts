import { NextRequest, NextResponse } from 'next/server';

/**
 * Notifies admin when payment proof is uploaded
 * Called after student uploads receipt via web app
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, studentName, proofUrl, paymentMethod, amount } = body;

    if (!orderId || !studentName || !proofUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Send notification to admin Telegram group or dashboard
    // For now, log the event
    console.log('[Payment Proof Uploaded]', {
      orderId,
      studentName,
      paymentMethod,
      amount,
      proofUrl,
      timestamp: new Date().toISOString(),
    });

    // In a production system:
    // 1. Send notification to admin Telegram group
    // 2. Add to queue for manual verification
    // 3. Update order status to 'awaiting_verification'
    // 4. Set verification timeout (24 hours)

    return NextResponse.json(
      {
        success: true,
        message: 'Payment proof received for verification',
        orderId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing payment proof notification:', error);
    return NextResponse.json(
      { error: 'Failed to process notification' },
      { status: 500 }
    );
  }
}
