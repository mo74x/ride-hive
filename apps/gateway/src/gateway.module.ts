import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { RideGateway } from './ride/ride.gateway';

@Module({
  imports: [],
  controllers: [GatewayController],
  providers: [GatewayService, RideGateway],
})
export class GatewayModule {}
