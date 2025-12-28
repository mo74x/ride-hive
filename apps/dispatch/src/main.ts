import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DispatchModule } from './dispatch.module';

async function bootstrap() {
  const app = await NestFactory.create(DispatchModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(3002);
  console.log('🚀 Dispatch Service running on port 3002');
}
void bootstrap();
