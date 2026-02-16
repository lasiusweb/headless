import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min, Max, Length, IsISO8601 } from 'class-validator';
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

  @IsString()
  contactName: string;

  @IsString()
  contactPhone: string;
}

export class DimensionsDto {
  @IsNumber()
  @Min(1)
  length: number; // in cm

  @IsNumber()
  @Min(1)
  width: number; // in cm

  @IsNumber()
  @Min(1)
  height: number; // in cm
}

export class ShippingItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0.1)
  weight: number; // in kg

  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto;
}

export class CreateShippingOrderDto {
  @IsString()
  orderId: string;

  @IsString()
  customerId: string;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingItemDto)
  items: ShippingItemDto[];

  @IsEnum(['delhivery', 'vrl', 'bluedart', 'ups', 'fedex', 'self'])
  carrier: 'delhivery' | 'vrl' | 'bluedart' | 'ups' | 'fedex' | 'self';

  @IsEnum(['standard', 'express', 'same_day', 'next_day'])
  serviceType: 'standard' | 'express' | 'same_day' | 'next_day';

  @IsNumber()
  @Min(0.1)
  weight: number; // in kg

  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto;

  @IsNumber()
  @Min(1)
  declaredValue: number; // for insurance

  @IsNumber()
  @Min(1)
  shippingCost: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateShippingOrderDto {
  @IsOptional()
  @IsEnum(['pending', 'label_generated', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled'])
  status?: 'pending' | 'label_generated' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled';

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  labelUrl?: string;

  @IsOptional()
  @IsISO8601()
  estimatedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ShippingRateDto {
  @IsEnum(['delhivery', 'vrl', 'bluedart', 'ups', 'fedex', 'self'])
  carrier: 'delhivery' | 'vrl' | 'bluedart' | 'ups' | 'fedex' | 'self';

  @IsEnum(['standard', 'express', 'same_day', 'next_day'])
  serviceType: 'standard' | 'express' | 'same_day' | 'next_day';

  @IsString()
  @Length(6, 6)
  originPincode: string;

  @IsString()
  @Length(6, 6)
  destinationPincode: string;

  @IsNumber()
  @Min(0.1)
  minWeight: number; // in kg

  @IsNumber()
  @Min(0.1)
  maxWeight: number; // in kg

  @IsNumber()
  @Min(0)
  ratePerKg: number;

  @IsNumber()
  @Min(0)
  additionalCharges: number;

  @IsNumber()
  @Min(1)
  estimatedDays: number;
}

export class TrackShipmentDto {
  @IsString()
  trackingNumber: string;

  @IsEnum(['delhivery', 'vrl', 'bluedart', 'ups', 'fedex', 'self'])
  carrier: 'delhivery' | 'vrl' | 'bluedart' | 'ups' | 'fedex' | 'self';
}