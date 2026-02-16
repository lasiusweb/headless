import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateDealerApplicationDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsString()
  @IsOptional()
  panNumber?: string;

  @IsString()
  @IsOptional()
  gstCertificateUrl?: string;

  @IsString()
  @IsOptional()
  businessPanUrl?: string;

  @IsObject()
  @IsOptional()
  businessAddress?: any; // Using any for flexibility with JSONB

  @IsString()
  @IsOptional()
  annualTurnover?: string;
}