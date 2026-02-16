import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';

export class UpdateProductVariantDto {
  @IsString()
  @IsOptional()
  sku?: string;

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
  @IsOptional()
  mrp?: number;

  @IsNumber()
  @IsOptional()
  dealerPrice?: number;

  @IsNumber()
  @IsOptional()
  distributorPrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}