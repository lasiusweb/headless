import { IsString, IsOptional, IsNumber } from 'class-validator';

export class GstReportDto {
  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  gstType?: 'cgst' | 'sgst' | 'igst' | 'all';
}