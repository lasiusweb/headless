import { IsNumber, Min, IsOptional, IsString, IsDate, MaxLength } from 'class-validator';

export class UpdateInventoryDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockLevel?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reservedQuantity?: number;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  batchNumber?: string;

  @IsDate()
  @IsOptional()
  expiryDate?: Date;

  @IsDate()
  @IsOptional()
  manufacturingDate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}