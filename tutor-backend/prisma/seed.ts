import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create a student
    const studentPassword = await bcrypt.hash('password123', 10);
    const student = await prisma.user.upsert({
        where: { email: 'student@test.com' },
        update: {},
        create: {
            email: 'student@test.com',
            fullName: 'Test Student',
            passwordHash: studentPassword,
            role: Role.STUDENT,
        },
    });
    console.log('Created student:', student.email);

    // Create tutors
    const tutorPassword = await bcrypt.hash('tutor123', 10);

    const tutor1 = await prisma.user.upsert({
        where: { email: 'abebe@tutor.com' },
        update: {},
        create: {
            email: 'abebe@tutor.com',
            fullName: 'Dr. Abebe Kebede',
            passwordHash: tutorPassword,
            role: Role.TUTOR,
            tutorProfile: {
                create: {
                    bio: 'Experienced mathematician with a passion for teaching. Specialized in calculus and linear algebra.',
                    subjects: ['Mathematics', 'Calculus', 'Algebra'],
                    hourlyRate: 500,
                    isVerified: true,
                },
            },
        },
    });
    console.log('Created tutor:', tutor1.email);

    const tutor2 = await prisma.user.upsert({
        where: { email: 'marta@tutor.com' },
        update: {},
        create: {
            email: 'marta@tutor.com',
            fullName: 'Marta Tekle',
            passwordHash: tutorPassword,
            role: Role.TUTOR,
            tutorProfile: {
                create: {
                    bio: 'English literature expert with 6 years of teaching experience.',
                    subjects: ['English', 'Literature', 'Writing'],
                    hourlyRate: 450,
                    isVerified: true,
                },
            },
        },
    });
    console.log('Created tutor:', tutor2.email);

    const tutor3 = await prisma.user.upsert({
        where: { email: 'yonas@tutor.com' },
        update: {},
        create: {
            email: 'yonas@tutor.com',
            fullName: 'Yonas Desta',
            passwordHash: tutorPassword,
            role: Role.TUTOR,
            tutorProfile: {
                create: {
                    bio: 'Physics teacher with expertise in mechanics and thermodynamics.',
                    subjects: ['Physics', 'Mechanics', 'Thermodynamics'],
                    hourlyRate: 600,
                    isVerified: false,
                },
            },
        },
    });
    console.log('Created tutor:', tutor3.email);

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
