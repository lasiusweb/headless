import { IsString, IsUUID, IsOptional } from 'class-validator';

export class SyncPaymentToZohoDto {
  @IsUUID()
  paymentId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}