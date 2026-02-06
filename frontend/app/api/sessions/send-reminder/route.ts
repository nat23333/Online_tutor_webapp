import { NextRequest, NextResponse } from 'next/server';
import { TelegramBot } from '@/lib/telegram-bot';

/**
 * Send session reminders to student and tutor
 * Should be called 30 minutes, 1 hour, and 24 hours before session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      studentChatId,
      tutorChatId,
      meetingLink,
      sessionTime,
      studentName,
      tutorName,
      subject,
      reminderType, // 'urgent' (30 min), 'final' (1 hour), 'advance' (24 hours)
    } = body;

    if (!sessionId || !meetingLink || !sessionTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reminderMessages: Record<string, { student: string; tutor: string }> = {
      advance: {
        student: `
📚 <b>Session Reminder - Tomorrow!</b>

Your tutoring session is scheduled for tomorrow:

<b>Tutor:</b> ${tutorName}
<b>Subject:</b> ${subject}
<b>Time:</b> ${sessionTime}

<b>👉 <a href="${meetingLink}">Join Session</a></b>

Make sure to:
✓ Have a quiet study space
✓ Test your internet connection
✓ Join 5 minutes early
✓ Have camera/mic ready

See you tomorrow! 📖
`,
        tutor: `
📚 <b>Session Reminder - Tomorrow!</b>

You have a tutoring session tomorrow:

<b>Student:</b> ${studentName}
<b>Subject:</b> ${subject}
<b>Time:</b> ${sessionTime}

<b>Meeting Link:</b> <a href="${meetingLink}">${meetingLink}</a>

Prepare your materials and be ready 5 minutes early!
`,
      },
      final: {
        student: `
🚀 <b>Session Starting in 1 Hour!</b>

Your tutoring session is starting soon:

<b>Tutor:</b> ${tutorName}
<b>Subject:</b> ${subject}
<b>Time:</b> ${sessionTime}

<b>👉 <a href="${meetingLink}">Join Now</a></b>

Ready your materials and join when you're ready!
`,
        tutor: `
🚀 <b>Session Starting in 1 Hour!</b>

Your student will be joining soon:

<b>Student:</b> ${studentName}
<b>Subject:</b> ${subject}
<b>Time:</b> ${sessionTime}

<b>Meeting Link:</b> <a href="${meetingLink}">${meetingLink}</a>

Be ready to start in 1 hour!
`,
      },
      urgent: {
        student: `
⏰ <b>Session Starting in 30 Minutes!</b>

Join your tutoring session now!

<b>Tutor:</b> ${tutorName}
<b>Subject:</b> ${subject}

<b>👉 <a href="${meetingLink}">Join Session</a></b>

Your tutor is waiting for you!
`,
        tutor: `
⏰ <b>Session Starting in 30 Minutes!</b>

Get ready to welcome your student!

<b>Student:</b> ${studentName}
<b>Subject:</b> ${subject}

<b>Meeting Link:</b> <a href="${meetingLink}">${meetingLink}</a>

Your student should join soon!
`,
      },
    };

    const messages = reminderMessages[reminderType] || reminderMessages.advance;

    // Send reminders
    const results = {
      studentReminder: null,
      tutorReminder: null,
      errors: [],
    };

    if (studentChatId) {
      try {
        results.studentReminder = await TelegramBot.sendMessage(
          studentChatId,
          messages.student
        );
      } catch (error) {
        results.errors.push(`Failed to send student reminder: ${error}`);
      }
    }

    if (tutorChatId) {
      try {
        results.tutorReminder = await TelegramBot.sendMessage(
          tutorChatId,
          messages.tutor
        );
      } catch (error) {
        results.errors.push(`Failed to send tutor reminder: ${error}`);
      }
    }

    // Log reminder sent
    console.log('[Session Reminder Sent]', {
      sessionId,
      reminderType,
      timestamp: new Date().toISOString(),
      sent: {
        toStudent: !!results.studentReminder,
        toTutor: !!results.tutorReminder,
      },
      errors: results.errors,
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error sending session reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
}
