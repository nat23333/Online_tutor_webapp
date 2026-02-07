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

        // For now, return all tutors regardless of verification for easier testing
        // In production, we would filter by isVerified: true
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

    async upsertProfile(userId: string, data: any) {
        // First ensure user is a TUTOR
        await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'TUTOR' }
        });

        return this.prisma.tutorProfile.upsert({
            where: { userId },
            update: {
                bio: data.bio,
                hourlyRate: data.hourlyRate,
                subjects: data.skills || [],
            },
            create: {
                userId,
                bio: data.bio,
                hourlyRate: data.hourlyRate,
                subjects: data.skills || [],
                isVerified: false, // Default to false, admin must verify
            },
        });
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
