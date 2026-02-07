import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { randomBytes } from 'crypto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) { }

  private getLockKey(tutorId: string, startIso: string) {
    return `lock:tutor:${tutorId}:${startIso}`;
  }

  async createBooking(studentId: string, dto: CreateBookingDto) {
    // normalize start time to ISO (minute precision)
    const start = new Date(dto.startTime);
    start.setSeconds(0, 0);
    const startIso = start.toISOString();

    const lockKey = this.getLockKey(dto.tutorId, startIso);
    const redis = this.redisService.getClient();

    // try to acquire lock for 15 minutes (900 seconds)
    const lockSet = await redis.set(lockKey, 'locked', 'EX', 900, 'NX');
    if (!lockSet) {
      throw new ConflictException('This timeslot is being booked or already booked.');
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Fetch tutor profile to get hourly rate
    const tutorProfile = await this.prisma.tutorProfile.findUnique({
      where: { userId: dto.tutorId },
      select: { hourlyRate: true },
    });

    const hourlyRate = tutorProfile?.hourlyRate ?? 0;
    const amount = (hourlyRate * (dto.durationMins ?? 60)) / 60;

    const booking = await this.prisma.booking.create({
      data: {
        studentId,
        tutorId: dto.tutorId,
        startTime: start,
        durationMins: dto.durationMins ?? 60,
        status: BookingStatus.PENDING,
        expiresAt,
      },
    });

    console.log(`Booking created: ${booking.id}, Tutor: ${dto.tutorId}, Rate: ${hourlyRate}, Amount: ${amount}`);

    return {
      id: booking.id,
      orderId: booking.id,
      studentId: booking.studentId,
      tutorId: booking.tutorId,
      startTime: booking.startTime,
      durationMins: booking.durationMins,
      status: booking.status,
      amount: amount
    };
  }

  async getBooking(bookingId: string) {
    const b = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tutor: { select: { fullName: true } },
        student: { select: { fullName: true } }
      }
    });
    if (!b) throw new NotFoundException('Booking not found');
    return b;
  }

  async listBookingsForUser(userId: string, role: 'STUDENT' | 'TUTOR') {
    const where = role === 'STUDENT' ? { studentId: userId } : { tutorId: userId };
    return this.prisma.booking.findMany({
      where,
      include: {
        tutor: { select: { fullName: true } },
        student: { select: { fullName: true } }
      },
      orderBy: { startTime: 'desc' }
    });
  }

  // Called after payment is verified
  async confirmBooking(bookingId: string, actorId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.status !== BookingStatus.PENDING) {
      throw new ConflictException('Booking cannot be confirmed in its current state.');
    }

    // only tutor or admin or student who booked can confirm (adjust according to policy)
    // example: allow student or admin to trigger confirm
    if (booking.studentId !== actorId) {
      // allow if user is admin? Assume separate admin guard will control endpoint
      // For now just allow
    }

    const meetingLink = this.generateMeetingLink(booking.id);

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED, meetingLink, expiresAt: null },
    });

    // release the redis lock (slot is reserved as confirmed)
    const startIso = booking.startTime.toISOString();
    const lockKey = this.getLockKey(booking.tutorId, startIso);
    await this.redisService.getClient().del(lockKey);

    return updated;
  }

  async cancelBooking(bookingId: string, actorId: string) {
    const booking = await this.getBooking(bookingId);
    if (!([BookingStatus.PENDING, BookingStatus.CONFIRMED] as BookingStatus[]).includes(booking.status)) {
      throw new ConflictException('Booking cannot be cancelled in its current state.');
    }

    // permission check: student or admin
    // (implement real permission check with guards)

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    const lockKey = this.getLockKey(booking.tutorId, booking.startTime.toISOString());
    await this.redisService.getClient().del(lockKey);

    return updated;
  }

  // Generates Jitsi meeting link (MVP): room name = booking-{id}-{random}
  generateMeetingLink(bookingId: string) {
    const rnd = randomBytes(4).toString('hex');
    const room = `booking-${bookingId}-${rnd}`;
    // Use public Jitsi server for MVP:
    return `https://meet.jit.si/${room}`;
  }

  // Cron job that runs every minute to expire old pending bookings
  @Cron('* * * * *')
  async expirePendingBookings() {
    const now = new Date();
    const expired = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        expiresAt: { lt: now },
      },
    });

    if (expired.length === 0) return;

    for (const b of expired) {
      await this.prisma.booking.update({
        where: { id: b.id },
        data: { status: BookingStatus.EXPIRED },
      });

      // clear lock
      const key = this.getLockKey(b.tutorId, b.startTime.toISOString());
      await this.redisService.getClient().del(key);
    }
  }
}
