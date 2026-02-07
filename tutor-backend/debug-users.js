const { PrismaClient } = require('@prisma/client');
// require('dotenv').config(); 

console.log('Checking env vars...');
if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL is NOT set in environment.');
} else {
    console.log('DATABASE_URL IS set in environment.');
    console.log('URL starts with:', process.env.DATABASE_URL.substring(0, 20));
}

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Fetching Users ---');
        const users = await prisma.user.findMany({
            include: { tutorProfile: true }
        });

        if (users.length === 0) {
            console.log('No users found in database.');
        }

        users.forEach(user => {
            console.log(`User: ${user.email}`);
            console.log(`  ID: ${user.id}`);
            console.log(`  Name: ${user.fullName}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Has Profile: ${!!user.tutorProfile}`);
            if (user.tutorProfile) {
                console.log(`    Headline: ${user.tutorProfile.headline}`);
                console.log(`    Subjects: ${user.tutorProfile.subjects}`);
            }
            console.log('---');
        });
    } catch (e) {
        console.error('Error fetching users:', e.message);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
