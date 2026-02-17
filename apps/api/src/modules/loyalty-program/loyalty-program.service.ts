import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';

export interface LoyaltyProfile {
  id: string;
  customer_id: string;
  points_balance: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tier_points_threshold: number;
  total_points_earned: number;
  total_points_redeemed: number;
  referral_code: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  transaction_type: 'earn' | 'redeem' | 'bonus' | 'adjustment' | 'expiry';
  points: number;
  balance_after: number;
  description: string;
  order_id?: string;
  redemption_code?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  expires_at?: string;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  discount_value?: number;
  reward_type: 'discount' | 'free_product' | 'cashback' | 'voucher';
  is_active: boolean;
  max_redemptions?: number;
  times_redeemed: number;
  valid_until?: string;
  created_at: string;
}

export interface LoyaltyTier {
  id: string;
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  points_threshold: number;
  discount_percentage: number;
  benefits: string[];
  exclusive_offers: boolean;
  priority_support: boolean;
  early_access: boolean;
  created_at: string;
}

@Injectable()
export class LoyaltyProgramService {
  private readonly logger = new Logger(LoyaltyProgramService.name);

  // Points earning rules
  private readonly pointsRules = {
    baseRate: 1, // 1 point per ₹100
    baseRateDivisor: 100,
    tierMultipliers: {
      bronze: 1.0,
      silver: 1.25,
      gold: 1.5,
      platinum: 2.0,
    },
    birthdayBonus: 500,
    referralBonus: {
      referrer: 100,
      referee: 50,
    },
    firstOrderBonus: 200,
  };

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  /**
   * Get or create loyalty profile for customer
   */
  async getOrCreateProfile(customerId: string): Promise<LoyaltyProfile> {
    const client = this.supabaseService.getClient();

    // Try to find existing profile
    const { data: existingProfile } = await client
      .from('loyalty_profiles')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile
    const referralCode = `REF${customerId.substring(0, 4)}${Date.now()}`;
    const { data: newProfile, error } = await client
      .from('loyalty_profiles')
      .insert([{
        customer_id: customerId,
        points_balance: 0,
        tier: 'bronze',
        tier_points_threshold: 0,
        total_points_earned: 0,
        total_points_redeemed: 0,
        referral_code: referralCode,
        status: 'active',
      }])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating loyalty profile: ${error.message}`);
      throw error;
    }

    this.logger.log(`Created loyalty profile for customer ${customerId}`);
    return newProfile;
  }

  /**
   * Earn points for a purchase
   */
  async earnPoints(params: {
    customerId: string;
    orderId: string;
    orderValue: number;
    isBirthday?: boolean;
    isFirstOrder?: boolean;
    campaignId?: string;
  }): Promise<LoyaltyTransaction> {
    const client = this.supabaseService.getClient();
    const { customerId, orderId, orderValue, isBirthday, isFirstOrder, campaignId } = params;

    // Get customer's loyalty profile
    const profile = await this.getOrCreateProfile(customerId);

    // Calculate base points
    let pointsEarned = Math.floor(orderValue / this.pointsRules.baseRateDivisor) * this.pointsRules.baseRate;

    // Apply tier multiplier
    const tierMultiplier = this.pointsRules.tierMultipliers[profile.tier];
    pointsEarned = Math.floor(pointsEarned * tierMultiplier);

    // Add birthday bonus
    if (isBirthday) {
      pointsEarned += this.pointsRules.birthdayBonus;
    }

    // Add first order bonus
    if (isFirstOrder) {
      pointsEarned += this.pointsRules.firstOrderBonus;
    }

    // Apply campaign multiplier if applicable
    if (campaignId) {
      const campaign = await this.getCampaign(campaignId);
      if (campaign && campaign.is_active) {
        const campaignMultiplier = campaign.multiplier || 1;
        pointsEarned = Math.floor(pointsEarned * campaignMultiplier);
      }
    }

    // Create transaction
    const newBalance = profile.points_balance + pointsEarned;
    const { data: transaction, error } = await client
      .from('loyalty_transactions')
      .insert([{
        customer_id: customerId,
        transaction_type: 'earn',
        points: pointsEarned,
        balance_after: newBalance,
        description: `Earned ${pointsEarned} points on order ${orderId}`,
        order_id: orderId,
        status: 'completed',
      }])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating loyalty transaction: ${error.message}`);
      throw error;
    }

    // Update profile
    await client
      .from('loyalty_profiles')
      .update({
        points_balance: newBalance,
        total_points_earned: profile.total_points_earned + pointsEarned,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    // Check and update tier
    await this.updateTierIfEligible(customerId, newBalance);

    this.logger.log(`Customer ${customerId} earned ${pointsEarned} points (new balance: ${newBalance})`);

    return transaction;
  }

  /**
   * Redeem points for a reward
   */
  async redeemPoints(params: {
    customerId: string;
    rewardId: string;
    orderId?: string;
  }): Promise<LoyaltyTransaction> {
    const client = this.supabaseService.getClient();
    const { customerId, rewardId, orderId } = params;

    // Get profile and reward
    const profile = await this.getOrCreateProfile(customerId);
    const reward = await this.getReward(rewardId);

    if (!reward.is_active) {
      throw new Error('Reward is not active');
    }

    if (profile.points_balance < reward.points_required) {
      throw new Error(`Insufficient points. Required: ${reward.points_required}, Available: ${profile.points_balance}`);
    }

    // Create redemption transaction
    const newBalance = profile.points_balance - reward.points_required;
    const redemptionCode = `REDEEM${Date.now()}`;
    const { data: transaction, error } = await client
      .from('loyalty_transactions')
      .insert([{
        customer_id: customerId,
        transaction_type: 'redeem',
        points: reward.points_required,
        balance_after: newBalance,
        description: `Redeemed: ${reward.name}`,
        order_id: orderId,
        redemption_code: redemptionCode,
        status: 'completed',
      }])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error redeeming points: ${error.message}`);
      throw error;
    }

    // Update profile
    await client
      .from('loyalty_profiles')
      .update({
        points_balance: newBalance,
        total_points_redeemed: profile.total_points_redeemed + reward.points_required,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    // Update reward redemption count
    await client
      .from('loyalty_rewards')
      .update({
        times_redeemed: reward.times_redeemed + 1,
      })
      .eq('id', rewardId);

    this.logger.log(`Customer ${customerId} redeemed ${reward.points_required} points for ${reward.name}`);

    return transaction;
  }

  /**
   * Process referral
   */
  async processReferral(referrerCustomerId: string, refereeCustomerId: string): Promise<void> {
    const client = this.supabaseService.getClient();

    // Get referrer profile
    const referrerProfile = await this.getOrCreateProfile(referrerCustomerId);
    const refereeProfile = await this.getOrCreateProfile(refereeCustomerId);

    // Create referral record
    const { data: referral, error: referralError } = await client
      .from('referrals')
      .insert([{
        referrer_id: referrerCustomerId,
        referee_id: refereeCustomerId,
        referrer_reward_points: this.pointsRules.referralBonus.referrer,
        referee_reward_points: this.pointsRules.referralBonus.referee,
        status: 'completed',
      }])
      .select()
      .single();

    if (referralError) {
      this.logger.error(`Error creating referral: ${referralError.message}`);
      return;
    }

    // Award points to referrer
    await this.earnPoints({
      customerId: referrerCustomerId,
      orderId: `REF-${referral.id}`,
      orderValue: 0,
      isBirthday: false,
      isFirstOrder: false,
    });

    // Award points to referee
    await this.earnPoints({
      customerId: refereeCustomerId,
      orderId: `REF-REWARD-${referral.id}`,
      orderValue: 0,
      isBirthday: false,
      isFirstOrder: false,
    });

    this.logger.log(`Referral processed: ${referrerCustomerId} referred ${refereeCustomerId}`);
  }

  /**
   * Get available rewards
   */
  async getAvailableRewards(customerId?: string): Promise<LoyaltyReward[]> {
    const client = this.supabaseService.getClient();

    let query = client
      .from('loyalty_rewards')
      .select('*')
      .eq('is_active', true);

    if (customerId) {
      const profile = await this.getOrCreateProfile(customerId);
      // Only show rewards customer can afford
      query = query.lte('points_required', profile.points_balance);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`Error fetching rewards: ${error.message}`);
      return [];
    }

    return data;
  }

  /**
   * Get customer's transaction history
   */
  async getTransactionHistory(customerId: string, limit = 50): Promise<LoyaltyTransaction[]> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('loyalty_transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error(`Error fetching transactions: ${error.message}`);
      return [];
    }

    return data;
  }

  /**
   * Get loyalty analytics for customer
   */
  async getCustomerAnalytics(customerId: string) {
    const client = this.supabaseService.getClient();
    const profile = await this.getOrCreateProfile(customerId);

    // Get tier info
    const tier = await client
      .from('loyalty_tiers')
      .select('*')
      .eq('name', profile.tier)
      .single();

    // Get points to next tier
    const nextTier = await client
      .from('loyalty_tiers')
      .select('*')
      .gt('points_threshold', profile.total_points_earned)
      .order('points_threshold', { ascending: true })
      .limit(1)
      .single();

    const pointsToNextTier = nextTier.data
      ? nextTier.data.points_threshold - profile.total_points_earned
      : 0;

    return {
      profile,
      tier: tier.data,
      pointsToNextTier,
      nextTier: nextTier.data || null,
    };
  }

  /**
   * Update tier based on points
   */
  private async updateTierIfEligible(customerId: string, pointsBalance: number): Promise<void> {
    const client = this.supabaseService.getClient();

    // Find eligible tier
    const { data: eligibleTier } = await client
      .from('loyalty_tiers')
      .select('*')
      .lte('points_threshold', pointsBalance)
      .order('points_threshold', { ascending: false })
      .limit(1)
      .single();

    if (eligibleTier) {
      await client
        .from('loyalty_profiles')
        .update({
          tier: eligibleTier.name,
          tier_points_threshold: eligibleTier.points_threshold,
          updated_at: new Date().toISOString(),
        })
        .eq('customer_id', customerId);

      this.logger.log(`Customer ${customerId} upgraded to ${eligibleTier.name} tier`);
    }
  }

  /**
   * Get campaign by ID
   */
  private async getCampaign(campaignId: string) {
    const client = this.supabaseService.getClient();
    const { data } = await client
      .from('loyalty_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    return data;
  }

  /**
   * Get reward by ID
   */
  private async getReward(rewardId: string) {
    const client = this.supabaseService.getClient();
    const { data } = await client
      .from('loyalty_rewards')
      .select('*')
      .eq('id', rewardId)
      .single();
    return data;
  }

  /**
   * Get profile by referral code
   */
  async getProfileByReferralCode(referralCode: string): Promise<LoyaltyProfile | null> {
    const client = this.supabaseService.getClient();
    const { data } = await client
      .from('loyalty_profiles')
      .select('*')
      .eq('referral_code', referralCode)
      .single();
    return data;
  }

  /**
   * Expire old points (run as scheduled job)
   */
  async expireOldPoints(expiryMonths = 12): Promise<number> {
    const client = this.supabaseService.getClient();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() - expiryMonths);

    // Find expired transactions
    const { data: expiredTransactions } = await client
      .from('loyalty_transactions')
      .select('customer_id, points')
      .eq('transaction_type', 'earn')
      .lt('created_at', expiryDate.toISOString())
      .is('expires_at', null);

    if (!expiredTransactions || expiredTransactions.length === 0) {
      return 0;
    }

    // Mark as expired and deduct points
    let expiredCount = 0;
    for (const transaction of expiredTransactions) {
      await client
        .from('loyalty_transactions')
        .update({
          status: 'expired',
          expires_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      // Deduct from balance
      await client.rpc('decrement_loyalty_points', {
        p_customer_id: transaction.customer_id,
        p_points: transaction.points,
      });

      expiredCount++;
    }

    this.logger.log(`Expired ${expiredCount} point transactions`);
    return expiredCount;
  }
}
