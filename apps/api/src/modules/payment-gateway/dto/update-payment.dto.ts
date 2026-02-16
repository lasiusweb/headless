import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';

enum PaymentStatus {
  Initiated = 'initiated',
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Refunded = 'refunded',
}

export class UpdatePaymentDto {
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  gatewayResponse?: string;
}