import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse FormData or JSON
    let orderId, proofUrl, paymentMethod, studentId, amount;

    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const body = await request.json();
      orderId = body.orderId;
      proofUrl = body.proofUrl;
      paymentMethod = body.paymentMethod;
      studentId = body.studentId;
      amount = body.amount;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      orderId = formData.get('orderId') as string;
      paymentMethod = formData.get('paymentMethod') as string;
      studentId = formData.get('studentId') as string;
      amount = formData.get('amount') as string;

      if (file) {
        // TODO: Upload file to storage (Vercel Blob, AWS S3, etc)
        // For now, create a mock URL
        proofUrl = `/proofs/${orderId}-${Date.now()}`;
      }
    }

    if (!orderId || !proofUrl || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validMethods = ['telebirr', 'cbe_mobile_banking'];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // TODO: Save payment proof to database with status 'pending'
    const paymentProof = {
      id: `proof-${Date.now()}`,
      orderId,
      proofUrl,
      paymentMethod,
      status: 'pending', // Awaiting admin verification
      uploadedAt: new Date().toISOString(),
    };

    // TODO: Send notification to admin dashboard
    // This would typically trigger:
    // 1. Admin dashboard update
    // 2. Email notification to admin
    // 3. Telegram notification to admin group

    console.log('[Payment Proof Received]', {
      orderId,
      paymentMethod,
      proofUrl,
      timestamp: new Date().toISOString(),
    });

    // TODO: Call admin notification endpoint
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/notify-payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentMethod,
          proofUrl,
          studentId,
          amount,
        }),
      });
    } catch (notifyError) {
      console.error('Error sending admin notification:', notifyError);
      // Don't fail the payment proof upload if notification fails
    }

    return NextResponse.json(paymentProof, { status: 201 });
  } catch (error) {
    console.error('Error processing payment proof:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
