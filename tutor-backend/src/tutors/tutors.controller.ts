import { Controller, Get, Param, Query } from '@nestjs/common';
import { TutorsService } from './tutors.service';

@Controller('tutors')
export class TutorsController {
    constructor(private readonly tutorsService: TutorsService) { }

    @Get()
    findAll(@Query('query') query: string) {
        return this.tutorsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tutorsService.findOne(id);
    }
}
