import { IsString, IsNumber, IsEnum, IsOptional, IsUrl, Min, IsIn } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  orderId: string;

  @IsString()
  customerId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(['card', 'net_banking', 'upi', 'wallet', 'emi'])
  paymentMethod: 'card' | 'net_banking' | 'upi' | 'wallet' | 'emi';

  @IsEnum(['easebuzz', 'payu'])
  gateway: 'easebuzz' | 'payu';

  @IsOptional()
  @IsUrl()
  returnUrl?: string;

  @IsOptional()
  @IsUrl()
  webhookUrl?: string;
}

export class ProcessPaymentWebhookDto {
  @IsString()
  id: string;

  @IsString()
  transaction_id: string;

  @IsString()
  order_id: string;

  @IsNumber()
  amount: number;

  @IsIn(['success', 'failure', 'pending'])
  status: 'success' | 'failure' | 'pending';

  @IsString()
  payment_mode: string;

  @IsString()
  bank_ref_num: string;

  @IsString()
  card_num: string;

  @IsString()
  bank_code: string;

  @IsString()
  gateway_name: string;

  @IsString()
  gateway_order_id: string;

  @IsString()
  checksum: string;
}

export class RefundPaymentDto {
  @IsString()
  paymentIntentId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  reason: string;
}