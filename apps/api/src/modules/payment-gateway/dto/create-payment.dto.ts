import { IsString, IsUUID, IsNumber, IsEnum, IsOptional, IsPhoneNumber, IsEmail } from 'class-validator';

enum PaymentMethod {
  Easebuzz = 'easebuzz',
  PayU = 'payu',
  Razorpay = 'razorpay',
  COD = 'cod'
}

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  upiId?: string;

  @IsString()
  @IsOptional()
  cardNumber?: string;

  @IsString()
  @IsOptional()
  cardType?: string;

  @IsString()
  @IsOptional()
  bankCode?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}