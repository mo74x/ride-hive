/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        await prisma.$connect();
        console.log('✅ Connected to database');

        // Create a test rider
        const rider = await prisma.user.upsert({
            where: { email: 'rider@test.com' },
            update: {},
            create: {
                id: 'rider-001',
                email: 'rider@test.com',
                name: 'Test Rider',
                rating: 5.0,
            },
        });
        console.log('✅ Created rider:', rider.id);

        // Create test drivers
        const driver1User = await prisma.user.upsert({
            where: { email: 'driver1@test.com' },
            update: {},
            create: {
                email: 'driver1@test.com',
                name: 'Driver One',
                rating: 4.8,
            },
        });

        const driver1Profile = await prisma.driverProfile.upsert({
            where: { userId: driver1User.id },
            update: {},
            create: {
                userId: driver1User.id,
                isOnline: true,
            },
        });
        console.log('✅ Created driver 1 profile:', driver1Profile.id);

        const driver2User = await prisma.user.upsert({
            where: { email: 'driver2@test.com' },
            update: {},
            create: {
                email: 'driver2@test.com',
                name: 'Driver Two',
                rating: 4.9,
            },
        });

        const driver2Profile = await prisma.driverProfile.upsert({
            where: { userId: driver2User.id },
            update: {},
            create: {
                userId: driver2User.id,
                isOnline: true,
            },
        });
        console.log('✅ Created driver 2 profile:', driver2Profile.id);

        console.log('\n📝 Use these IDs for testing:');
        console.log('Rider ID:', rider.id);
        console.log('Driver 1 ID:', driver1Profile.id);
        console.log('Driver 2 ID:', driver2Profile.id);
        console.log('\n📍 Example ingestion command:');
        console.log(
            `curl -X POST http://localhost:3001/ingestion/location -H "Content-Type: application/json" -d "{\\"driverId\\": \\"${driver1Profile.id}\\", \\"lat\\": 40.730610, \\"lng\\": -73.935242}"`,
        );
        console.log('\n🚗 Example dispatch command:');
        console.log(
            `curl -X POST http://localhost:3002/dispatch/request-ride -H "Content-Type: application/json" -d "{\\"riderId\\": \\"${rider.id}\\", \\"lat\\": 40.730610, \\"lng\\": -73.935242}"`,
        );
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await pool.end();
    }
}

void main();
