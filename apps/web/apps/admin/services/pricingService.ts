// services/pricingService.ts
import { PricingRule, UserPricingTier } from '../api/src/modules/pricing/interfaces/pricing.interface';
import { CreatePricingRuleDto, UpdatePricingRuleDto, CalculatePriceDto } from '../api/src/modules/pricing/dto/pricing.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the pricing API
 */
export class PricingService {
  /**
   * Creates a new pricing rule
   */
  static async createPricingRule(data: CreatePricingRuleDto): Promise<PricingRule> {
    const response = await fetch(`${API_BASE_URL}/pricing/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create pricing rule: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates an existing pricing rule
   */
  static async updatePricingRule(id: string, data: UpdatePricingRuleDto): Promise<PricingRule> {
    const response = await fetch(`${API_BASE_URL}/pricing/rules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update pricing rule: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets all pricing rules
   */
  static async getAllPricingRules(): Promise<PricingRule[]> {
    const response = await fetch(`${API_BASE_URL}/pricing/rules`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pricing rules: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets pricing rules for a specific product
   */
  static async getPricingRulesForProduct(productId: string): Promise<PricingRule[]> {
    const response = await fetch(`${API_BASE_URL}/pricing/rules/product/${productId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pricing rules for product: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Deletes a pricing rule
   */
  static async deletePricingRule(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/pricing/rules/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete pricing rule: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Calculates the final price for a user based on their tier
   */
  static async calculatePrice(data: CalculatePriceDto): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/pricing/calculate-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate price: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets the pricing tier for a specific user
   */
  static async getUserPricingTier(userId: string): Promise<UserPricingTier> {
    const response = await fetch(`${API_BASE_URL}/pricing/user-tier/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to get user pricing tier: ${response.statusText}`);
    }

    return response.json();
  }
}