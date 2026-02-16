import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from '../src/modules/invoices/invoice.service';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceService, SupabaseService],
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
                      total_amount: 1000,
                      shipping_address: { state: 'Maharashtra' },
                      user: { business_address: { state: 'Maharashtra' } }
                    }, 
                    error: null 
                  })),
                })),
              })),
              insert: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: { id: 'invoice-id' }, error: null })),
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

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create invoice', async () => {
    const result = await service.create('order-id');
    expect(result).toBeDefined();
    expect(result.id).toBe('invoice-id');
  });
});