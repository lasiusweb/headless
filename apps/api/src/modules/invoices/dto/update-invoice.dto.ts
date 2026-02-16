import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

enum InvoiceStatus {
  Draft = 'draft',
  Sent = 'sent',
  Paid = 'paid',
  Overdue = 'overdue',
  Cancelled = 'cancelled'
}

export class UpdateInvoiceDto {
  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @IsNumber()
  @IsOptional()
  cgstAmount?: number;

  @IsNumber()
  @IsOptional()
  sgstAmount?: number;

  @IsNumber()
  @IsOptional()
  igstAmount?: number;

  @IsNumber()
  @IsOptional()
  totalGstAmount?: number;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;
}