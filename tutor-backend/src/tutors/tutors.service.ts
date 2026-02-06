import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TutorsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query?: string) {
        const whereClause: any = {
            role: 'TUTOR',
        };

        if (query) {
            whereClause.OR = [
                { fullName: { contains: query, mode: 'insensitive' } },
                { tutorProfile: { subjects: { hasSome: [query] } } }, // Simplistic subject matching
                { tutorProfile: { bio: { contains: query, mode: 'insensitive' } } },
            ];
        }

        const tutors = await this.prisma.user.findMany({
            where: whereClause,
            include: {
                tutorProfile: true,
            },
        });

        return tutors.map(this.mapToDto);
    }

    async findOne(id: string) {
        const tutor = await this.prisma.user.findUnique({
            where: { id },
            include: {
                tutorProfile: true,
            },
        });

        if (!tutor || tutor.role !== 'TUTOR') {
            throw new NotFoundException(`Tutor with ID ${id} not found`);
        }

        return this.mapToDto(tutor);
    }

    private mapToDto(user: any) {
        const profile = user.tutorProfile || {};
        return {
            id: user.id, // Keeping string UUID
            name: user.fullName,
            photo: 'https://github.com/shadcn.png', // Placeholder or add photoUrl to schema
            specialization: profile.subjects?.[0] || 'General',
            hourlyRate: profile.hourlyRate || 0,
            rating: 4.5, // Placeholder - add ratings table later
            reviewCount: 10, // Placeholder
            yearsExperience: 5, // Placeholder
            location: 'Addis Ababa', // Placeholder
            bio: profile.bio || 'No bio available',
            qualifications: profile.subjects || [],
            isVerified: profile.isVerified || false,
            responseTime: 30, // Placeholder
        };
    }
}
