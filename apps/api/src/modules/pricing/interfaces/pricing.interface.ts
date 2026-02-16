export interface PricingRule {
  id: string;
  productId: string;
  userType: 'retailer' | 'dealer' | 'distributor';
  discountPercentage: number;
  minQuantity?: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductPrice {
  productId: string;
  basePrice: number; // MRP
  retailerPrice: number;
  dealerPrice: number;
  distributorPrice: number;
  currency: string;
  updatedAt: Date;
}

export interface UserPricingTier {
  userId: string;
  userType: 'retailer' | 'dealer' | 'distributor';
  effectiveDate: Date;
  approvedById?: string;
}