export interface CustomerLoyaltyProfile {
  id: string;
  customerId: string;
  pointsBalance: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierPointsThreshold: number;
  tierBenefits: string[];
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  lastActivityDate: Date;
  enrollmentDate: Date;
  status: 'active' | 'inactive' | 'suspended';
  referralCode: string;
  referredBy?: string;
  totalReferrals: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  transactionType: 'earn' | 'redeem' | 'bonus' | 'adjustment' | 'expire';
  points: number;
  description: string;
  orderId?: string;
  redemptionCode?: string;
  expiryDate?: Date;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: 'discount' | 'free-product' | 'gift-card' | 'exclusive-access' | 'experience';
  discountPercentage?: number;
  freeProductId?: string;
  giftCardValue?: number;
  validityPeriod: number; // in days
  isActive: boolean;
  maxRedemptions?: number;
  timesRedeemed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyCampaign {
  id: string;
  name: string;
  description: string;
  campaignType: 'points-multiplier' | 'bonus-points' | 'double-dip' | 'referral' | 'seasonal';
  multiplier?: number; // for points-multiplier campaigns
  bonusPoints?: number; // for bonus-points campaigns
  eligibleProducts?: string[]; // specific products for campaign
  eligibleCategories?: string[]; // specific categories for campaign
  eligibleTiers?: ('bronze' | 'silver' | 'gold' | 'platinum')[]; // specific tiers for campaign
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  maxParticipants?: number;
  participantsCount: number;
  rewards: LoyaltyReward[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  referrerRewardPoints: number;
  refereeRewardPoints: number;
  status: 'pending' | 'confirmed' | 'rewarded';
  confirmedAt?: Date;
  rewardedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTier {
  id: string;
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  pointsThreshold: number;
  benefits: string[];
  discountPercentage: number;
  exclusiveOffers: boolean;
  prioritySupport: boolean;
  earlyAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyAnalytics {
  id: string;
  period: string; // Format: YYYY-MM
  totalMembers: number;
  activeMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  redemptionRate: number; // percentage
  averagePointsPerMember: number;
  referralCount: number;
  campaignParticipation: number;
  createdAt: Date;
  updatedAt: Date;
}