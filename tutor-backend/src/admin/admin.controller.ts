import { Controller, Get, Patch, Param, Body, UseGuards, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('tutors/pending')
    async getPending() {
        return this.adminService.getPendingTutors();
    }

    @Patch('tutors/:id/verify')
    async verify(@Param('id') id: string, @Body('status') status: boolean) {
        return this.adminService.verifyTutor(id, status);
    }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('payments')
    async getPayments() {
        // Assume this method exists in AdminService
        return this.adminService.getPendingPayments();
    }

    @Patch('payments/:id/verify')
    async verifyPayment(@Param('id') id: string, @Body('status') status: boolean) {
        return this.adminService.verifyPayment(id, status);
    }

    @Public()
    @Post('telegram/webhook')
    async telegramWebhook(@Body() update: any) {
        return this.adminService.handleTelegramWebhook(update);
    }
}
