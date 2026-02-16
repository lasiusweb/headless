import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(private supabaseService: SupabaseService) {}

  async getUserLoyalty(userId: string) {
    const { data: userLoyalty, error: loyaltyError } = await this.supabaseService.getClient()
      .from('user_loyalty')
      .select(`
        *,
        user:profiles(first_name, last_name, email, role)
      `)
      .eq('user_id', userId)
      .single();

    if (loyaltyError && loyaltyError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw new Error(loyaltyError.message);
    }

    // If no loyalty record exists, create one with default values
    if (!userLoyalty) {
      return await this.createUserLoyalty(userId);
    }

    // Get recent activity
    const { data: recentActivity, error: activityError } = await this.supabaseService.getClient()
      .from('loyalty_points_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activityError) {
      this.logger.error(`Error fetching loyalty activity: ${activityError.message}`);
    }

    return {
      ...userLoyalty,
      recentActivity: recentActivity || [],
    };
  }

  async createUserLoyalty(userId: string) {
    const { data: user, error: userError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`User not found: ${userError.message}`);
    }

    // Determine initial tier based on user role
    let initialTier = 'bronze';
    if (user.role === 'dealer') {
      initialTier = 'silver';
    } else if (user.role === 'distributor') {
      initialTier = 'gold';
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('user_loyalty')
      .insert([
        {
          user_id: userId,
          points_balance: 0,
          tier: initialTier,
          total_earned_points: 0,
          total_redeemed_points: 0,
          last_activity_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async awardPoints(userId: string, points: number, reason: string, orderId?: string) {
    // Get current loyalty record
    const userLoyalty = await this.getUserLoyalty(userId);

    // Calculate new points balance
    const newPointsBalance = userLoyalty.points_balance + points;
    const newTotalEarned = userLoyalty.total_earned_points + points;

    // Update user's points
    const { data: updatedLoyalty, error } = await this.supabaseService.getClient()
      .from('user_loyalty')
      .update({
        points_balance: newPointsBalance,
        total_earned_points: newTotalEarned,
        last_activity_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Log the points transaction
    await this.logPointsTransaction(userId, points, 'earned', reason, orderId);

    // Check if user qualifies for a tier upgrade
    await this.checkTierUpgrade(userId, newPointsBalance);

    return {
      ...updatedLoyalty,
      pointsEarned: points,
      reason,
    };
  }

  async redeemPoints(userId: string, pointsToRedeem: number, reason: string, orderId?: string) {
    // Get current loyalty record
    const userLoyalty = await this.getUserLoyalty(userId);

    if (userLoyalty.points_balance < pointsToRedeem) {
      throw new Error(`Insufficient points. Available: ${userLoyalty.points_balance}, Requested: ${pointsToRedeem}`);
    }

    // Calculate new points balance
    const newPointsBalance = userLoyalty.points_balance - pointsToRedeem;
    const newTotalRedeemed = userLoyalty.total_redeemed_points + pointsToRedeem;

    // Update user's points
    const { data: updatedLoyalty, error } = await this.supabaseService.getClient()
      .from('user_loyalty')
      .update({
        points_balance: newPointsBalance,
        total_redeemed_points: newTotalRedeemed,
        last_activity_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Log the points transaction
    await this.logPointsTransaction(userId, -pointsToRedeem, 'redeemed', reason, orderId);

    return {
      ...updatedLoyalty,
      pointsRedeemed: pointsToRedeem,
      reason,
    };
  }

  async getLoyaltyTiers() {
    const { data, error } = await this.supabaseService.getClient()
      .from('loyalty_tiers')
      .select('*')
      .order('min_points', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getLoyaltyPointsHistory(userId: string, limit: number = 20, offset: number = 0) {
    const { data, error } = await this.supabaseService.getClient()
      .from('loyalty_points_log')
      .select(`
        *,
        user:profiles(first_name, last_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getEligibleRewards(userId: string) {
    const userLoyalty = await this.getUserLoyalty(userId);
    const { data: allRewards, error: rewardsError } = await this.supabaseService.getClient()
      .from('loyalty_rewards')
      .select('*')
      .eq('is_active', true);

    if (rewardsError) {
      throw new Error(rewardsError.message);
    }

    // Filter rewards that the user can afford
    const eligibleRewards = allRewards.filter(reward => reward.cost_points <= userLoyalty.points_balance);

    return eligibleRewards;
  }

  async claimReward(userId: string, rewardId: string) {
    // Get reward details
    const { data: reward, error: rewardError } = await this.supabaseService.getClient()
      .from('loyalty_rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single();

    if (rewardError) {
      throw new Error(`Reward not found: ${rewardError.message}`);
    }

    if (reward.cost_points > (await this.getUserLoyalty(userId)).points_balance) {
      throw new Error(`Insufficient points to claim this reward. Cost: ${reward.cost_points}, Available: ${userLoyalty.points_balance}`);
    }

    // Redeem the points for the reward
    await this.redeemPoints(userId, reward.cost_points, `Claimed reward: ${reward.name}`, null);

    // Create reward claim record
    const { data: claim, error: claimError } = await this.supabaseService.getClient()
      .from('loyalty_reward_claims')
      .insert([
        {
          user_id: userId,
          reward_id: rewardId,
          points_used: reward.cost_points,
          reward_value: reward.value,
        }
      ])
      .select()
      .single();

    if (claimError) {
      throw new Error(claimError.message);
    }

    return {
      success: true,
      message: 'Reward claimed successfully',
      reward: reward,
      pointsUsed: reward.cost_points,
      claim: claim,
    };
  }

  private async logPointsTransaction(
    userId: string, 
    points: number, 
    transactionType: 'earned' | 'redeemed', 
    reason: string, 
    orderId?: string
  ) {
    const { error } = await this.supabaseService.getClient()
      .from('loyalty_points_log')
      .insert([
        {
          user_id: userId,
          points_change: points,
          transaction_type: transactionType,
          reason,
          order_id: orderId || null,
          balance_after: await this.getCurrentPointsBalance(userId), // Would need to implement this
        }
      ]);

    if (error) {
      this.logger.error(`Error logging loyalty points transaction: ${error.message}`);
    }
  }

  private async getCurrentPointsBalance(userId: string): Promise<number> {
    const { data, error } = await this.supabaseService.getClient()
      .from('user_loyalty')
      .select('points_balance')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data.points_balance;
  }

  private async checkTierUpgrade(userId: string, pointsBalance: number) {
    // Get all loyalty tiers
    const tiers = await this.getLoyaltyTiers();
    
    // Find the highest tier the user qualifies for
    const eligibleTiers = tiers
      .filter(tier => pointsBalance >= tier.min_points)
      .sort((a, b) => b.min_points - a.min_points);
    
    if (eligibleTiers.length > 0) {
      const newTier = eligibleTiers[0];
      
      // Get current user tier
      const { data: userLoyalty, error } = await this.supabaseService.getClient()
        .from('user_loyalty')
        .select('tier')
        .eq('user_id', userId)
        .single();

      if (error) {
        this.logger.error(`Error getting user tier: ${error.message}`);
        return;
      }

      // If tier has changed, update it
      if (userLoyalty.tier !== newTier.name) {
        const { error: updateError } = await this.supabaseService.getClient()
          .from('user_loyalty')
          .update({ 
            tier: newTier.name,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          this.logger.error(`Error updating user tier: ${updateError.message}`);
        } else {
          // Log the tier upgrade
          await this.logTierChange(userId, userLoyalty.tier, newTier.name);
        }
      }
    }
  }

  private async logTierChange(userId: string, oldTier: string, newTier: string) {
    const { error } = await this.supabaseService.getClient()
      .from('loyalty_tier_changes')
      .insert([
        {
          user_id: userId,
          old_tier: oldTier,
          new_tier: newTier,
        }
      ]);

    if (error) {
      this.logger.error(`Error logging tier change: ${error.message}`);
    }
  }

  async calculateOrderPoints(orderId: string) {
    // Get order details
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        user:profiles(role),
        items:order_items(*, variant:product_variants(product:products(name, category_id)))
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error(`Order not found: ${orderError.message}`);
    }

    // Calculate points based on order total and user role
    let pointsMultiplier = 1; // Default multiplier
    
    if (order.user.role === 'dealer') {
      pointsMultiplier = 1.2; // 20% bonus for dealers
    } else if (order.user.role === 'distributor') {
      pointsMultiplier = 1.5; // 50% bonus for distributors
    }

    // Calculate points (e.g., 1 point per ₹10 spent)
    const pointsToAward = Math.floor(order.total_amount / 10) * pointsMultiplier;

    // Award points to user
    await this.awardPoints(
      order.user_id,
      pointsToAward,
      `Purchase from order ${order.order_number}`,
      orderId
    );

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      pointsAwarded: pointsToAward,
      userId: order.user_id,
    };
  }
}