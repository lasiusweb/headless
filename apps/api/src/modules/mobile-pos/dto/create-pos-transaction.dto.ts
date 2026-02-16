import { IsString, IsOptional, IsNumber, IsPositive, IsEnum, ValidateNested, IsArray, ArrayNotEmpty, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

enum CustomerType {
  Retail = 'retail',
  Dealer = 'dealer',
  Distributor = 'distributor',
}

enum PaymentMethod {
  Cash = 'cash',
  Card = 'card',
  UPI = 'upi',
  NetBanking = 'net_banking',
  DigitalWallet = 'digital_wallet',
}

class PosTransactionItemDto {
  @IsString()
  variantId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreatePosTransactionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PosTransactionItemDto)
  items: PosTransactionItemDto[];

  @IsEnum(CustomerType)
  @IsOptional()
  customerType?: CustomerType;

  @IsString()
  @IsOptional()
  customerInfo?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  shippingCost?: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;
}