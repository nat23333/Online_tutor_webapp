import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) { }

    @Get()
    async getMyNotifications(@Request() req) {
        return this.notificationsService.getNotifications(req.user.id);
    }

    @Patch(':id/read')
    async markRead(@Param('id') id: string, @Request() req) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Patch('read-all')
    async markAllRead(@Request() req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
}
