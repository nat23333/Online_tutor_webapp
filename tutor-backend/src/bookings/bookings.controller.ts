import { Controller, Post, Body, Req, UseGuards, Get, Param, Delete } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // assume exists
import { Roles } from '../common/decorators/roles.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private bookings: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Body() dto: CreateBookingDto) {
    const userId = req.user.sub;
    return this.bookings.createBooking(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req) {
    const role = req.user.role;
    const userId = req.user.sub;
    return this.bookings.listBookingsForUser(userId, role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Req() req, @Param('id') id: string) {
    const booking = await this.bookings.getBooking(id);
    // optional: check permission
    return booking;
  }

  // Student (after payment proof accepted) or admin confirms booking
  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm')
  async confirm(@Req() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.bookings.confirmBooking(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancel(@Req() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.bookings.cancelBooking(id, userId);
  }
}
