import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { SupabaseService } from '../../supabase/supabase.service';

// Mock the SupabaseService
const mockSupabaseService = {
  getClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        gt: jest.fn(() => ({
          order: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          returning: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(),
              })),
            })),
          })),
        })),
      })),
    })),
  })),
};

describe('PricingService', () => {
  let service: PricingService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPricingForUser', () => {
    it('should return pricing for a user with role-based pricing', async () => {
      const userId = 'user1';
      const variantId = 'variant1';
      const quantity = 1;

      const mockUser = { id: userId, role: 'dealer' };
      const mockVariant = {
        id: variantId,
        name: 'Test Variant',
        sku: 'TEST001',
        mrp: 100,
        dealer_price: 80,
        distributor_price: 70,
        product: {
          name: 'Test Product',
          slug: 'test-product'
        }
      };

      // Mock the user query
      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the variant query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockVariant, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the customer pricing query (returning no customer-specific pricing)
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }), // No rows returned
                })),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the volume discount query (returning no volume discounts)
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  data: [],
                  error: null,
                })),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the seasonal pricing query (returning no seasonal pricing)
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }), // No rows returned
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getPricingForUser(userId, variantId, quantity);

      expect(result).toEqual({
        variantId: mockVariant.id,
        productName: mockVariant.product.name,
        sku: mockVariant.sku,
        basePrice: mockVariant.mrp,
        customerSpecificPrice: null,
        finalPrice: mockVariant.dealer_price, // Dealer price applied
        userRole: mockUser.role,
        quantity,
        volumeDiscount: { discountPercentage: 0, minimumQuantity: 0, ruleName: 'No applicable discount' },
        appliedDiscount: mockVariant.mrp - mockVariant.dealer_price,
      });
    });
  });

  describe('calculateVolumeDiscount', () => {
    it('should return appropriate discount based on quantity', async () => {
      const variantId = 'variant1';
      const quantity = 100;

      const mockVolumeDiscountRules = [
        {
          id: 'rule1',
          variant_id: variantId,
          minimum_quantity: 50,
          discount_percentage: 10,
          name: 'Bulk Discount',
          is_active: true,
        },
        {
          id: 'rule2',
          variant_id: variantId,
          minimum_quantity: 10,
          discount_percentage: 5,
          name: 'Medium Discount',
          is_active: true,
        }
      ];

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  data: mockVolumeDiscountRules,
                  error: null,
                })),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.calculateVolumeDiscount(variantId, quantity);

      // Since quantity is 100, it should match the first rule (>= 50) which offers 10% discount
      expect(result).toEqual({
        discountPercentage: 10,
        minimumQuantity: 50,
        ruleName: 'Bulk Discount',
      });
    });

    it('should return 0% discount if no rules match', async () => {
      const variantId = 'variant1';
      const quantity = 5;

      const mockVolumeDiscountRules = [
        {
          id: 'rule1',
          variant_id: variantId,
          minimum_quantity: 10,
          discount_percentage: 5,
          name: 'Small Discount',
          is_active: true,
        }
      ];

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  data: mockVolumeDiscountRules,
                  error: null,
                })),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.calculateVolumeDiscount(variantId, quantity);

      // Since quantity is 5 and min requirement is 10, no rule applies
      expect(result).toEqual({
        discountPercentage: 0,
        minimumQuantity: 0,
        ruleName: 'No applicable discount',
      });
    });
  });

  describe('createVolumeDiscount', () => {
    it('should create a new volume discount rule', async () => {
      const variantId = 'variant1';
      const minimumQuantity = 50;
      const discountPercentage = 10;
      const name = 'Bulk Discount';

      const mockCreatedRule = {
        id: 'new-rule-id',
        variant_id: variantId,
        minimum_quantity: minimumQuantity,
        discount_percentage: discountPercentage,
        name: name,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockCreatedRule, error: null }),
            })),
          })),
        })),
      } as any);

      const result = await service.createVolumeDiscount(variantId, minimumQuantity, discountPercentage, name);

      expect(result).toEqual(mockCreatedRule);
    });
  });

  describe('isWithinSeason', () => {
    it('should correctly determine if current date is within seasonal pricing period', () => {
      // Using a fixed date for testing
      const originalDateNow = Date.now;
      const testDate = new Date('2023-06-15');
      Date.now = jest.fn(() => testDate.getTime());

      const seasonalPricing = {
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      };

      const result = service.isWithinSeason(seasonalPricing);
      expect(result).toBe(true);

      // Restore original Date.now
      Date.now = originalDateNow;
    });

    it('should handle seasonal pricing that spans across years', () => {
      // Using a fixed date for testing
      const originalDateNow = Date.now;
      const testDate = new Date('2023-11-15'); // Within Nov 2023 - Feb 2024
      Date.now = jest.fn(() => testDate.getTime());

      const seasonalPricing = {
        start_date: '2023-11-01', // November
        end_date: '2024-02-28',   // February next year
      };

      const result = service.isWithinSeason(seasonalPricing);
      expect(result).toBe(true);

      // Restore original Date.now
      Date.now = originalDateNow;
    });
  });
});