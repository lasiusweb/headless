import { IsString, IsOptional, IsEnum } from 'class-validator';

enum ResolutionType {
  AcceptLocal = 'accept_local',
  AcceptGateway = 'accept_gateway',
  ManualAdjustment = 'manual_adjustment'
}

export class ReconcilePaymentsDto {
  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}

export class ResolveDiscrepancyDto {
  @IsEnum(ResolutionType)
  resolution: ResolutionType;

  @IsString()
  @IsOptional()
  notes?: string;
}