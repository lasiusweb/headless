import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateDealerApplicationDto {
  @IsString()
  companyName: string;

  @IsString()
  gstNumber: string;

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