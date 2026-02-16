import { Injectable } from '@nestjs/common';
import { DealerApplication } from '../dealers/interfaces/dealer-application.interface';
import { PricingRule, ProductPrice, UserPricingTier } from './interfaces/pricing.interface';
import { CreatePricingRuleDto, UpdatePricingRuleDto, CalculatePriceDto } from './dto/pricing.dto';

@Injectable()
export class PricingService {
  private pricingRules: PricingRule[] = [];
  private userPricingTiers: UserPricingTier[] = [];

  /**
   * Assigns the appropriate pricing tier based on dealer information
   */
  assignPricingTier(dealer: DealerApplication): 'retailer' | 'dealer' | 'distributor' {
    // In a real application, this would be more sophisticated
    // For example, based on business size, volume commitments, etc.
    
    // Default logic: businesses with higher credit limits get better pricing tiers
    if (dealer.creditLimitRequired && dealer.creditLimitAmount >= 1000000) {
      return 'distributor'; // 55% off MRP
    } else if (dealer.creditLimitRequired && dealer.creditLimitAmount >= 500000) {
      return 'dealer'; // 40% off MRP
    } else {
      return 'dealer'; // Default to dealer tier (40% off MRP)
    }
  }

  /**
   * Calculates the discount percentage based on pricing tier
   */
  getDiscountPercentage(tier: 'retailer' | 'dealer' | 'distributor'): number {
    switch (tier) {
      case 'retailer':
        return 0; // Retail price
      case 'dealer':
        return 40; // 40% off MRP
      case 'distributor':
        return 55; // 55% off MRP
      default:
        return 0;
    }
  }

  /**
   * Updates dealer's pricing tier after approval
   */
  async updateDealerPricing(userId: string, pricingTier: 'retailer' | 'dealer' | 'distributor') {
    // In a real application, this would update the user's profile in the database
    const existingIndex = this.userPricingTiers.findIndex(tier => tier.userId === userId);
    
    if (existingIndex !== -1) {
      // Update existing tier
      this.userPricingTiers[existingIndex] = {
        ...this.userPricingTiers[existingIndex],
        userType: pricingTier,
        effectiveDate: new Date(),
      };
    } else {
      // Create new tier record
      const newUserTier: UserPricingTier = {
        userId,
        userType: pricingTier,
        effectiveDate: new Date(),
      };
      this.userPricingTiers.push(newUserTier);
    }
    
    return { success: true, userId, pricingTier };
  }

  /**
   * Creates a new pricing rule
   */
  createPricingRule(createPricingRuleDto: CreatePricingRuleDto): PricingRule {
    const newRule: PricingRule = {
      id: Math.random().toString(36).substring(7),
      ...createPricingRuleDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.pricingRules.push(newRule);
    return newRule;
  }

  /**
   * Updates an existing pricing rule
   */
  updatePricingRule(id: string, updatePricingRuleDto: UpdatePricingRuleDto): PricingRule {
    const index = this.pricingRules.findIndex(rule => rule.id === id);
    if (index === -1) {
      throw new Error(`Pricing rule with ID ${id} not found`);
    }

    this.pricingRules[index] = {
      ...this.pricingRules[index],
      ...updatePricingRuleDto,
      updatedAt: new Date(),
    };

    return this.pricingRules[index];
  }

  /**
   * Gets pricing rules for a specific product
   */
  getPricingRulesForProduct(productId: string): PricingRule[] {
    return this.pricingRules.filter(rule => rule.productId === productId);
  }

  /**
   * Calculates the final price for a user based on their tier
   */
  calculatePrice(calculatePriceDto: CalculatePriceDto): number {
    // In a real application, this would fetch the base price from the product service
    const basePrice = 100; // Placeholder - would come from product service

    // Find applicable pricing rule
    const applicableRule = this.pricingRules.find(
      rule => 
        rule.productId === calculatePriceDto.productId &&
        rule.userType === calculatePriceDto.userType &&
        (!rule.minQuantity || (calculatePriceDto.quantity && calculatePriceDto.quantity >= rule.minQuantity)) &&
        (!rule.startDate || rule.startDate <= new Date()) &&
        (!rule.endDate || rule.endDate >= new Date())
    );

    // Apply discount if rule exists
    const discountPercentage = applicableRule ? applicableRule.discountPercentage : this.getDiscountPercentage(calculatePriceDto.userType);
    const discountAmount = (basePrice * discountPercentage) / 100;
    const finalPrice = basePrice - discountAmount;

    return parseFloat(finalPrice.toFixed(2));
  }

  /**
   * Gets all pricing rules
   */
  getAllPricingRules(): PricingRule[] {
    return [...this.pricingRules];
  }

  /**
   * Gets a specific pricing rule by ID
   */
  getPricingRuleById(id: string): PricingRule {
    const rule = this.pricingRules.find(r => r.id === id);
    if (!rule) {
      throw new Error(`Pricing rule with ID ${id} not found`);
    }
    return rule;
  }

  /**
   * Deletes a pricing rule
   */
  deletePricingRule(id: string): boolean {
    const initialLength = this.pricingRules.length;
    this.pricingRules = this.pricingRules.filter(rule => rule.id !== id);
    return this.pricingRules.length < initialLength;
  }

  /**
   * Gets the pricing tier for a specific user
   */
  getUserPricingTier(userId: string): UserPricingTier {
    const userTier = this.userPricingTiers.find(tier => tier.userId === userId);
    if (!userTier) {
      // Default to retailer if no specific tier assigned
      return {
        userId,
        userType: 'retailer',
        effectiveDate: new Date(),
      };
    }
    return userTier;
  }
}