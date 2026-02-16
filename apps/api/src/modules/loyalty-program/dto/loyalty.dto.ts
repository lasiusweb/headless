import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min, Max, Length, IsISO8601, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoyaltyProfileDto {
  @IsString()
  customerId: string;

  @IsNumber()
  @Min(0)
  initialPoints?: number;

  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsOptional()
  @IsString()
  referredBy?: string;
}

export class UpdateLoyaltyProfileDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsBalance?: number;

  @IsOptional()
  @IsEnum(['bronze', 'silver', 'gold', 'platinum'])
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';
}

export class CreateLoyaltyTransactionDto {
  @IsString()
  customerId: string;

  @IsEnum(['earn', 'redeem', 'bonus', 'adjustment', 'expire'])
  transactionType: 'earn' | 'redeem' | 'bonus' | 'adjustment' | 'expire';

  @IsNumber()
  @Min(0)
  points: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  redemptionCode?: string;

  @IsOptional()
  @IsISO8601()
  expiryDate?: string;

  @IsOptional()
  @IsEnum(['completed', 'pending', 'cancelled'])
  status?: 'completed' | 'pending' | 'cancelled';
}

export class CreateLoyaltyRewardDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  pointsRequired: number;

  @IsEnum(['discount', 'free-product', 'gift-card', 'exclusive-access', 'experience'])
  rewardType: 'discount' | 'free-product' | 'gift-card' | 'exclusive-access' | 'experience';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @IsString()
  freeProductId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  giftCardValue?: number;

  @IsNumber()
  @Min(1)
  validityPeriod: number; // in days

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRedemptions?: number;
}

export class UpdateLoyaltyRewardDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  pointsRequired?: number;

  @IsOptional()
  @IsEnum(['discount', 'free-product', 'gift-card', 'exclusive-access', 'experience'])
  rewardType?: 'discount' | 'free-product' | 'gift-card' | 'exclusive-access' | 'experience';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @IsString()
  freeProductId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  giftCardValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  validityPeriod?: number; // in days

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRedemptions?: number;
}

export class CreateLoyaltyCampaignDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsString()
  description: string;

  @IsEnum(['points-multiplier', 'bonus-points', 'double-dip', 'referral', 'seasonal'])
  campaignType: 'points-multiplier' | 'bonus-points' | 'double-dip' | 'referral' | 'seasonal';

  @IsOptional()
  @IsNumber()
  @Min(1)
  multiplier?: number; // for points-multiplier campaigns

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonusPoints?: number; // for bonus-points campaigns

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibleProducts?: string[]; // specific products for campaign

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibleCategories?: string[]; // specific categories for campaign

  @IsOptional()
  @IsArray()
  @IsEnum(['bronze', 'silver', 'gold', 'platinum'], { each: true })
  eligibleTiers?: ('bronze' | 'silver' | 'gold' | 'platinum')[]; // specific tiers for campaign

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxParticipants?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLoyaltyRewardDto)
  rewards: CreateLoyaltyRewardDto[];
}

export class RedeemRewardDto {
  @IsString()
  customerId: string;

  @IsString()
  rewardId: string;

  @IsOptional()
  @IsString()
  orderId?: string;
}

export class EarnPointsDto {
  @IsString()
  customerId: string;

  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0)
  orderValue: number;

  @IsOptional()
  @IsString()
  campaignId?: string;
}