import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from '../bookings/bookings.service';
import { AdminService } from '../admin/admin.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(
        private prisma: PrismaService,
        private bookingsService: BookingsService,
        private adminService: AdminService,
    ) { }

    async initiatePayment(userId: string, dto: InitiatePaymentDto) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
        });

        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.studentId !== userId) throw new ConflictException('Unauthorized booking access');

        const payment = await this.prisma.payment.create({
            data: {
                bookingId: dto.bookingId,
                amount: dto.amount,
                status: PaymentStatus.PENDING,
                provider: dto.provider,
            },
        });

        // Duplicate Notification Removed (as requested by user)

        // Mock: Return a checkout URL (in real app, call Chapa/Stripe API here)
        return {
            paymentId: payment.id,
            checkoutUrl: `https://checkout.example.com/${payment.id}`,
        };
    }

    async verifyPayment(dto: PaymentWebhookDto) {
        // Find payment by some identifier
        const payment = await this.prisma.payment.findFirst({
            where: { id: dto.transactionId }
        });

        if (!payment) throw new NotFoundException('Payment record not found');

        if (dto.status === 'success') {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: PaymentStatus.COMPLETED, transactionId: dto.transactionId },
            });

            // Confirm the booking
            await this.bookingsService.confirmBooking(payment.bookingId, 'SYSTEM');
        } else {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: PaymentStatus.FAILED, transactionId: dto.transactionId },
            });
        }

        return { success: true };
    }

    async handleManualProof(paymentId: string, filePath: string) {
        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException('Payment not found');

        // We use transactionId to store the file path for manual proofs for now
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                transactionId: filePath,
                provider: payment.provider || 'MANUAL_UPLOAD'
            }
        });

        // Notify Admin of manual upload WITH THE FILE
        await this.adminService.notifyAdmin(paymentId, payment.amount, 'MANUAL_Proof_Uploaded', filePath);

        return { success: true };
    }
}
