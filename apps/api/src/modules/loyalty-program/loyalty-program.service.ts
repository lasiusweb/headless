import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  CustomerLoyaltyProfile, 
  LoyaltyTransaction, 
  LoyaltyReward, 
  LoyaltyCampaign,
  Referral,
  LoyaltyTier,
  LoyaltyAnalytics 
} from './interfaces/loyalty.interface';
import { 
  CreateLoyaltyProfileDto, 
  UpdateLoyaltyProfileDto, 
  CreateLoyaltyTransactionDto, 
  CreateLoyaltyRewardDto, 
  UpdateLoyaltyRewardDto, 
  CreateLoyaltyCampaignDto, 
  RedeemRewardDto,
  EarnPointsDto
} from './dto/loyalty.dto';
import { OrdersService } from '../orders/orders.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class LoyaltyProgramService {
  private readonly logger = new Logger(LoyaltyProgramService.name);
  private loyaltyProfiles: CustomerLoyaltyProfile[] = [];
  private loyaltyTransactions: LoyaltyTransaction[] = [];
  private loyaltyRewards: LoyaltyReward[] = [];
  private loyaltyCampaigns: LoyaltyCampaign[] = [];
  private referrals: Referral[] = [];
  private loyaltyTiers: LoyaltyTier[] = [];
  private analytics: LoyaltyAnalytics[] = [];

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private customersService: CustomersService,
  ) {
    // Initialize default loyalty tiers
    this.initializeDefaultTiers();
  }

  private initializeDefaultTiers(): void {
    this.loyaltyTiers = [
      {
        id: 'tier-bronze',
        name: 'Bronze',
        pointsThreshold: 0,
        benefits: ['Welcome bonus', 'Birthday discount'],
        discountPercentage: 2,
        exclusiveOffers: false,
        prioritySupport: false,
        earlyAccess: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tier-silver',
        name: 'Silver',
        pointsThreshold: 1000,
        benefits: ['Welcome bonus', 'Birthday discount', 'Exclusive offers'],
        discountPercentage: 5,
        exclusiveOffers: true,
        prioritySupport: false,
        earlyAccess: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tier-gold',
        name: 'Gold',
        pointsThreshold: 5000,
        benefits: ['Welcome bonus', 'Birthday discount', 'Exclusive offers', 'Early access to sales'],
        discountPercentage: 10,
        exclusiveOffers: true,
        prioritySupport: true,
        earlyAccess: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tier-platinum',
        name: 'Platinum',
        pointsThreshold: 10000,
        benefits: ['Welcome bonus', 'Birthday discount', 'Exclusive offers', 'Early access to sales', 'Priority support'],
        discountPercentage: 15,
        exclusiveOffers: true,
        prioritySupport: true,
        earlyAccess: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async createLoyaltyProfile(createLoyaltyProfileDto: CreateLoyaltyProfileDto): Promise<CustomerLoyaltyProfile> {
    // Check if customer already has a loyalty profile
    const existingProfile = this.loyaltyProfiles.find(profile => profile.customerId === createLoyaltyProfileDto.customerId);
    if (existingProfile) {
      throw new Error(`Customer with ID ${createLoyaltyProfileDto.customerId} already has a loyalty profile`);
    }

    // Create the loyalty profile
    const loyaltyProfile: CustomerLoyaltyProfile = {
      id: Math.random().toString(36).substring(7),
      ...createLoyaltyProfileDto,
      pointsBalance: createLoyaltyProfileDto.initialPoints || 0,
      tier: 'bronze',
      tierPointsThreshold: 0,
      tierBenefits: ['Welcome bonus', 'Birthday discount'],
      totalPointsEarned: createLoyaltyProfileDto.initialPoints || 0,
      totalPointsRedeemed: 0,
      lastActivityDate: new Date(),
      enrollmentDate: new Date(),
      status: 'active',
      referralCode: createLoyaltyProfileDto.referralCode || `REF${Date.now()}`,
      totalReferrals: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.loyaltyProfiles.push(loyaltyProfile);

    // Add referral if applicable
    if (createLoyaltyProfileDto.referredBy) {
      await this.processReferral(createLoyaltyProfileDto.referredBy, loyaltyProfile.id);
    }

    this.logger.log(`Loyalty profile created: ${loyaltyProfile.id} for customer ${loyaltyProfile.customerId}`);

    return loyaltyProfile;
  }

  async updateLoyaltyProfile(id: string, updateLoyaltyProfileDto: UpdateLoyaltyProfileDto): Promise<CustomerLoyaltyProfile> {
    const index = this.loyaltyProfiles.findIndex(profile => profile.id === id);
    if (index === -1) {
      throw new Error(`Loyalty profile with ID ${id} not found`);
    }

    const oldProfile = { ...this.loyaltyProfiles[index] };
    this.loyaltyProfiles[index] = {
      ...this.loyaltyProfiles[index],
      ...updateLoyaltyProfileDto,
      lastActivityDate: new Date(),
      updatedAt: new Date(),
    };

    // Update tier if points balance changed significantly
    if (updateLoyaltyProfileDto.pointsBalance !== undefined) {
      this.loyaltyProfiles[index] = this.updateTierIfEligible(this.loyaltyProfiles[index]);
    }

    this.logger.log(`Loyalty profile updated: ${id} for customer ${this.loyaltyProfiles[index].customerId}`);

    return this.loyaltyProfiles[index];
  }

  async getLoyaltyProfileByCustomerId(customerId: string): Promise<CustomerLoyaltyProfile> {
    const profile = this.loyaltyProfiles.find(profile => profile.customerId === customerId);
    if (!profile) {
      throw new Error(`Loyalty profile for customer ${customerId} not found`);
    }
    return profile;
  }

  async getLoyaltyProfileById(id: string): Promise<CustomerLoyaltyProfile> {
    const profile = this.loyaltyProfiles.find(profile => profile.id === id);
    if (!profile) {
      throw new Error(`Loyalty profile with ID ${id} not found`);
    }
    return profile;
  }

  async createLoyaltyTransaction(createLoyaltyTransactionDto: CreateLoyaltyTransactionDto): Promise<LoyaltyTransaction> {
    const transaction: LoyaltyTransaction = {
      id: Math.random().toString(36).substring(7),
      ...createLoyaltyTransactionDto,
      status: createLoyaltyTransactionDto.status || 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.loyaltyTransactions.push(transaction);

    // Update customer's loyalty profile based on transaction
    const profileIndex = this.loyaltyProfiles.findIndex(profile => profile.customerId === createLoyaltyTransactionDto.customerId);
    if (profileIndex !== -1) {
      if (createLoyaltyTransactionDto.transactionType === 'earn' || createLoyaltyTransactionDto.transactionType === 'bonus') {
        this.loyaltyProfiles[profileIndex] = {
          ...this.loyaltyProfiles[profileIndex],
          pointsBalance: this.loyaltyProfiles[profileIndex].pointsBalance + createLoyaltyTransactionDto.points,
          totalPointsEarned: this.loyaltyProfiles[profileIndex].totalPointsEarned + createLoyaltyTransactionDto.points,
          lastActivityDate: new Date(),
          updatedAt: new Date(),
        };
      } else if (createLoyaltyTransactionDto.transactionType === 'redeem') {
        this.loyaltyProfiles[profileIndex] = {
          ...this.loyaltyProfiles[profileIndex],
          pointsBalance: this.loyaltyProfiles[profileIndex].pointsBalance - createLoyaltyTransactionDto.points,
          totalPointsRedeemed: this.loyaltyProfiles[profileIndex].totalPointsRedeemed + createLoyaltyTransactionDto.points,
          lastActivityDate: new Date(),
          updatedAt: new Date(),
        };
      }

      // Update tier if needed
      this.loyaltyProfiles[profileIndex] = this.updateTierIfEligible(this.loyaltyProfiles[profileIndex]);
    }

    this.logger.log(`Loyalty transaction created: ${transaction.id} for customer ${createLoyaltyTransactionDto.customerId}`);

    return transaction;
  }

  async createLoyaltyReward(createLoyaltyRewardDto: CreateLoyaltyRewardDto): Promise<LoyaltyReward> {
    const reward: LoyaltyReward = {
      id: Math.random().toString(36).substring(7),
      ...createLoyaltyRewardDto,
      timesRedeemed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.loyaltyRewards.push(reward);

    this.logger.log(`Loyalty reward created: ${reward.id} - ${reward.name}`);

    return reward;
  }

  async updateLoyaltyReward(id: string, updateLoyaltyRewardDto: UpdateLoyaltyRewardDto): Promise<LoyaltyReward> {
    const index = this.loyaltyRewards.findIndex(reward => reward.id === id);
    if (index === -1) {
      throw new Error(`Loyalty reward with ID ${id} not found`);
    }

    this.loyaltyRewards[index] = {
      ...this.loyaltyRewards[index],
      ...updateLoyaltyRewardDto,
      updatedAt: new Date(),
    };

    this.logger.log(`Loyalty reward updated: ${id} - ${this.loyaltyRewards[index].name}`);

    return this.loyaltyRewards[index];
  }

  async createLoyaltyCampaign(createLoyaltyCampaignDto: CreateLoyaltyCampaignDto): Promise<LoyaltyCampaign> {
    const campaign: LoyaltyCampaign = {
      id: Math.random().toString(36).substring(7),
      ...createLoyaltyCampaignDto,
      startDate: new Date(createLoyaltyCampaignDto.startDate),
      endDate: new Date(createLoyaltyCampaignDto.endDate),
      participantsCount: 0,
      rewards: createLoyaltyCampaignDto.rewards.map(reward => ({
        id: Math.random().toString(36).substring(7),
        ...reward,
        timesRedeemed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.loyaltyCampaigns.push(campaign);

    this.logger.log(`Loyalty campaign created: ${campaign.id} - ${campaign.name}`);

    return campaign;
  }

  async redeemReward(redeemRewardDto: RedeemRewardDto): Promise<LoyaltyTransaction> {
    const reward = this.loyaltyRewards.find(r => r.id === redeemRewardDto.rewardId);
    if (!reward) {
      throw new Error(`Loyalty reward with ID ${redeemRewardDto.rewardId} not found`);
    }

    if (!reward.isActive) {
      throw new Error(`Loyalty reward ${reward.name} is not active`);
    }

    if (reward.maxRedemptions && reward.timesRedeemed >= reward.maxRedemptions) {
      throw new Error(`Loyalty reward ${reward.name} has reached maximum redemptions`);
    }

    const profile = this.loyaltyProfiles.find(p => p.customerId === redeemRewardDto.customerId);
    if (!profile) {
      throw new Error(`Loyalty profile for customer ${redeemRewardDto.customerId} not found`);
    }

    if (profile.pointsBalance < reward.pointsRequired) {
      throw new Error(`Insufficient points. Customer has ${profile.pointsBalance}, but reward requires ${reward.pointsRequired}`);
    }

    // Create redemption transaction
    const redemptionTransaction: LoyaltyTransaction = {
      id: Math.random().toString(36).substring(7),
      customerId: redeemRewardDto.customerId,
      transactionType: 'redeem',
      points: reward.pointsRequired,
      description: `Redeemed reward: ${reward.name}`,
      orderId: redeemRewardDto.orderId,
      redemptionCode: `REDEM${Date.now()}`,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.loyaltyTransactions.push(redemptionTransaction);

    // Update customer's loyalty profile
    const profileIndex = this.loyaltyProfiles.findIndex(p => p.customerId === redeemRewardDto.customerId);
    if (profileIndex !== -1) {
      this.loyaltyProfiles[profileIndex] = {
        ...this.loyaltyProfiles[profileIndex],
        pointsBalance: this.loyaltyProfiles[profileIndex].pointsBalance - reward.pointsRequired,
        totalPointsRedeemed: this.loyaltyProfiles[profileIndex].totalPointsRedeemed + reward.pointsRequired,
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      };

      // Update tier if needed
      this.loyaltyProfiles[profileIndex] = this.updateTierIfEligible(this.loyaltyProfiles[profileIndex]);
    }

    // Update reward redemption count
    const rewardIndex = this.loyaltyRewards.findIndex(r => r.id === redeemRewardDto.rewardId);
    if (rewardIndex !== -1) {
      this.loyaltyRewards[rewardIndex] = {
        ...this.loyaltyRewards[rewardIndex],
        timesRedeemed: this.loyaltyRewards[rewardIndex].timesRedeemed + 1,
        updatedAt: new Date(),
      };
    }

    this.logger.log(`Reward redeemed: ${reward.id} by customer ${redeemRewardDto.customerId}`);

    return redemptionTransaction;
  }

  async earnPoints(earnPointsDto: EarnPointsDto): Promise<LoyaltyTransaction> {
    const profile = this.loyaltyProfiles.find(p => p.customerId === earnPointsDto.customerId);
    if (!profile) {
      throw new Error(`Loyalty profile for customer ${earnPointsDto.customerId} not found`);
    }

    // Calculate points to earn based on order value and campaign
    let pointsMultiplier = 1; // Default 1 point per ₹1 spent
    let bonusPoints = 0;

    if (earnPointsDto.campaignId) {
      const campaign = this.loyaltyCampaigns.find(c => c.id === earnPointsDto.campaignId);
      if (campaign && campaign.isActive && 
          new Date() >= campaign.startDate && 
          new Date() <= campaign.endDate) {
        
        if (campaign.campaignType === 'points-multiplier' && campaign.multiplier) {
          pointsMultiplier = campaign.multiplier;
        } else if (campaign.campaignType === 'bonus-points' && campaign.bonusPoints) {
          bonusPoints = campaign.bonusPoints;
        }
      }
    }

    // Calculate points earned
    const pointsEarned = Math.floor(earnPointsDto.orderValue * pointsMultiplier) + bonusPoints;

    // Create earn transaction
    const earnTransaction: LoyaltyTransaction = {
      id: Math.random().toString(36).substring(7),
      customerId: earnPointsDto.customerId,
      transactionType: 'earn',
      points: pointsEarned,
      description: `Earned points for order ${earnPointsDto.orderId}`,
      orderId: earnPointsDto.orderId,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.loyaltyTransactions.push(earnTransaction);

    // Update customer's loyalty profile
    const profileIndex = this.loyaltyProfiles.findIndex(p => p.customerId === earnPointsDto.customerId);
    if (profileIndex !== -1) {
      this.loyaltyProfiles[profileIndex] = {
        ...this.loyaltyProfiles[profileIndex],
        pointsBalance: this.loyaltyProfiles[profileIndex].pointsBalance + pointsEarned,
        totalPointsEarned: this.loyaltyProfiles[profileIndex].totalPointsEarned + pointsEarned,
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      };

      // Update tier if needed
      this.loyaltyProfiles[profileIndex] = this.updateTierIfEligible(this.loyaltyProfiles[profileIndex]);
    }

    this.logger.log(`Points earned: ${pointsEarned} for customer ${earnPointsDto.customerId} on order ${earnPointsDto.orderId}`);

    return earnTransaction;
  }

  async getLoyaltyTransactionsByCustomer(customerId: string): Promise<LoyaltyTransaction[]> {
    return this.loyaltyTransactions.filter(transaction => transaction.customerId === customerId);
  }

  async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    return [...this.loyaltyRewards];
  }

  async getActiveLoyaltyCampaigns(): Promise<LoyaltyCampaign[]> {
    const now = new Date();
    return this.loyaltyCampaigns.filter(campaign => 
      campaign.isActive && 
      now >= campaign.startDate && 
      now <= campaign.endDate
    );
  }

  async getLoyaltyAnalytics(): Promise<LoyaltyAnalytics> {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Calculate analytics
    const totalMembers = this.loyaltyProfiles.length;
    const activeMembers = this.loyaltyProfiles.filter(p => p.status === 'active').length;
    const totalPointsIssued = this.loyaltyTransactions
      .filter(t => t.transactionType === 'earn' || t.transactionType === 'bonus')
      .reduce((sum, t) => sum + t.points, 0);
    const totalPointsRedeemed = this.loyaltyTransactions
      .filter(t => t.transactionType === 'redeem')
      .reduce((sum, t) => sum + t.points, 0);
    const redemptionRate = totalPointsRedeemed / (totalPointsIssued || 1) * 100;
    const averagePointsPerMember = totalPointsIssued / (totalMembers || 1);
    const referralCount = this.referrals.length;
    const campaignParticipation = this.loyaltyCampaigns.reduce((sum, c) => sum + c.participantsCount, 0);

    const analytics: LoyaltyAnalytics = {
      id: Math.random().toString(36).substring(7),
      period,
      totalMembers,
      activeMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      redemptionRate,
      averagePointsPerMember,
      referralCount,
      campaignParticipation,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.analytics.push(analytics);

    return analytics;
  }

  private updateTierIfEligible(profile: CustomerLoyaltyProfile): CustomerLoyaltyProfile {
    // Find the highest tier the customer qualifies for
    let newTier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    let newTierThreshold = 0;
    let newBenefits: string[] = [];
    let newDiscountPercentage = 0;

    for (const tier of this.loyaltyTiers) {
      if (profile.pointsBalance >= tier.pointsThreshold) {
        newTier = tier.name.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'platinum';
        newTierThreshold = tier.pointsThreshold;
        newBenefits = tier.benefits;
        newDiscountPercentage = tier.discountPercentage;
      }
    }

    // Only update if the tier has changed
    if (profile.tier !== newTier) {
      return {
        ...profile,
        tier: newTier,
        tierPointsThreshold: newTierThreshold,
        tierBenefits: newBenefits,
        discountPercentage: newDiscountPercentage,
      };
    }

    return profile;
  }

  private async processReferral(referrerId: string, refereeId: string): Promise<void> {
    // Find the referrer's loyalty profile
    const referrerProfile = this.loyaltyProfiles.find(p => p.id === referrerId);
    if (!referrerProfile) {
      this.logger.warn(`Referrer profile not found: ${referrerId}`);
      return;
    }

    // Create referral record
    const referral: Referral = {
      id: Math.random().toString(36).substring(7),
      referrerId,
      refereeId,
      referrerRewardPoints: 100, // Default reward for referrer
      refereeRewardPoints: 50,   // Default reward for referee
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.referrals.push(referral);

    // Add pending transaction for referrer
    await this.createLoyaltyTransaction({
      customerId: referrerId,
      transactionType: 'bonus',
      points: 100,
      description: 'Referral bonus for successful referral',
      status: 'pending',
    });

    // Add pending transaction for referee
    await this.createLoyaltyTransaction({
      customerId: refereeId,
      transactionType: 'bonus',
      points: 50,
      description: 'Welcome bonus for joining via referral',
      status: 'pending',
    });

    this.logger.log(`Referral processed: ${referrerId} referred ${refereeId}`);
  }
}