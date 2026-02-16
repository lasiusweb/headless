import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class AwardPointsDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(1)
  points: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  orderId?: string;
}