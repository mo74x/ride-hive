import { IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateLocationDto {
  @IsString()
  driverId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}
