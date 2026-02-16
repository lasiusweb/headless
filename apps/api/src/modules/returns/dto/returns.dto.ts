import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min, Max, Length, IsEmail, IsPhoneNumber, IsISO8601, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  @Length(5, 200)
  street: string;

  @IsString()
  @Length(2, 50)
  city: string;

  @IsString()
  @Length(2, 50)
  state: string;

  @IsString()
  @Length(6, 6)
  pincode: string;

  @IsString()
  @Length(2, 50)
  country: string;

  @IsString()
  contactName: string;

  @IsPhoneNumber('IN')
  contactPhone: string;
}

export class ReturnItemDto {
  @IsString()
  orderItemId: string;

  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsEnum(['unused', 'used', 'damaged', 'defective', 'expired'])
  condition: 'unused' | 'used' | 'damaged' | 'defective' | 'expired';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class CreateReturnRequestDto {
  @IsString()
  orderId: string;

  @IsString()
  orderNumber: string;

  @IsString()
  customerId: string;

  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsPhoneNumber('IN')
  customerPhone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @IsString()
  reasonId: string;

  @IsOptional()
  @IsString()
  reasonDetails?: string;

  @IsEnum(['original', 'store_credit', 'exchange'])
  refundMethod: 'original' | 'store_credit' | 'exchange';

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  pickupAddress?: AddressDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateReturnRequestDto {
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'picked_up', 'received', 'processing', 'refunded', 'cancelled'])
  status?: 'pending' | 'approved' | 'rejected' | 'picked_up' | 'received' | 'processing' | 'refunded' | 'cancelled';

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsString()
  rejectedBy?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  receivedBy?: string;

  @IsOptional()
  @IsString()
  processedBy?: string;

  @IsOptional()
  @IsString()
  refundedBy?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRefundDto {
  @IsString()
  returnRequestId: string;

  @IsString()
  returnNumber: string;

  @IsString()
  orderId: string;

  @IsString()
  orderNumber: string;

  @IsString()
  customerId: string;

  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(['original', 'store_credit', 'exchange'])
  refundMethod: 'original' | 'store_credit' | 'exchange';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  processedBy: string;
}

export class UpdateRefundDto {
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  @IsOptional()
  @IsString()
  paymentGatewayRefundId?: string;

  @IsOptional()
  @IsString()
  failureReason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateExchangeDto {
  @IsString()
  returnRequestId: string;

  @IsString()
  returnNumber: string;

  @IsString()
  orderId: string;

  @IsString()
  customerId: string;

  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExchangeItemDto)
  returnedItems: ExchangeItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExchangeItemDto)
  replacementItems: ExchangeItemDto[];

  @IsNumber()
  priceDifference: number;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ExchangeItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  sku: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;
}

export class CreateReturnReasonDto {
  @IsEnum(['wrong_product', 'damaged', 'defective', 'expired', 'not_as_described', 'changed_mind', 'other'])
  category: 'wrong_product' | 'damaged' | 'defective' | 'expired' | 'not_as_described' | 'changed_mind' | 'other';

  @IsString()
  @Length(5, 200)
  description: string;

  @IsBoolean()
  isActive: boolean;

  @IsBoolean()
  requiresImage: boolean;

  @IsBoolean()
  autoApprove: boolean;
}

export class UpdateReturnReasonDto {
  @IsOptional()
  @IsEnum(['wrong_product', 'damaged', 'defective', 'expired', 'not_as_described', 'changed_mind', 'other'])
  category?: 'wrong_product' | 'damaged' | 'defective' | 'expired' | 'not_as_described' | 'changed_mind' | 'other';

  @IsOptional()
  @IsString()
  @Length(5, 200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresImage?: boolean;

  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean;
}

export class CreateReturnPolicyDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsString()
  @Length(5, 500)
  description: string;

  @IsNumber()
  @Min(1)
  @Max(365)
  returnWindow: number;

  @IsArray()
  @IsString({ each: true })
  eligibleProductCategories: string[];

  @IsArray()
  @IsString({ each: true })
  excludedProductCategories: string[];

  @IsArray()
  @IsString({ each: true })
  conditions: string[];

  @IsArray()
  @IsEnum(['original', 'store_credit', 'exchange'], { each: true })
  refundMethods: ('original' | 'store_credit' | 'exchange')[];

  @IsEnum(['customer', 'company', 'depends'])
  whoPaysShipping: 'customer' | 'company' | 'depends';

  @IsBoolean()
  isActive: boolean;
}

export class UpdateReturnPolicyDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(5, 500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  returnWindow?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibleProductCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedProductCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(['original', 'store_credit', 'exchange'], { each: true })
  refundMethods?: ('original' | 'store_credit' | 'exchange')[];

  @IsOptional()
  @IsEnum(['customer', 'company', 'depends'])
  whoPaysShipping?: 'customer' | 'company' | 'depends';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}