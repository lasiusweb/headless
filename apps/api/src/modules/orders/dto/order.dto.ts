import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, IsUUID, Min, IsISO8601, IsEmail, IsPhoneNumber, Length } from 'class-validator';
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
  pincode: string;  // Indian pincode format

  @IsString()
  @Length(2, 50)
  country: string;
}

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  discountPercentage: number;

  @IsNumber()
  @Min(0)
  taxRate: number;
}

export class CreateOrderDto {
  @IsString()
  customerId: string;

  @IsEnum(['retailer', 'dealer', 'distributor'])
  customerType: 'retailer' | 'dealer' | 'distributor';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(['draft', 'pending_approval', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class ApproveOrderDto {
  @IsString()
  approverId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectOrderDto {
  @IsString()
  approverId: string;

  @IsString()
  reason: string;
}

export class ShipOrderDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  carrier: string;
}