# Tutoring Platform - Ethiopian Payment Integration

A comprehensive tutoring booking platform built with Next.js that integrates Telegram bot automation and Ethiopian payment methods (Telebirr and CBE Mobile Banking). Students can book sessions with verified tutors, process payments securely with manual admin verification, and conduct video sessions via Jitsi.

## Key Features

### For Students
- **Browse & Book**: Search tutors by subject, specialization, and ratings
- **Flexible Scheduling**: Choose preferred time slots
- **Multiple Payment Options**: Telebirr and CBE Mobile Banking support
- **Telegram Integration**: Receive payment instructions and session reminders on Telegram
- **Live Sessions**: Join Jitsi video meetings with tutors
- **Session Feedback**: Rate sessions and provide constructive feedback
- **Dashboard**: Track upcoming and past sessions

### For Tutors
- **Profile Management**: Set hourly rates, specializations, qualifications
- **Availability Control**: Define working hours and days
- **Session Management**: View scheduled and completed sessions
- **Earnings Tracking**: Monitor income and session history
- **Student Reviews**: Receive and respond to student feedback
- **Dashboard**: Real-time session alerts and student interactions

### For Admin
- **Payment Verification**: Manual review of payment receipts
- **Admin Dashboard**: Monitor pending verifications and approve/reject
- **Session Oversight**: Track all platform activity
- **Revenue Analytics**: View earnings and transaction history
- **User Management**: Manage tutors, students, and sessions

## Architecture

```
┌─────────────────┐
│   Web App       │ ← Student/Tutor Interface (Next.js)
│  (Next.js)      │
└────────┬────────┘
         │
    ┌────▼──────────────────┐
    │  Backend API           │
    │  ├─ Orders/Payments    │
    │  ├─ Sessions           │
    │  ├─ Admin              │
    │  └─ Telegram Webhook   │
    └────┬──────────────────┘
         │
    ┌────┴──────────┬──────────────┬──────────────┐
    │               │              │              │
┌───▼────┐  ┌──────▼────┐  ┌─────▼────┐  ┌─────▼────┐
│Database│  │Telegram   │  │ Jitsi    │  │ File     │
│(PG)    │  │ Bot API   │  │ Meet     │  │ Storage  │
└────────┘  └───────────┘  └──────────┘  └──────────┘
```

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui Components
- React Hook Form

**Backend**
- Next.js API Routes
- PostgreSQL
- Node.js

**External Services**
- Telegram Bot API
- Jitsi Meet
- Payment Methods: Telebirr, CBE Mobile Banking

## Project Structure

```
├── /app
│   ├── /api
│   │   ├── /orders         # Booking & order management
│   │   ├── /payments       # Payment processing
│   │   ├── /sessions       # Session management
│   │   ├── /admin          # Admin operations
│   │   └── /telegram       # Telegram bot webhook
│   ├── /session            # Video session page
│   ├── /admin              # Admin dashboard
│   ├── page.tsx            # Main booking flow
│   └── layout.tsx          # Root layout
│
├── /components
│   ├── BookingForm.tsx            # Tutor & time selection
│   ├── PaymentMethodSelector.tsx  # Payment options
│   ├── PaymentProofUpload.tsx     # Receipt upload
│   ├── BrowseTutors.tsx           # Tutor search
│   ├── StudentDashboard.tsx       # Student interface
│   ├── TutorDashboard.tsx         # Tutor interface
│   ├── TutorAvailabilityEditor.tsx # Schedule management
│   ├── AdminPaymentVerification.tsx # Admin panel
│   └── JitsiMeetingRoom.tsx       # Video session
│
├── /lib
│   ├── telegram-bot.ts     # Telegram bot utilities
│   ├── test-helpers.ts     # Testing utilities
│   └── utils.ts            # General utilities
│
├── /scripts
│   └── init-db.sql         # Database schema
│
├── SETUP.md                # Setup instructions
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```

## Quick Start

### 1. Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Telegram bot token (from @BotFather)

### 2. Installation
```bash
git clone <repo>
cd tutoring-platform
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tutoring_platform
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_SECRET=your_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Database Setup
```bash
psql tutoring_platform < scripts/init-db.sql
```

### 5. Telegram Webhook
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3000/api/telegram/webhook",
    "secret_token": "your_webhook_secret"
  }'
```

### 6. Start Development
```bash
npm run dev
```

Visit http://localhost:3000

## Payment Flow

### Step-by-Step Process

1. **Booking (Web App)**
   - Student selects tutor and preferred time
   - System generates unique order ID
   - Order expires in 15 minutes

2. **Payment Method Selection (Telegram)**
   - Student clicks "Pay via Telegram"
   - Bot shows Telebirr or CBE Mobile options
   - Student chooses preferred method

3. **Payment Instructions (Telegram)**
   - Bot sends detailed payment info
   - Merchant account/number included
   - Reference ID = Order ID

4. **Payment Proof Upload (Web App)**
   - Student takes screenshot of confirmation
   - Uploads via web app
   - Status: "Awaiting Verification"

5. **Admin Review (Admin Dashboard)**
   - Admin sees payment proof
   - Cross-checks with bank app
   - Approves or rejects with reason

6. **Meeting Link Delivery (Telegram)**
   - Student receives Jitsi meeting link
   - Also sent to tutor
   - Session confirmed

7. **Video Session (Jitsi)**
   - Both join 5 minutes early
   - Screen sharing available
   - Can record session (optional)

8. **Post-Session**
   - Student rates tutor (1-5 stars)
   - Provides feedback
   - Tutor receives notification

## API Endpoints

### Orders
- `POST /api/orders/create` - Create booking order
- `POST /api/orders/initiate-payment` - Send payment info to Telegram

### Payments
- `POST /api/payments/verify` - Upload payment receipt

### Sessions
- `POST /api/sessions/generate-meeting-link` - Create Jitsi room
- `POST /api/sessions/send-reminder` - Send Telegram reminders
- `POST /api/sessions/submit-feedback` - Submit session rating

### Admin
- `POST /api/admin/verify-payment` - Approve/reject payment
- `POST /api/admin/notify-payment-proof` - Alert admin of new proof

### Telegram
- `POST /api/telegram/webhook` - Receive Telegram updates
- `POST /api/telegram/send-message` - Send Telegram messages

## Database Schema

### Core Tables
- **users** - Students, tutors, admins
- **tutors** - Tutor profiles with rates
- **sessions** - Tutoring session bookings
- **orders** - Payment orders with status
- **payments** - Payment transaction records
- **payment_proofs** - Uploaded receipts for verification
- **telegram_users** - Telegram user mappings

See `scripts/init-db.sql` for complete schema.

## Testing

### Manual Testing
Run test scenarios:
```bash
npm test
```

### API Testing
```bash
# Create order
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","studentId":1,"tutorId":1,"amount":500}'

# Initiate payment
curl -X POST http://localhost:3000/api/orders/initiate-payment \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORD-123","chatId":123456789,"amount":500}'
```

See `DEPLOYMENT.md` for complete testing guide.

## Deployment

### Vercel (Recommended)
```bash
vercel deploy --prod
```

### Manual Deployment
1. Build: `npm run build`
2. Start: `npm start`
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL certificate

See `DEPLOYMENT.md` for detailed instructions.

## Scaling Path

### MVP (Current)
- Manual payment verification
- Single Jitsi instance
- PostgreSQL database

### Phase 2
- Semi-automatic verification (bot parses SMS)
- Redis caching for performance
- Email notifications

### Phase 3
- Direct bank API integration
- Multi-region Jitsi deployment
- Advanced analytics dashboard
- Mobile app

## Security Considerations

- Password hashing with bcrypt
- HTTP-only session cookies
- CSRF protection
- Rate limiting on API endpoints
- Input validation/sanitization
- Telegram webhook secret verification
- Order expiry (fraud prevention)
- One receipt per order
- Auto-ban on repeated invalid uploads

## Support & Documentation

- **Setup**: See `SETUP.md`
- **Deployment**: See `DEPLOYMENT.md`
- **API Reference**: See endpoint comments in code
- **Troubleshooting**: See DEPLOYMENT.md under "Common Issues"

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push: `git push origin feature/your-feature`
4. Submit pull request

## License

MIT License - See LICENSE file

## Roadmap

- [ ] Direct Telebirr API integration
- [ ] Direct CBE API integration
- [ ] Mobile app (React Native)
- [ ] AI-powered tutor matching
- [ ] Course library & curriculum
- [ ] Tutor certification system
- [ ] Advanced payment analytics
- [ ] Multi-language support
- [ ] Accessibility improvements

## Contact & Support

For issues, feature requests, or support:
- Email: support@tutoring.et
- Issues: GitHub Issues
- Documentation: See /docs folder

## Acknowledgments

Built with:
- Next.js & React teams
- shadcn/ui component library
- Telegram Bot API
- Jitsi Meet community
- PostgreSQL community

---

**Last Updated**: February 4, 2026
**Status**: Production Ready - MVP Phase
