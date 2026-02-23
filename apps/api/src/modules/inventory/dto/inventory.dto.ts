import { IsString, IsNumber, IsEnum, IsOptional, IsDate, IsISO8601, Min, Max, Length, IsEmail, IsPhoneNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @IsString()
  productId: string;

  @IsString()
  @Length(2, 50)
  productName: string;

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
  unitOfMeasure: string;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsNumber()
  @Min(0)
  @Max(30) // Max tax rate in India is 28% + cess
  taxRate: number;

  @IsNumber()
  @Min(0)
  totalStock: number;

  @IsNumber()
  @Min(0)
  availableStock: number;

  @IsNumber()
  @Min(0)
  reservedStock: number;

  @IsNumber()
  @Min(0)
  committedStock: number;

  @IsNumber()
  @Min(0)
  reorderLevel: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  binLocation?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'discontinued'])
  status?: 'active' | 'inactive' | 'discontinued' = 'active';
}

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  productName?: string;

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
  totalStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  availableStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reservedStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  committedStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  binLocation?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'discontinued'])
  status?: 'active' | 'inactive' | 'discontinued';
}

export class CreateInventoryBatchDto {
  @IsString()
  inventoryItemId: string;

  @IsString()
  @Length(2, 50)
  batchNumber: string;

  @IsOptional()
  @IsISO8601()
  manufacturingDate?: string;

  @IsOptional()
  @IsISO8601()
  expiryDate?: string;

  @IsISO8601()
  receivedDate: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  costPerUnit: number;

  @IsNumber()
  @Min(0)
  sellingPricePerUnit: number;

  @IsOptional()
  @IsEnum(['active', 'expired', 'disposed', 'quarantined'])
  status?: 'active' | 'expired' | 'disposed' | 'quarantined' = 'active';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInventoryBatchDto {
  @IsOptional()
  @IsISO8601()
  manufacturingDate?: string;

  @IsOptional()
  @IsISO8601()
  expiryDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPricePerUnit?: number;

  @IsOptional()
  @IsEnum(['active', 'expired', 'disposed', 'quarantined'])
  status?: 'active' | 'expired' | 'disposed' | 'quarantined';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInventoryTransactionDto {
  @IsString()
  inventoryItemId: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsEnum(['receipt', 'issue', 'adjustment', 'transfer', 'damage', 'theft', 'expiry'])
  transactionType: 'receipt' | 'issue' | 'adjustment' | 'transfer' | 'damage' | 'theft' | 'expiry';

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  processedBy: string;
}

export class CreateInventoryTransferDto {
  @IsString()
  fromLocation: string;

  @IsString()
  toLocation: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryTransferItemDto)
  items: InventoryTransferItemDto[];

  @IsString()
  requestedBy: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class InventoryTransferItemDto {
  @IsString()
  inventoryItemId: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;
}

export class UpdateInventoryTransferDto {
  @IsOptional()
  @IsEnum(['requested', 'approved', 'in-transit', 'delivered', 'received'])
  status?: 'requested' | 'approved' | 'in-transit' | 'delivered' | 'received';

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsISO8601()
  shippedAt?: string;

  @IsOptional()
  @IsISO8601()
  deliveredAt?: string;

  @IsOptional()
  @IsISO8601()
  receivedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConductInventoryAuditDto {
  @IsString()
  inventoryItemId: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsNumber()
  physicalCount: number;

  @IsString()
  auditorId: string;

  @IsString()
  auditorName: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateReorderPointDto {
  @IsString()
  inventoryItemId: string;

  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsNumber()
  @Min(0)
  reorderLevel: number;

  @IsNumber()
  @Min(1)
  reorderQuantity: number;

  @IsString()
  supplierId: string;

  @IsString()
  supplierName: string;

  @IsNumber()
  @Min(1)
  leadTime: number; // in days

  @IsNumber()
  @Min(0)
  safetyStock: number;
}

export class UpdateReorderPointDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderQuantity?: number;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  leadTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  safetyStock?: number;
}