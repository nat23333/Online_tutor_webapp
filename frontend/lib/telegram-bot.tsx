/**
 * Telegram Bot Handler
 * Manages payment flow and student/tutor interactions
 */

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

interface TelegramMessage {
  chat_id: number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  reply_markup?: any;
}

interface TelegramCallbackQuery {
  id: string;
  from: { id: number; username: string };
  data: string;
  message: { message_id: number; chat: { id: number } };
}

export class TelegramBot {
  /**
   * Send a message to a Telegram user
   */
  static async sendMessage(chatId: number, text: string, buttons?: any) {
    const payload: TelegramMessage = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    };

    if (buttons) {
      payload.reply_markup = {
        inline_keyboard: buttons,
      };
    }

    try {
      const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      throw error;
    }
  }

  /**
   * Handle payment method selection
   */
  static generatePaymentMethodButtons(orderId: string) {
    return [
      [
        {
          text: '📱 Telebirr',
          callback_data: `pay_telebirr_${orderId}`,
        },
        {
          text: '🏦 CBE Mobile',
          callback_data: `pay_cbe_${orderId}`,
        },
      ],
      [
        {
          text: 'ℹ️ Need Help?',
          callback_data: `help_${orderId}`,
        },
      ],
    ];
  }

  /**
   * Send Telebirr payment instructions
   */
  static async sendTelebirrInstructions(
    chatId: number,
    orderId: string,
    amount: number,
    merchantNumber: string = '9999888'
  ) {
    const text = `
<b>💰 Telebirr Payment Instructions</b>

<b>Amount:</b> <code>${amount} ETB</code>
<b>Reference:</b> <code>${orderId}</code>

<b>Steps to Pay:</b>
1️⃣ Open your Telebirr app
2️⃣ Select "Pay Merchant"
3️⃣ Enter merchant number: <code>${merchantNumber}</code>
4️⃣ Enter amount: <code>${amount} ETB</code>
5️⃣ Enter reference: <code>${orderId}</code>
6️⃣ Confirm payment

<b>Once you've paid:</b>
✅ Take a screenshot of the confirmation
✅ Upload it using the web app
✅ Our team will verify within 24 hours

<b>Need help?</b> Contact support@tutoring.et
`;

    const buttons = [
      [
        {
          text: '✅ I\'ve Paid',
          callback_data: `confirm_payment_${orderId}`,
        },
        {
          text: '❌ Cancel',
          callback_data: `cancel_${orderId}`,
        },
      ],
    ];

    return this.sendMessage(chatId, text, buttons);
  }

  /**
   * Send CBE Mobile Banking payment instructions
   */
  static async sendCBEInstructions(
    chatId: number,
    orderId: string,
    amount: number,
    accountNumber: string = '1000180180001',
    accountName: string = 'Tutoring Platform'
  ) {
    const text = `
<b>🏦 CBE Mobile Banking Payment Instructions</b>

<b>Amount:</b> <code>${amount} ETB</code>
<b>Reference:</b> <code>${orderId}</code>

<b>Beneficiary Details:</b>
Account Number: <code>${accountNumber}</code>
Account Name: <code>${accountName}</code>

<b>Steps to Pay:</b>
1️⃣ Open CBE Mobile app or dial <code>*901#</code>
2️⃣ Select "Send Money"
3️⃣ Enter account: <code>${accountNumber}</code>
4️⃣ Enter amount: <code>${amount} ETB</code>
5️⃣ Enter reference: <code>${orderId}</code>
6️⃣ Confirm payment

<b>Once you've paid:</b>
✅ Take a screenshot of the SMS confirmation
✅ Upload it using the web app
✅ Our team will verify within 24 hours

<b>Need help?</b> Contact support@tutoring.et
`;

    const buttons = [
      [
        {
          text: '✅ I\'ve Paid',
          callback_data: `confirm_payment_${orderId}`,
        },
        {
          text: '❌ Cancel',
          callback_data: `cancel_${orderId}`,
        },
      ],
    ];

    return this.sendMessage(chatId, text, buttons);
  }

  /**
   * Send confirmation after payment proof uploaded
   */
  static async sendVerificationWaitingMessage(
    chatId: number,
    orderId: string,
    studentName: string,
    tutorName: string,
    amount: number
  ) {
    const text = `
<b>✅ Payment Proof Received!</b>

<b>Order:</b> ${orderId}
<b>Student:</b> ${studentName}
<b>Tutor:</b> ${tutorName}
<b>Amount:</b> ${amount} ETB

Our admin team is reviewing your payment proof. You will receive confirmation within 24 hours.

Once verified:
✅ You'll get a meeting link
✅ Session will be confirmed
✅ Tutor will be notified

Thank you for your patience! 🙏
`;

    return this.sendMessage(chatId, text);
  }

  /**
   * Send meeting link after payment verification
   */
  static async sendMeetingLink(
    chatId: number,
    orderId: string,
    meetingLink: string,
    tutorName: string,
    sessionTime: string
  ) {
    const text = `
<b>🎉 Session Confirmed!</b>

<b>Order:</b> ${orderId}
<b>Tutor:</b> ${tutorName}
<b>Session Time:</b> ${sessionTime}

<b>👉 <a href="${meetingLink}">Click here to join your session</a></b>

📝 <b>Reminders:</b>
• Join 5 minutes early
• Have a quiet study space
• Good internet connection
• Camera and microphone ready

If you have questions, reply to this message.
See you soon! 📚
`;

    const buttons = [
      [
        {
          text: '🚀 Join Now',
          url: meetingLink,
        },
      ],
    ];

    return this.sendMessage(chatId, text, buttons);
  }

  /**
   * Send payment rejection notification
   */
  static async sendPaymentRejected(
    chatId: number,
    orderId: string,
    reason: string
  ) {
    const text = `
<b>❌ Payment Verification Failed</b>

<b>Order:</b> ${orderId}
<b>Reason:</b> ${reason}

Please review the payment receipt and resubmit. Make sure:
✓ Receipt is clear and readable
✓ Amount matches (${orderId})
✓ Receipt shows transaction completion
✓ Date is recent

<b>Next Steps:</b>
1. Go back to the web app
2. Upload a corrected receipt
3. Our team will review again within 24 hours

<b>Still having issues?</b> Contact support@tutoring.et
`;

    const buttons = [
      [
        {
          text: 'Go to Web App',
          url: 'https://yourdomain.com/upload-proof',
        },
      ],
    ];

    return this.sendMessage(chatId, text, buttons);
  }

  /**
   * Handle callback query response (button press)
   */
  static async answerCallbackQuery(
    queryId: string,
    text: string,
    showAlert: boolean = false
  ) {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: queryId,
          text,
          show_alert: showAlert,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error answering callback query:', error);
      throw error;
    }
  }

  /**
   * Edit message text
   */
  static async editMessage(
    chatId: number,
    messageId: number,
    text: string,
    buttons?: any
  ) {
    const payload: any = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
    };

    if (buttons) {
      payload.reply_markup = {
        inline_keyboard: buttons,
      };
    }

    try {
      const response = await fetch(`${TELEGRAM_API_URL}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return await response.json();
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }

  /**
   * Parse order ID and payment method from callback data
   */
  static parseCallbackData(data: string) {
    const parts = data.split('_');
    return {
      action: parts[0],
      method: parts[1],
      orderId: parts.slice(2).join('_'),
    };
  }
}
