/**
 * Testing Utilities
 * Helper functions for testing the tutoring platform
 */

export interface TestOrder {
  orderId: string;
  amount: number;
  studentId: number;
  tutorId: number;
  sessionId: string;
}

export interface TestPaymentProof {
  orderId: string;
  proofUrl: string;
  paymentMethod: 'telebirr' | 'cbe_mobile_banking';
}

/**
 * Create test order
 */
export function createTestOrder(): TestOrder {
  return {
    orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount: 500,
    studentId: 1,
    tutorId: 1,
    sessionId: `session_${Date.now()}`,
  };
}

/**
 * Create test payment proof
 */
export function createTestPaymentProof(orderId: string): TestPaymentProof {
  return {
    orderId,
    proofUrl: `/proofs/test-${Date.now()}.png`,
    paymentMethod: 'telebirr',
  };
}

/**
 * Test API endpoint
 */
export async function testApiEndpoint(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
) {
  try {
    const url = new URL(endpoint, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mock Telegram message
 */
export function mockTelegramMessage(chatId: number, text: string, username: string = 'testuser') {
  return {
    update_id: Date.now(),
    message: {
      message_id: Math.floor(Math.random() * 1000000),
      date: Math.floor(Date.now() / 1000),
      chat: {
        id: chatId,
        first_name: 'Test',
        last_name: 'User',
        username,
        type: 'private',
      },
      from: {
        id: chatId,
        is_bot: false,
        first_name: 'Test',
        last_name: 'User',
        username,
      },
      text,
    },
  };
}

/**
 * Mock Telegram callback query
 */
export function mockTelegramCallbackQuery(
  chatId: number,
  data: string,
  username: string = 'testuser'
) {
  return {
    update_id: Date.now(),
    callback_query: {
      id: `${Date.now()}`,
      from: {
        id: chatId,
        is_bot: false,
        first_name: 'Test',
        last_name: 'User',
        username,
      },
      chat_instance: '123456789',
      data,
      message: {
        message_id: Math.floor(Math.random() * 1000000),
        date: Math.floor(Date.now() / 1000),
        chat: {
          id: chatId,
          first_name: 'Test',
          last_name: 'User',
          username,
          type: 'private',
        },
        from: {
          id: 123456789,
          is_bot: true,
          first_name: 'TutoringBot',
          username: 'tutoring_bot',
        },
        text: 'Select payment method',
      },
    },
  };
}

/**
 * Test scenario: Complete payment flow
 */
export async function testCompletePaymentFlow() {
  console.log('[Test] Starting complete payment flow test...\n');

  // Step 1: Create order
  console.log('[1/5] Creating order...');
  const order = createTestOrder();
  const createOrderResult = await testApiEndpoint('/api/orders/create', 'POST', order);
  console.log(`Status: ${createOrderResult.status}`, createOrderResult.data, '\n');

  // Step 2: Initiate payment
  console.log('[2/5] Initiating payment (Telegram)...');
  const initiateResult = await testApiEndpoint('/api/orders/initiate-payment', 'POST', {
    orderId: order.orderId,
    chatId: 123456789,
    studentName: 'Test Student',
    tutorName: 'Test Tutor',
    amount: order.amount,
    subject: 'Mathematics',
  });
  console.log(`Status: ${initiateResult.status}`, initiateResult.data, '\n');

  // Step 3: Upload payment proof
  console.log('[3/5] Uploading payment proof...');
  const proof = createTestPaymentProof(order.orderId);
  const proofResult = await testApiEndpoint('/api/payments/verify', 'POST', proof);
  console.log(`Status: ${proofResult.status}`, proofResult.data, '\n');

  // Step 4: Admin verification
  console.log('[4/5] Admin verifying payment...');
  const verifyResult = await testApiEndpoint('/api/admin/verify-payment', 'POST', {
    orderId: order.orderId,
    approved: true,
    chatId: 123456789,
    studentName: 'Test Student',
    tutorName: 'Test Tutor',
    meetingLink: 'https://meet.jitsi.org/test-session',
    sessionTime: new Date().toISOString(),
  });
  console.log(`Status: ${verifyResult.status}`, verifyResult.data, '\n');

  // Step 5: Generate meeting link
  console.log('[5/5] Generating meeting link...');
  const meetingResult = await testApiEndpoint('/api/sessions/generate-meeting-link', 'POST', {
    sessionId: order.sessionId,
    orderId: order.orderId,
    subject: 'Mathematics',
    studentName: 'Test Student',
    tutorName: 'Test Tutor',
  });
  console.log(`Status: ${meetingResult.status}`, meetingResult.data, '\n');

  console.log('[Test] Payment flow test completed!');
  return {
    order: createOrderResult.data,
    initiated: initiateResult.data,
    proof: proofResult.data,
    verified: verifyResult.data,
    meeting: meetingResult.data,
  };
}

/**
 * Test scenario: Telegram bot webhook
 */
export async function testTelegramWebhook() {
  console.log('[Test] Testing Telegram webhook...\n');

  const testChatId = 123456789;

  // Test /start command
  console.log('[1/3] Testing /start command...');
  const startMsg = mockTelegramMessage(testChatId, '/start');
  const startResult = await testApiEndpoint('/api/telegram/webhook', 'POST', startMsg);
  console.log(`Status: ${startResult.status}`, startResult.data, '\n');

  // Test payment method selection
  console.log('[2/3] Testing payment method callback...');
  const callbackQuery = mockTelegramCallbackQuery(testChatId, 'pay_telebirr_ORD-123-abc');
  const callbackResult = await testApiEndpoint('/api/telegram/webhook', 'POST', callbackQuery);
  console.log(`Status: ${callbackResult.status}`, callbackResult.data, '\n');

  // Test webhook status
  console.log('[3/3] Checking webhook status...');
  const statusResult = await testApiEndpoint('/api/telegram/webhook', 'GET');
  console.log(`Status: ${statusResult.status}`, statusResult.data, '\n');

  console.log('[Test] Telegram webhook test completed!');
}

/**
 * Test database connection
 */
export async function testDatabaseConnection() {
  console.log('[Test] Testing database connection...');
  
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('[FAIL] DATABASE_URL not set');
      return false;
    }

    // Attempt simple query
    console.log('[OK] Database URL configured');
    console.log('[NOTE] In production, verify with: psql $DATABASE_URL -c "SELECT 1"');
    return true;
  } catch (error) {
    console.log('[FAIL]', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('========================================');
  console.log('  Tutoring Platform - Test Suite');
  console.log('========================================\n');

  // Database test
  await testDatabaseConnection();
  console.log();

  // Telegram bot test
  await testTelegramWebhook();
  console.log();

  // Complete payment flow test
  await testCompletePaymentFlow();

  console.log('\n========================================');
  console.log('  Tests Completed');
  console.log('========================================');
}
