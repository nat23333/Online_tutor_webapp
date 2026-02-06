import { NextRequest, NextResponse } from 'next/server';

/**
 * Send a message to a user via Telegram Bot
 * This helper function is called after payment verification
 */
export async function POST(request: NextRequest) {
  try {
    const { chatId, message, orderId } = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Missing Telegram configuration' },
        { status: 400 }
      );
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send Telegram message');
    }

    const data = await response.json();
    return NextResponse.json(
      { success: true, messageId: data.result.message_id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
