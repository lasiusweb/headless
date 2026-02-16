import { IsUUID, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

enum PaymentMethod {
  Easebuzz = 'easebuzz',
  PayU = 'payu',
  Razorpay = 'razorpay',
  Stripe = 'stripe',
  COD = 'cod'  // Cash on delivery
}

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  callbackUrl?: string;

  @IsString()
  @IsOptional()
  returnUrl?: string;
}