import { NextRequest, NextResponse } from 'next/server';
import { TelegramBot } from '@/lib/telegram-bot';

/**
 * Initiates payment flow by sending order details to user's Telegram
 * Called after student clicks "Proceed to Payment" on web app
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, chatId, studentName, tutorName, amount, subject } = body;

    // Validate required fields
    if (!orderId || !chatId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, chatId, amount' },
        { status: 400 }
      );
    }

    // Send welcome message with payment method options
    const welcomeText = `
<b>💳 Complete Your Payment</b>

<b>Order Details:</b>
📝 Order ID: <code>${orderId}</code>
👨‍🏫 Tutor: ${tutorName || 'Assigned'}
📚 Subject: ${subject || 'TBD'}
💰 Amount: <code>${amount} ETB</code>

<b>Choose your payment method:</b>
`;

    const buttons = TelegramBot.generatePaymentMethodButtons(orderId);

    await TelegramBot.sendMessage(chatId, welcomeText, buttons);

    // TODO: Update order status in database to 'awaiting_method_selection'

    return NextResponse.json(
      {
        success: true,
        message: 'Payment instructions sent to Telegram',
        orderId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
