import { Test, TestingModule } from '@nestjs/testing';
import { ShippingService } from '../src/modules/shipping/shipping.service';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('ShippingService', () => {
  let service: ShippingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShippingService, SupabaseService],
    })
    .useMocker((token) => {
      if (token === SupabaseService) {
        return {
          getClient: jest.fn(() => ({
            from: jest.fn(() => ({
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
                  limit: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
                  })),
                })),
                insert: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
                })),
                update: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
                  })),
                })),
              })),
            })),
          })),
        };
      }
    })
    .compile();

    service = module.get<ShippingService>(ShippingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create shipment', async () => {
    const result = await service.create({
      orderId: 'order-id',
      carrierId: 'carrier-id',
      status: 'pending',
    });
    expect(result).toBeDefined();
  });
});