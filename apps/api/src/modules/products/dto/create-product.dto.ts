import { IsString, IsUUID, IsOptional, IsBoolean, IsArray, ArrayNotEmpty, IsNumber, Min, Max, IsUrl, Length } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @Length(1, 255)
  slug: string;

  @IsString()
  @IsOptional()
  @Length(0, 2000)
  description?: string;

  @IsUUID()
  segmentId: string;

  @IsUUID()
  categoryId: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  cropIds?: string[];

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  problemIds?: string[];

  @IsNumber()
  @Min(0)
  mrp: number;

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