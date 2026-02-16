import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UpdateUserStatusDto {
  @IsUUID()
  userId: string;

  @IsString()
  newStatus: string; // 'active', 'inactive', 'suspended', 'pending_verification'

  @IsString()
  @IsOptional()
  reason?: string;
}