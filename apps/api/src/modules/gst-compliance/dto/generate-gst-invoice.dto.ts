import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

export class GenerateGstInvoiceDto {
  @IsString()
  orderId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}