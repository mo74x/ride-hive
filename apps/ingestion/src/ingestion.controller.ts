import { Controller, Post, Body, Inject } from '@nestjs/common';
import { UpdateLocationDto } from './dto/update-location.dto';
import Redis from 'ioredis';

@Controller('ingestion')
export class IngestionController {
  constructor(@Inject('REDIS_CONNECTION') private readonly redis: Redis) {}

  @Post('location')
  async updateLocation(@Body() data: UpdateLocationDto) {
    // 1. GEOADD: Adds the driver to the geospatial index
    await this.redis.geoadd(
      'drivers:available',
      data.lng,
      data.lat,
      data.driverId,
    );

    // 2. Set Expiry (Optional but smart):
    // If a driver doesn't update for 5 minutes, assume they went offline.
    // We would need a separate key for "last_seen" logic,
    // but for now, we just update the geo index.

    return { status: 'success', timestamp: new Date() };
  }
}
