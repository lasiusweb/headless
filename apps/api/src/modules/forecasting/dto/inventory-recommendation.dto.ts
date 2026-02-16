import { IsOptional, IsNumber, Min, IsString } from 'class-validator';

export class InventoryRecommendationDto {
  @IsString()
  @IsOptional()
  warehouseId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  minDaysOfStock?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxDaysOfStock?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  safetyStockMultiplier?: number;
}