# Tutoring Platform Setup Guide

This is a comprehensive tutoring booking platform with payment integration for Ethiopian payment methods (Telebirr and CBE Mobile Banking).

## Architecture Overview

### Components
- **Web App**: Student/Tutor booking interface built with Next.js + React
- **Telegram Bot**: Payment coordination and notifications
- **Payment Gateway**: Manual verification of Telebirr and CBE Mobile Banking transfers
- **Database**: PostgreSQL with comprehensive schema for users, sessions, orders, and payments

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (future: NestJS recommended for production)
- **Database**: PostgreSQL
- **Cache/Queue**: Redis (for order locks and payment verification queues)
- **External**: Telegram Bot API, Jitsi/Daily (video sessions)

## Environment Variables Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tutoring_platform

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret_here

# Optional: For production video sessions
JITSI_DOMAIN=meet.jitsi.org
DAILY_API_KEY=your_daily_api_key_here
```

## Database Setup

1. Create PostgreSQL database:
```bash
createdb tutoring_platform
```

2. Run migration script:
```bash
psql tutoring_platform < scripts/init-db.sql
```

3. Verify tables were created:
```bash
psql tutoring_platform -c "\dt"
```

## Telegram Bot Setup

1. Create bot with BotFather on Telegram
2. Get your bot token
3. Set webhook URL (replace with your domain):
```bash
curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourdomain.com/api/telegram/webhook",
    "secret_token": "your_webhook_secret"
  }'
```

## Payment Flow

### 1. Booking (Web App)
- Student selects tutor, time, duration
- System generates order with 15-minute expiry
- Order stored with status: `pending_payment`

### 2. Payment Method Selection (Telegram Bot)
- User clicks "Pay via Telegram"
- Bot shows payment method buttons
- Student chooses: Telebirr or CBE Mobile Banking

### 3. Payment Instructions (Telegram)
**Telebirr:**
- Merchant number
- Amount in ETB
- Reference: Order ID

**CBE Mobile Banking:**
- Account number
- Account name
- Amount in ETB
- Reference: Order ID

### 4. Proof Upload & Verification
- Student uploads payment receipt (screenshot/PDF)
- Status: `awaiting_verification`
- Admin dashboard shows pending verifications
- Admin can approve or reject with reason
- Once approved: Meeting link generated and sent

## API Endpoints

### Orders
- `POST /api/orders/create` - Create new booking order
  - Body: `{ sessionId, studentId, tutorId, amount }`
  - Returns: Order object with ID and expiry time

### Payments
- `POST /api/payments/verify` - Upload payment proof
  - FormData: `{ file, orderId, paymentMethod }`
  - Returns: Payment proof record with status

### Telegram
- `POST /api/telegram/webhook` - Receive Telegram updates
  - Handles messages and button callbacks
  - Processes payment method selection

- `POST /api/telegram/send-message` - Send message to user
  - Body: `{ chatId, message, orderId }`
  - Used after payment verification

## Manual Verification Process (MVP)

The system uses manual admin verification for payment proofs:

1. **Admin Dashboard** (`/admin` - to be built)
   - View pending payment proofs
   - Cross-check with bank app
   - Approve or reject with reason
   - Auto-generate meeting link on approval

2. **Fraud Protection**
   - Order expiry (15-30 minutes)
   - One receipt per order
   - Auto-ban on repeated fake uploads
   - Tutor escrow release after session completion

## Scaling Path (Future)

1. **Semi-Automatic Verification**
   - Student forwards Telebirr SMS to bot
   - Bot parses transaction ID
   - Admin only confirms (not full re-verification)

2. **Full Automation** (requires bank integration)
   - Direct API with Telebirr and CBE
   - Instant payment confirmation
   - Automatic meeting link generation

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
/app
  /api
    /orders/create - Order creation endpoint
    /payments/verify - Payment proof upload
    /telegram/webhook - Telegram bot webhook
    /telegram/send-message - Send Telegram notifications
  /admin - Admin dashboard (to be built)
  page.tsx - Main booking flow
  layout.tsx - Root layout

/components
  BookingForm.tsx - Tutor and session selection
  PaymentMethodSelector.tsx - Telebirr/CBE choice
  PaymentProofUpload.tsx - Receipt upload and preview
  AdminPaymentVerification.tsx - Admin verification dashboard

/scripts
  init-db.sql - Database schema

/lib
  utils.ts - Utility functions
```

## Next Steps

1. **Database Integration**: Connect to actual PostgreSQL
2. **Authentication**: Add user login (email/phone for Ethiopia)
3. **Session Management**: Integrate Jitsi for video calls
4. **Payment Integration**: Connect to actual Telebirr/CBE APIs
5. **Admin Panel**: Complete admin dashboard
6. **Telegram Bot Logic**: Implement full payment flow handling
7. **Notifications**: Email and SMS confirmations
8. **Testing**: Unit and integration tests

## Important Notes

- This is an MVP (Minimum Viable Product) architecture
- Payment verification is manual via admin dashboard
- Real bank integration can be added incrementally
- Telegram bot handles coordination, not payments directly
- Video calls route through Jitsi/Daily, not Telegram
