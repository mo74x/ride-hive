import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  await app.listen(process.env.port ?? 3000);
  console.log(`🚀 Gateway running on port ${process.env.port ?? 3000}`);
}
void bootstrap();
