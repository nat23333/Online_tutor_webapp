# Deployment & Testing Guide

## Pre-Deployment Checklist

### Environment Variables Setup
Before deploying, ensure all required environment variables are set in your Vercel project:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/tutoring_platform

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret_here

# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production
```

### Database Setup
1. Create PostgreSQL database on your hosting provider (Neon, AWS RDS, etc.)
2. Run migration script:
```bash
psql $DATABASE_URL < scripts/init-db.sql
```
3. Verify tables:
```bash
psql $DATABASE_URL -c "\dt"
```

### Telegram Bot Configuration
1. Create bot with BotFather (@BotFather on Telegram)
2. Get bot token and save to environment variables
3. Generate webhook secret (random string)
4. Set webhook URL:
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourdomain.com/api/telegram/webhook",
    "secret_token": "<YOUR_WEBHOOK_SECRET>"
  }'
```

## Vercel Deployment

### Step 1: Connect Repository
```bash
vercel login
vercel link
```

### Step 2: Configure Environment Variables
In Vercel dashboard:
1. Project Settings → Environment Variables
2. Add all variables from checklist above
3. Set for Production environment

### Step 3: Deploy
```bash
vercel deploy --prod
```

Or push to git and Vercel will auto-deploy.

## Testing Procedures

### 1. API Endpoint Testing

#### Create Order
```bash
curl -X POST https://yourdomain.com/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_test_001",
    "studentId": 1,
    "tutorId": 1,
    "amount": 500
  }'
```

**Expected Response:**
```json
{
  "orderId": "ORD-1707001234567-abc123",
  "status": "pending_payment",
  "amount": 500,
  "expiryTime": "2026-02-04T11:15:00Z"
}
```

#### Initiate Payment (Telegram)
```bash
curl -X POST https://yourdomain.com/api/orders/initiate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1707001234567-abc123",
    "chatId": 123456789,
    "studentName": "Test Student",
    "tutorName": "Test Tutor",
    "amount": 500,
    "subject": "Mathematics"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment instructions sent to Telegram",
  "orderId": "ORD-1707001234567-abc123"
}
```

#### Upload Payment Proof
```bash
curl -X POST https://yourdomain.com/api/payments/verify \
  -F "file=@receipt.png" \
  -F "orderId=ORD-1707001234567-abc123" \
  -F "paymentMethod=telebirr"
```

**Expected Response:**
```json
{
  "id": "proof-1707001234567",
  "orderId": "ORD-1707001234567-abc123",
  "status": "pending",
  "uploadedAt": "2026-02-04T10:20:00Z"
}
```

### 2. Telegram Bot Testing

#### Send Test Message
1. Find your bot on Telegram
2. Send message: `/start`
3. Bot should respond with welcome message

#### Test Payment Flow
1. Book session via web app
2. Click "Proceed to Payment"
3. You should see payment method buttons on Telegram
4. Click "Telebirr" or "CBE Mobile"
5. Bot should send payment instructions

#### Verify Webhook
```bash
curl -X GET https://yourdomain.com/api/telegram/webhook
```

**Expected Response:**
```json
{
  "status": "Telegram webhook is active"
}
```

### 3. Payment Verification Testing

#### Admin Approval
```bash
curl -X POST https://yourdomain.com/api/admin/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1707001234567-abc123",
    "approved": true,
    "chatId": 123456789,
    "studentName": "Test Student",
    "tutorName": "Test Tutor",
    "meetingLink": "https://meet.jitsi.org/test-session",
    "sessionTime": "2026-02-05 14:00 UTC"
  }'
```

#### Admin Rejection
```bash
curl -X POST https://yourdomain.com/api/admin/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1707001234567-abc123",
    "approved": false,
    "chatId": 123456789,
    "reason": "Receipt is blurry. Please resubmit a clearer image."
  }'
```

### 4. Video Session Testing

#### Generate Meeting Link
```bash
curl -X POST https://yourdomain.com/api/sessions/generate-meeting-link \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_test_001",
    "orderId": "ORD-1707001234567-abc123",
    "subject": "Mathematics",
    "studentName": "Test Student",
    "tutorName": "Test Tutor"
  }'
```

**Expected Response:**
```json
{
  "id": "session_test_001",
  "meetingLink": "https://meet.jitsi.org/tutoring-abc123-1707001234567",
  "expiresAt": "2026-02-05T10:20:00Z"
}
```

#### Send Session Reminder
```bash
curl -X POST https://yourdomain.com/api/sessions/send-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_test_001",
    "studentChatId": 123456789,
    "tutorChatId": 987654321,
    "meetingLink": "https://meet.jitsi.org/tutoring-abc123",
    "sessionTime": "2026-02-05 14:00 UTC",
    "studentName": "Test Student",
    "tutorName": "Test Tutor",
    "subject": "Mathematics",
    "reminderType": "advance"
  }'
```

### 5. End-to-End Testing

**Complete Payment Flow:**

1. **Student Books Session**
   - Navigate to home page
   - Click "Book Session" or use BrowseTutors
   - Select tutor, time, duration, subject
   - Click "Proceed to Payment"

2. **Payment Method Selection (Telegram)**
   - Bot receives order details
   - Student selects payment method
   - Bot sends payment instructions

3. **Payment Upload**
   - Student returns to web app
   - Uploads payment receipt
   - Status: "Awaiting Verification"

4. **Admin Verification**
   - Admin logs in to verification dashboard
   - Reviews payment proof
   - Clicks "Approve Payment"

5. **Meeting Link Delivery**
   - Student receives Telegram notification with meeting link
   - Meeting link also appears in dashboard

6. **Session Execution**
   - Student/Tutor join meeting via link
   - Jitsi session runs
   - Both can see, hear, and share screens

7. **Feedback**
   - After session ends, student rates and provides feedback
   - Rating updates tutor's profile

## Monitoring & Debugging

### Check Logs
```bash
# Vercel logs
vercel logs

# Real-time logs
vercel logs --follow
```

### Monitor Database
```bash
# Connect to database
psql $DATABASE_URL

# Check payment status
SELECT * FROM orders WHERE order_id = 'ORD-xxx';
SELECT * FROM payment_proofs WHERE order_id = (SELECT id FROM orders WHERE order_id = 'ORD-xxx');
SELECT * FROM payments WHERE order_id = (SELECT id FROM orders WHERE order_id = 'ORD-xxx');
```

### Test Telegram Webhook
Get latest webhook updates:
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/getUpdates
```

## Production Safety Checklist

- [ ] All environment variables set in production
- [ ] Database backups enabled
- [ ] Telegram bot token secured (use environment variables)
- [ ] Rate limiting enabled on API endpoints
- [ ] Input validation on all forms
- [ ] Error logging configured
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Admin authentication implemented
- [ ] Payment verification workflow tested end-to-end
- [ ] Session reminders tested
- [ ] Jitsi meeting room creation verified
- [ ] Database migrations run successfully
- [ ] Webhook secret validated on each request

## Rollback Procedure

If issues occur after deployment:

```bash
# Revert to previous version
vercel rollback

# Or redeploy specific commit
vercel deploy --prod --with-cache=false
```

## Scaling Considerations

### Database
- Add read replicas for scaling
- Implement connection pooling
- Monitor slow queries

### Telegram Bot
- Use Redis for session caching
- Implement message queue for notifications
- Rate limit webhook processing

### Payment Processing
- Implement idempotency keys
- Add transaction retry logic
- Monitor failed payments

### Video Sessions
- Consider Jitsi self-hosted for high scale
- Implement auto-scaling for meeting rooms
- Monitor bandwidth usage

## Support & Troubleshooting

### Common Issues

**Telegram Bot Not Responding**
- Verify bot token in environment variables
- Check webhook URL is publicly accessible
- Verify webhook secret matches
- Check Telegram logs for errors

**Payment Proof Not Uploading**
- Check file size limits (max 5MB)
- Verify file type (PNG, JPEG, PDF only)
- Check storage/disk space
- Verify API endpoint is accessible

**Meeting Link Not Generating**
- Verify Jitsi Meet API is accessible
- Check room name uniqueness
- Verify HTTPS on production

**Payment Verification Failing**
- Verify admin authentication
- Check order ID exists in database
- Verify payment status transitions
- Check Telegram chat ID is valid

## Next Steps

After successful deployment:

1. Monitor payment processing for 24 hours
2. Collect user feedback
3. Optimize based on analytics
4. Implement semi-automatic verification
5. Connect to actual bank APIs
6. Scale infrastructure as needed
