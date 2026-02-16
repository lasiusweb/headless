import { IsString, IsUUID, IsOptional, IsBoolean, IsArray, IsNumber, Min, Max, IsUrl, Length } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  slug?: string;

  @IsString()
  @IsOptional()
  @Length(0, 2000)
  description?: string;

  @IsUUID()
  @IsOptional()
  segmentId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsOptional()
  cropIds?: string[];

  @IsArray()
  @IsOptional()
  problemIds?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  mrp?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dealerPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  distributorPrice?: number;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  sku?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  gstRate?: number;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  usageInstructions?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  precautions?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  benefits?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  composition?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  applicationMethod?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  targetPestsOrIssues?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  targetCrops?: string;

  @IsNumber()
  @Min(0)
  @Max(9999)
  @IsOptional()
  weightOrVolume?: number;

  @IsString()
  @IsOptional()
  @Length(0, 50)
  unitOfMeasurement?: string; // e.g., 'ml', 'litre', 'kg', 'gm', 'piece'

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}