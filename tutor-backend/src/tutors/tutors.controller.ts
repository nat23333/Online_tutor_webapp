import { Controller, Get, Param, Query, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { TutorsService } from './tutors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tutors')
export class TutorsController {
    constructor(private readonly tutorsService: TutorsService) { }

    @Public()
    @Get()
    findAll(@Query('query') query: string) {
        return this.tutorsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tutorsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('profile')
    upsertProfile(@Req() req, @Body() body: any) {
        return this.tutorsService.upsertProfile(req.user.sub, body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats')
    getStats(@Req() req) {
        return this.tutorsService.getStats(req.user.sub);
    }
}
