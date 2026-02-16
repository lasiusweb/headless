import { IsString, IsUUID } from 'class-validator';

export class SyncCustomerToZohoDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}