import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsDateString } from 'class-validator';

enum UpdateType {
  Correction = 'correction',
  Adjustment = 'adjustment',
}

export class UpdatePosTransactionDto {
  @IsEnum(UpdateType)
  type: UpdateType;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsBoolean()
  @IsOptional()
  isReversal?: boolean;
}