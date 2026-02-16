import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min, Max, Length, IsISO8601, IsEmail, IsPhoneNumber } from 'class-validator';
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

export class CustomerInfoDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('IN')  // Indian phone number format
  phone: string;

  @IsOptional()
  @IsString()
  @Length(15, 15)
  gstin?: string;  // Valid GSTIN format

  @IsOptional()
  @IsString()
  @Length(10, 10)
  pan?: string;  // Valid PAN format
}

export class InvoiceItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  sku: string;

  @IsString()
  hsnCode: string; // Harmonized System Nomenclature code for GST

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsNumber()
  @Min(0)
  gstRate: number; // GST rate percentage (e.g., 5, 12, 18, 28)
}

export class CreateInvoiceDto {
  @IsString()
  orderId: string;

  @IsString()
  customerId: string;

  @IsEnum(['retailer', 'dealer', 'distributor'])
  customerType: 'retailer' | 'dealer' | 'distributor';

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  @Min(0)
  discount: number;

  @IsNumber()
  @Min(0)
  shippingCost: number;

  @IsISO8601()
  invoiceDate: string;

  @IsISO8601()
  dueDate: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsString()
  @Length(15, 15)
  gstin: string; // Company GSTIN

  @IsString()
  supplyPlace: string; // State code for GST calculation
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsEnum(['draft', 'generated', 'sent', 'paid', 'overdue', 'cancelled'])
  status?: 'draft' | 'generated' | 'sent' | 'paid' | 'overdue' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsISO8601()
  sentAt?: string;

  @IsOptional()
  @IsISO8601()
  paidAt?: string;

  @IsOptional()
  @IsISO8601()
  cancelledAt?: string;
}

export class GenerateGstReportDto {
  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsString()
  @Length(2, 2)
  stateCode: string;
}