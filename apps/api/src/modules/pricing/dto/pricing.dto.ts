import { IsString, IsNumber, IsEnum, IsOptional, IsDate, Min, Max } from 'class-validator';

export class CreatePricingRuleDto {
  @IsString()
  productId: string;

  @IsEnum(['retailer', 'dealer', 'distributor'])
  userType: 'retailer' | 'dealer' | 'distributor';

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;
}

export class UpdatePricingRuleDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsEnum(['retailer', 'dealer', 'distributor'])
  userType?: 'retailer' | 'dealer' | 'distributor';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;
}

export class CalculatePriceDto {
  @IsString()
  productId: string;

  @IsEnum(['retailer', 'dealer', 'distributor'])
  userType: 'retailer' | 'dealer' | 'distributor';

  @IsOptional()
  @IsNumber()
  quantity?: number;
}