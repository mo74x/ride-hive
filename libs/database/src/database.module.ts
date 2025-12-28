//import { DatabaseService } from './database.service';
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CONNECTION',
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
        });
      },
    },
    {
      provide: PrismaClient,
      useFactory: async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });
        await prisma.$connect();
        return prisma;
      },
    },
  ],
  exports: ['REDIS_CONNECTION', PrismaClient],
})
export class DatabaseModule {}
