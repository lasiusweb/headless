import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from '../src/modules/pricing/pricing.service';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService, SupabaseService],
    })
    .useMocker((token) => {
      if (token === SupabaseService) {
        return {
          getClient: jest.fn(() => ({
            from: jest.fn(() => ({
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: { role: 'dealer' }, error: null })),
                })),
              })),
            })),
          })),
        };
      }
    })
    .compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate correct pricing for dealer', async () => {
    const result = await service.getPricingForUser('user-id', 'variant-id');
    expect(result).toBeDefined();
    expect(typeof result.finalPrice).toBe('number');
  });
});