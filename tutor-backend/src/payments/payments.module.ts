import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { AdminModule } from '../admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [BookingsModule, AdminModule, PrismaModule, NotificationsModule],
    providers: [PaymentsService],
    controllers: [PaymentsController],
})
export class PaymentsModule { }
