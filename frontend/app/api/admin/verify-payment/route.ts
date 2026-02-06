import { NextRequest, NextResponse } from 'next/server';
import { TelegramBot } from '@/lib/telegram-bot';

/**
 * Admin approves or rejects payment proof
 * Updates order status and notifies student via Telegram
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      approved,
      reason,
      chatId,
      studentName,
      tutorName,
      meetingLink,
      sessionTime,
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    // TODO: Verify admin authorization
    // TODO: Update order status in database

    if (approved) {
      // Send meeting link to student
      await TelegramBot.sendMeetingLink(
        chatId,
        orderId,
        meetingLink || 'https://meet.jitsi.org/session-' + orderId,
        tutorName || 'Your Tutor',
        sessionTime || 'Scheduled'
      );

      // TODO: Notify tutor that payment is confirmed
      // TODO: Generate and send meeting link via email
      // TODO: Mark order as 'confirmed' in database

      return NextResponse.json(
        {
          success: true,
          message: 'Payment approved and meeting link sent',
          orderId,
        },
        { status: 200 }
      );
    } else {
      // Send rejection message
      if (chatId && reason) {
        await TelegramBot.sendPaymentRejected(chatId, orderId, reason);
      }

      // TODO: Mark order as 'payment_rejected' in database
      // TODO: Allow student to resubmit payment proof

      return NextResponse.json(
        {
          success: true,
          message: 'Payment rejected and student notified',
          orderId,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
