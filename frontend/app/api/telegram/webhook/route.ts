import { NextRequest, NextResponse } from 'next/server';
import { TelegramBot } from '@/lib/telegram-bot';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

// Store session data temporarily (in production, use Redis or database)
const sessionStore = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get('x-telegram-bot-api-secret-token');
    if (secret !== TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, callback_query } = body;

    // Handle incoming messages
    if (message) {
      await handleMessage(message);
    }

    // Handle callback queries (button presses)
    if (callback_query) {
      await handleCallbackQuery(callback_query);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleMessage(message: any) {
  const chatId = message.chat.id;
  const text = message.text?.toLowerCase() || '';
  const userId = message.from.id;
  const username = message.from.username || 'User';

  console.log(`[Telegram] Message from ${username} (${userId}): ${text}`);

  // Command: /start
  if (text === '/start') {
    const welcomeText = `
Welcome to Tutoring Platform! 📚

I'm your payment assistant. Here's what I can help with:

<b>1️⃣ Payment Instructions</b>
When you book a session and choose a payment method, I'll send you detailed instructions.

<b>2️⃣ Payment Verification</b>
After you upload your receipt, I'll notify you when it's verified.

<b>3️⃣ Session Reminders</b>
I'll send you your meeting link and session details.

<b>How to get started:</b>
👉 Visit: https://yourdomain.com/book
📧 Book a session with your preferred tutor
💳 Choose your payment method on Telegram

Any questions? Type /help
`;
    await TelegramBot.sendMessage(chatId, welcomeText);
  }

  // Command: /help
  if (text === '/help') {
    const helpText = `
<b>How to Use This Bot</b>

📍 <b>After booking a session:</b>
1. Go to the web app and click "Proceed to Payment"
2. Select your payment method (Telebirr or CBE)
3. I'll send you payment instructions
4. Follow the steps to transfer money
5. Take a screenshot and upload it via web app

⏳ <b>What happens next:</b>
• Your receipt will be reviewed
• Admin will verify your payment (usually within 24 hours)
• I'll send you the meeting link
• You'll be ready for your session!

💡 <b>Tips:</b>
✓ Make screenshots clear and readable
✓ Include transaction confirmation
✓ Use the correct order ID as reference
✓ Keep the timestamp visible

<b>Still need help?</b> Contact support@tutoring.et
`;
    await TelegramBot.sendMessage(chatId, helpText);
  }

  // Handle order ID in message (format: ORD-xxx)
  const orderMatch = text.match(/ord-\d+-[\w]+/i);
  if (orderMatch) {
    const orderId = orderMatch[0].toUpperCase();
    const message = `Found order: ${orderId}\n\nWould you like payment instructions?`;
    const buttons = [
      [
        { text: '📱 Telebirr', callback_data: `pay_telebirr_${orderId}` },
        { text: '🏦 CBE Mobile', callback_data: `pay_cbe_${orderId}` },
      ],
    ];
    await TelegramBot.sendMessage(chatId, message, buttons);
  }
}

async function handleCallbackQuery(callback_query: any) {
  const queryId = callback_query.id;
  const chatId = callback_query.message.chat.id;
  const messageId = callback_query.message.message_id;
  const data = callback_query.data;
  const userId = callback_query.from.id;

  console.log(`[Telegram] Callback from ${userId}: ${data}`);

  try {
    const { action, method, orderId } = TelegramBot.parseCallbackData(data);

    // Payment method selection
    if (action === 'pay' && method === 'telebirr') {
      await TelegramBot.sendTelebirrInstructions(chatId, orderId, 500); // Amount should come from DB
      await TelegramBot.answerCallbackQuery(queryId, 'Sending Telebirr instructions...');
    }

    if (action === 'pay' && method === 'cbe') {
      await TelegramBot.sendCBEInstructions(chatId, orderId, 500);
      await TelegramBot.answerCallbackQuery(queryId, 'Sending CBE instructions...');
    }

    // Confirm payment
    if (action === 'confirm' && method === 'payment') {
      const confirmText = `
✅ <b>Payment Confirmation Received</b>

Thank you for providing proof of payment for order <code>${orderId}</code>.

Our admin team will verify your payment shortly. You'll receive a notification as soon as it's confirmed.

<i>Typical verification time: 24 hours</i>
`;
      await TelegramBot.editMessage(chatId, messageId, confirmText);
      await TelegramBot.answerCallbackQuery(queryId, 'Payment confirmed! Check web app for receipt upload.');
    }

    // Cancel order
    if (action === 'cancel') {
      const cancelText = `❌ <b>Order Cancelled</b>\n\nOrder ${orderId} has been cancelled.\n\nWould you like to book another session?`;
      await TelegramBot.editMessage(chatId, messageId, cancelText);
      await TelegramBot.answerCallbackQuery(queryId, 'Order cancelled');
    }

    // Help
    if (action === 'help') {
      const helpText = `
<b>How to Upload Your Receipt</b>

After paying via Telebirr or CBE:

1️⃣ Go back to: https://yourdomain.com
2️⃣ Find the payment receipt upload section
3️⃣ Upload your screenshot/PDF
4️⃣ Submit for verification

<b>What we need:</b>
✓ Clear screenshot of confirmation
✓ Shows transaction ID
✓ Shows amount and date
✓ References order ID

Problems uploading? Contact support@tutoring.et
`;
      await TelegramBot.answerCallbackQuery(queryId, '');
      await TelegramBot.editMessage(chatId, messageId, helpText);
    }
  } catch (error) {
    console.error('Error handling callback:', error);
    await TelegramBot.answerCallbackQuery(
      queryId,
      'Error processing request. Please try again.',
      true
    );
  }
}

export async function GET() {
  // For debugging: shows webhook is working
  return NextResponse.json({ status: 'Telegram webhook is active' });
}
