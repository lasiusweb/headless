import { IsString, IsUUID, IsNumber, IsOptional, IsEnum } from 'class-validator';

enum CarrierType {
  API = 'api',
  ManualLR = 'manual_lr'
}

export class CreateShippingRequestDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  carrierId: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  declaredValue?: number;
}