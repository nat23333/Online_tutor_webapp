import { IsString, IsUUID, IsISO8601, IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  tutorId: string;

  @IsISO8601()
  startTime: string;

  @IsInt()
  @Min(15)
  durationMins: number;
}
