import { IsString, IsUUID, IsOptional } from 'class-validator';

export class SyncOrderToZohoDto {
  @IsUUID()
  orderId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}