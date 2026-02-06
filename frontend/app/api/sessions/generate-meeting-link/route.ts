import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate a meeting link for a tutoring session
 * Called after payment is verified
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, orderId, subject, studentName, tutorName } = body;

    if (!sessionId || !orderId) {
      return NextResponse.json(
        { error: 'Missing sessionId or orderId' },
        { status: 400 }
      );
    }

    // Generate Jitsi meeting link
    // Format: https://meet.jitsi.org/{roomName}
    const roomName = `tutoring-${sessionId}-${Date.now()}`;
    const meetingLink = `https://meet.jitsi.org/${roomName}`;

    // TODO: Store meeting link in database
    // TODO: Send meeting link to both student and tutor
    // TODO: Create session reminders/notifications

    const session = {
      id: sessionId,
      orderId,
      meetingLink,
      subject: subject || 'Tutoring Session',
      studentName,
      tutorName,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    console.log('[Meeting Link Generated]', {
      sessionId,
      orderId,
      meetingLink,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error generating meeting link:', error);
    return NextResponse.json(
      { error: 'Failed to generate meeting link' },
      { status: 500 }
    );
  }
}
