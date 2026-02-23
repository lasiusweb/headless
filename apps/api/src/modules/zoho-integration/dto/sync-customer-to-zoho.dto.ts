import { IsString, IsUUID, IsOptional } from 'class-validator';

export class SyncCustomerToZohoDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}