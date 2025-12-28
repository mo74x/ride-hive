import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IngestionModule } from './ingestion.module';

async function bootstrap() {
  const app = await NestFactory.create(IngestionModule);

  // Enable global validation pipe for automatic DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  await app.listen(3001);
  console.log('🚀 Ingestion Service running on port 3001');
}
void bootstrap();
