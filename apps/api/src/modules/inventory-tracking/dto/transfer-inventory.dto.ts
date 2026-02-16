import { IsString, IsUUID, IsNumber, Min } from 'class-validator';

export class TransferInventoryDto {
  @IsUUID()
  fromWarehouseId: string;

  @IsUUID()
  toWarehouseId: string;

  @IsUUID()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  reason: string;
}