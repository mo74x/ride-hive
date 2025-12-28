/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IsString, IsNumber } from 'class-validator';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

class RideRequestDto {
  @IsString()
  riderId: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}


@Controller('dispatch')
export class DispatchController {
  constructor(
    @Inject('REDIS_CONNECTION') private readonly redis: Redis,
    private readonly prisma: PrismaClient,
  ) { }

  @Post('request-ride')
  async requestRide(@Body() data: RideRequestDto) {
    // 1. Find 3 nearest drivers
    const matches = (await this.redis.georadius(
      'drivers:available',
      data.lng,
      data.lat,
      5,
      'km',
      'WITHDIST',
      'WITHCOORD',
      'COUNT',
      3,
      'ASC',
    )) as Array<[string, string, [string, string]]>; // [member, distance, [lng, lat]]

    if (!matches || matches.length === 0) {
      throw new HttpException('No drivers nearby', HttpStatus.NOT_FOUND);
    }
    let assignedDriverId: string | null = null;

    for (const match of matches) {
      const driverId = match[0];
      //const distance = match[1];
      const coordinates = match[2]; // [lng, lat]
      const isLocked = await this.redis.zrem('drivers:available', driverId);

      if (isLocked === 1) {
        assignedDriverId = driverId;
        await this.redis.geoadd(
          'drivers:busy',
          coordinates[0] /*lng*/,
          coordinates[1] /*lat*/,
          driverId,
        );
        break; // We found our driver!
      }
    }

    if (!assignedDriverId) {
      throw new HttpException(
        'Nearby drivers were just taken! Try again.',
        HttpStatus.CONFLICT,
      );
    }

    // 3. Create Trip in PostgreSQL
    const trip = await this.prisma.trip.create({
      data: {
        riderId: data.riderId,
        driverId: assignedDriverId,
        status: 'ACCEPTED',
        price: 15.5, // Mock price
        origin_lat: data.lat,
        origin_lng: data.lng,
        dest_lat: 40.7589,
        dest_lng: -73.9851,
      },
    });

    return {
      message: 'Trip Confirmed! 🚕',
      tripId: trip.id,
      driverId: assignedDriverId,
      status: trip.status,
    };
  }
}
