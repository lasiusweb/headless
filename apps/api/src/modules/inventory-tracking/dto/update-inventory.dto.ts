import { IsString, IsUUID, IsNumber, IsEnum, IsOptional } from 'class-validator';

enum InventoryChangeType {
  In = 'in',
  Out = 'out',
  Adjustment = 'adjustment',
  Transfer = 'transfer',
  Reservation = 'reservation',
  Release = 'release'
}

export class UpdateInventoryDto {
  @IsUUID()
  variantId: string;

  @IsUUID()
  warehouseId: string;

  @IsNumber()
  quantityChange: number;

  @IsString()
  reason: string;

  @IsEnum(InventoryChangeType)
  changeType: InventoryChangeType;

  @IsString()
  @IsOptional()
  notes?: string;
}