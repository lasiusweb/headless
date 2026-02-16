import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class CreateProductVariantDto {
  @IsUUID()
  productId: string;

  @IsString()
  sku: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsObject()
  @IsOptional()
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @IsNumber()
  mrp: number;

  @IsNumber()
  dealerPrice: number;

  @IsNumber()
  distributorPrice: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}