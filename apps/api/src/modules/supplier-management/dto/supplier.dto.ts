import { IsString, IsUUID, IsOptional, IsEnum, IsNumber, IsEmail, Min, IsObject, IsArray } from 'class-validator';

enum SupplierType {
  Manufacturer = 'manufacturer',
  Distributor = 'distributor',
  Wholesaler = 'wholesaler',
  Logistics = 'logistics'
}

enum SupplierStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  PendingVerification = 'pending_verification'
}

enum PaymentTerms {
  Net15 = 'net_15',
  Net30 = 'net_30',
  Net45 = 'net_45',
  Net60 = 'net_60',
  CashOnDelivery = 'cod'
}

class PurchaseOrderItemDto {
  @IsUUID()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitCost: number;
}

export class CreateSupplierDto {
  @IsString()
  name: string;

  @IsString()
  companyName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  gstNumber: string;

  @IsString()
  @IsOptional()
  panNumber?: string;

  @IsEnum(SupplierType)
  type: SupplierType;

  @IsObject()
  address: any; // Using any for flexibility with JSONB

  @IsObject()
  @IsOptional()
  bankDetails?: any; // Using any for flexibility with JSONB

  @IsNumber()
  @IsOptional()
  @Min(0)
  creditLimit?: number;

  @IsEnum(PaymentTerms)
  @IsOptional()
  paymentTerms?: PaymentTerms;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsString()
  @IsOptional()
  panNumber?: string;

  @IsEnum(SupplierType)
  @IsOptional()
  type?: SupplierType;

  @IsObject()
  @IsOptional()
  address?: any;

  @IsObject()
  @IsOptional()
  bankDetails?: any;

  @IsNumber()
  @IsOptional()
  @Min(0)
  creditLimit?: number;

  @IsEnum(PaymentTerms)
  @IsOptional()
  paymentTerms?: PaymentTerms;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  supplierId: string;

  @IsArray()
  items: PurchaseOrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  expectedDeliveryDate?: string;
}