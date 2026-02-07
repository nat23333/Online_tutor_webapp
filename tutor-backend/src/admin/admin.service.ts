import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from '../bookings/bookings.service';
import { NotificationsService } from '../notifications/notifications.service';
import axios from 'axios';
import * as fs from 'fs';
const FormData = require('form-data');

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private bookingsService: BookingsService,
        private notificationsService: NotificationsService
    ) { }

    async getPendingTutors() {
        return this.prisma.tutorProfile.findMany({
            where: { isVerified: false },
            include: { user: { select: { fullName: true, email: true } } },
        });
    }

    async getPendingPayments() {
        return this.prisma.payment.findMany({
            where: { status: 'PENDING' },
            include: {
                booking: {
                    include: {
                        student: { select: { fullName: true } },
                        tutor: { select: { fullName: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async verifyTutor(profileId: string, status: boolean) {
        const profile = await this.prisma.tutorProfile.findUnique({
            where: { id: profileId },
        });

        if (!profile) throw new NotFoundException('Tutor profile not found');

        return this.prisma.tutorProfile.update({
            where: { id: profileId },
            data: { isVerified: status },
        });
    }

    async getStats() {
        const tutorCount = await this.prisma.tutorProfile.count();
        const verifiedTutorCount = await this.prisma.tutorProfile.count({ where: { isVerified: true } });
        const studentCount = await this.prisma.user.count({ where: { role: 'STUDENT' } });
        const bookingCount = await this.prisma.booking.count();

        return {
            tutors: { total: tutorCount, verified: verifiedTutorCount },
            students: studentCount,
            bookings: bookingCount,
        };
    }

    async notifyAdmin(paymentId: string, amount: number, provider: string, filePath?: string) {
        // Sanitize environment variables (remove quotes and whitespace)
        const adminChatId = process.env.ADMIN_TELEGRAM_ID?.replace(/['"]/g, '').trim();
        const botToken = process.env.TELEGRAM_BOT_TOKEN?.replace(/['"]/g, '').trim();

        if (!adminChatId || !botToken) {
            console.warn('Telegram Admin ID or Bot Token not set, skipping notification');
            return;
        }

        console.log(`Attempting to notify Admin at ChatID: ${adminChatId} using BotToken ending in ...${botToken.slice(-5)}`);

        // Fetch student details from the payment -> booking -> student link
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                booking: {
                    include: {
                        student: { select: { fullName: true, telegramId: true } }
                    }
                }
            }
        });

        const studentName = payment?.booking?.student?.fullName || 'Unknown Student';
        const studentTelegramId = payment?.booking?.student?.telegramId;

        const adminMessage = `🔔 *New Payment Request*\n\n` +
            `👤 *Student:* ${studentName}\n` +
            `💰 *Amount:* ${amount} ETB\n` +
            `💳 *Provider:* ${provider}\n` +
            `🆔 *Payment ID:* \`${paymentId}\`\n\n` +
            `Please verify the payment screenshot and click below:`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '✅ Verify', callback_data: `verify:${paymentId}` },
                    { text: '❌ Reject', callback_data: `reject:${paymentId}` }
                ]
            ]
        };

        try {
            if (filePath && fs.existsSync(filePath)) {
                const form = new FormData();
                form.append('chat_id', adminChatId);
                form.append('caption', adminMessage);
                form.append('parse_mode', 'Markdown');
                form.append('reply_markup', JSON.stringify(keyboard));
                form.append('photo', fs.createReadStream(filePath));

                await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, form, {
                    headers: form.getHeaders()
                });
            } else {
                // 1. Notify Admin via Text
                await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    chat_id: adminChatId,
                    text: adminMessage,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            }

            // 2. Notify Student if they have linked Telegram
            if (studentTelegramId) {
                const studentMessage = `🙏 *Payment Initiation Received*\n\n` +
                    `Your payment of *${amount} ETB* for the tutoring session has been initiated via ${provider}.\n\n` +
                    `*Instructions:*\n` +
                    `1. Please complete the transfer to our account.\n` +
                    `2. Upload the screenshot of the transaction in the Webapp.\n` +
                    `3. Our team will verify and confirm your booking shortly.\n\n` +
                    `Thank you for choosing Tutora!`;

                await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    chat_id: studentTelegramId,
                    text: studentMessage,
                    parse_mode: 'Markdown'
                });
            }
        } catch (error) {
            console.error('Failed to send Telegram notification', error?.response?.data || error.message);
        }
    }

    async handleTelegramWebhook(update: any) {
        if (update.callback_query) {
            const data = update.callback_query.data;
            const callbackQueryId = update.callback_query.id;
            const chatId = update.callback_query.message.chat.id;
            const botToken = process.env.TELEGRAM_BOT_TOKEN?.replace(/['"]/g, '').trim();

            const [action, paymentId] = data.split(':');

            try {
                if (action === 'verify') {
                    await this.verifyPayment(paymentId, true);
                    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        chat_id: chatId,
                        text: `✅ Payment ${paymentId} has been VERIFIED and booking confirmed.`
                    });
                } else if (action === 'reject') {
                    await this.verifyPayment(paymentId, false);
                    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        chat_id: chatId,
                        text: `❌ Payment ${paymentId} has been REJECTED.`
                    });
                }

                // Answer callback query to stop the loading spinner on the button
                await axios.post(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                    callback_query_id: callbackQueryId
                });
            } catch (error) {
                console.error('Error handling Telegram callback', error);
            }
        }
    }

    async verifyPayment(paymentId: string, status: boolean) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { booking: { include: { student: true, tutor: true } } }
        });

        if (!payment) throw new NotFoundException('Payment record not found');

        const newStatus = status ? 'COMPLETED' : 'FAILED';

        await this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: newStatus },
        });

        if (status) {
            const result = await this.bookingsService.confirmBooking(payment.bookingId, 'ADMIN');

            // Create Dashboard Notification for Student
            await this.notificationsService.createNotification(
                payment.booking.studentId,
                'Payment Verified! ✅',
                `Your payment for the session with ${payment.booking.tutor.fullName} has been verified. You can now join the session at the scheduled time using the Video Call feature.`
            );

            // Notify Student of confirmation via Telegram
            const studentTelegramId = payment.booking?.student?.telegramId;
            const botToken = process.env.TELEGRAM_BOT_TOKEN?.replace(/['"]/g, '').trim();

            if (studentTelegramId && botToken) {
                const message = `🎊 *Booking Confirmed!*\n\n` +
                    `Your payment for the session with *${payment.booking?.tutor?.fullName}* has been verified.\n` +
                    `🕒 *Time:* ${payment.booking?.startTime?.toLocaleString()}\n` +
                    `🔗 *Meeting Link:* ${result.meetingLink}\n\n` +
                    `You can also find the link in your dashboard. See you there!`;

                await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    chat_id: studentTelegramId,
                    text: message,
                    parse_mode: 'Markdown'
                }).catch(e => console.error('Failed to notify student of confirmation', e.message));
            }
        } else {
            // Notify Student of rejection
            await this.notificationsService.createNotification(
                payment.booking.studentId,
                'Payment Rejected ❌',
                `Your payment proof for the session with ${payment.booking.tutor.fullName} was rejected. Please check your transaction details and try again.`
            );
        }

        return { success: true };
    }
}
