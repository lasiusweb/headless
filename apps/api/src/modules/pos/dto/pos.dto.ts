import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min, Max, Length, IsISO8601, IsEmail, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PosTransactionItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsNumber()
  @Min(0)
  @Max(30) // Max tax rate in India is 28% + cess
  taxRate: number;
}

export class CreatePosTransactionDto {
  @IsString()
  sessionId: string;

  @IsEnum(['sale', 'return', 'refund'])
  transactionType: 'sale' | 'return' | 'refund';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosTransactionItemDto)
  items: PosTransactionItemDto[];

  @IsEnum(['cash', 'card', 'upi', 'credit'])
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit';

  @IsEnum(['pending', 'completed', 'failed'])
  paymentStatus: 'pending' | 'completed' | 'failed';

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  customerPhone?: string;

  @IsOptional()
  @IsString()
  @Length(15, 15)
  customerGstin?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePosTransactionDto {
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed'])
  paymentStatus?: 'pending' | 'completed' | 'failed';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePosProductDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsString()
  @Length(2, 50)
  sku: string;

  @IsString()
  @Length(6, 10)
  hsnCode: string;

  @IsString()
  @Length(2, 50)
  category: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  brand?: string;

  @IsString()
  @Length(1, 20)
  unit: string;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsNumber()
  @Min(0)
  @Max(30)
  taxRate: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsNumber()
  @Min(0)
  minStockLevel: number;

  @IsOptional()
  @IsString()
  @Length(10, 20)
  barcode?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePosProductDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  category?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  brand?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePosCustomerDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(15, 15)
  gstin?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  pincode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;
}

export class UpdatePosCustomerDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(15, 15)
  gstin?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;
}

export class PosInventoryAdjustmentDto {
  @IsString()
  productId: string;

  @IsEnum(['addition', 'reduction', 'damage', 'theft'])
  adjustmentType: 'addition' | 'reduction' | 'damage' | 'theft';

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @Length(5, 200)
  reason: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}

export class StartPosSessionDto {
  @IsString()
  userId: string;

  @IsString()
  deviceId: string;
}

export class ClosePosSessionDto {
  @IsString()
  sessionId: string;
}

export class RegisterPosDeviceDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsString()
  @Length(5, 50)
  deviceId: string;

  @IsString()
  @Length(5, 100)
  location: string;
}