// services/loyaltyService.ts
import { 
  CustomerLoyaltyProfile, 
  LoyaltyTransaction, 
  LoyaltyReward, 
  LoyaltyCampaign,
  LoyaltyAnalytics 
} from '../api/src/modules/loyalty-program/interfaces/loyalty.interface';
import { 
  CreateLoyaltyProfileDto, 
  UpdateLoyaltyProfileDto, 
  CreateLoyaltyTransactionDto, 
  CreateLoyaltyRewardDto, 
  UpdateLoyaltyRewardDto, 
  CreateLoyaltyCampaignDto, 
  RedeemRewardDto,
  EarnPointsDto 
} from '../api/src/modules/loyalty-program/dto/loyalty.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the loyalty program API
 */
export class LoyaltyService {
  /**
   * Creates a new loyalty profile
   */
  static async createLoyaltyProfile(data: CreateLoyaltyProfileDto): Promise<CustomerLoyaltyProfile> {
    const response = await fetch(`${API_BASE_URL}/loyalty/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create loyalty profile: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a loyalty profile
   */
  static async updateLoyaltyProfile(id: string, data: UpdateLoyaltyProfileDto): Promise<CustomerLoyaltyProfile> {
    const response = await fetch(`${API_BASE_URL}/loyalty/profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update loyalty profile: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a loyalty profile by customer ID
   */
  static async getLoyaltyProfileByCustomerId(customerId: string): Promise<CustomerLoyaltyProfile> {
    const response = await fetch(`${API_BASE_URL}/loyalty/profiles/customer/${customerId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch loyalty profile: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a loyalty profile by ID
   */
  static async getLoyaltyProfileById(id: string): Promise<CustomerLoyaltyProfile> {
    const response = await fetch(`${API_BASE_URL}/loyalty/profiles/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch loyalty profile: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a loyalty transaction
   */
  static async createLoyaltyTransaction(data: CreateLoyaltyTransactionDto): Promise<LoyaltyTransaction> {
    const response = await fetch(`${API_BASE_URL}/loyalty/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create loyalty transaction: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets loyalty transactions by customer
   */
  static async getLoyaltyTransactionsByCustomer(customerId: string): Promise<LoyaltyTransaction[]> {
    const response = await fetch(`${API_BASE_URL}/loyalty/transactions/customer/${customerId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch loyalty transactions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a loyalty reward
   */
  static async createLoyaltyReward(data: CreateLoyaltyRewardDto): Promise<LoyaltyReward> {
    const response = await fetch(`${API_BASE_URL}/loyalty/rewards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create loyalty reward: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a loyalty reward
   */
  static async updateLoyaltyReward(id: string, data: UpdateLoyaltyRewardDto): Promise<LoyaltyReward> {
    const response = await fetch(`${API_BASE_URL}/loyalty/rewards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update loyalty reward: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets all loyalty rewards
   */
  static async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    const response = await fetch(`${API_BASE_URL}/loyalty/rewards`);

    if (!response.ok) {
      throw new Error(`Failed to fetch loyalty rewards: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a loyalty campaign
   */
  static async createLoyaltyCampaign(data: CreateLoyaltyCampaignDto): Promise<LoyaltyCampaign> {
    const response = await fetch(`${API_BASE_URL}/loyalty/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create loyalty campaign: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets active loyalty campaigns
   */
  static async getActiveLoyaltyCampaigns(): Promise<LoyaltyCampaign[]> {
    const response = await fetch(`${API_BASE_URL}/loyalty/campaigns/active`);

    if (!response.ok) {
      throw new Error(`Failed to fetch active loyalty campaigns: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Redeems a reward
   */
  static async redeemReward(data: RedeemRewardDto): Promise<LoyaltyTransaction> {
    const response = await fetch(`${API_BASE_URL}/loyalty/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to redeem reward: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Earns points for an order
   */
  static async earnPoints(data: EarnPointsDto): Promise<LoyaltyTransaction> {
    const response = await fetch(`${API_BASE_URL}/loyalty/earn-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to earn points: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets loyalty analytics
   */
  static async getLoyaltyAnalytics(): Promise<LoyaltyAnalytics> {
    const response = await fetch(`${API_BASE_URL}/loyalty/analytics`);

    if (!response.ok) {
      throw new Error(`Failed to fetch loyalty analytics: ${response.statusText}`);
    }

    return response.json();
  }
}