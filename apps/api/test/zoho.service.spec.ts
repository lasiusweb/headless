import { Test, TestingModule } from '@nestjs/testing';
import { ZohoService } from '../src/modules/zoho/zoho.service';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('ZohoService', () => {
  let service: ZohoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZohoService, SupabaseService],
    })
    .useMocker((token) => {
      if (token === SupabaseService) {
        return {
          getClient: jest.fn(() => ({
            from: jest.fn(() => ({
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ 
                    data: { 
                      id: 'order-id', 
                      order_number: 'ORD123',
                      total_amount: 1000,
                      user: { 
                        id: 'user-id',
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com',
                        role: 'dealer'
                      },
                      items: []
                    }, 
                    error: null 
                  })),
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
        };
      }
    })
    .compile();

    service = module.get<ZohoService>(ZohoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sync order to Zoho', async () => {
    const result = await service.syncOrderToZoho('order-id');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});