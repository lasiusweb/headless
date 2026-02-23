import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class RedeemPointsDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(1)
  pointsToRedeem: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  orderId?: string;
}