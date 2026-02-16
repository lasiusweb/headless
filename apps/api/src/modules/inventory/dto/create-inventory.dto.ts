import { IsUUID, IsNumber, Min, IsString, IsDate, IsOptional, MaxLength, IsEnum } from 'class-validator';

export class CreateInventoryDto {
  @IsUUID()
  variantId: string;

  @IsUUID()
  warehouseId: string;

  @IsNumber()
  @Min(0)
  stockLevel: number;

  @IsNumber()
  @Min(0)
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

export class CreateStockReservationDto {
  @IsUUID()
  inventoryItemId: string;

  @IsUUID()
  orderId: string;

  @IsUUID()
  customerId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  expiresAfterHours?: number;
}