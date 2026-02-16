import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../src/modules/orders/order.service';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('OrderService', () => {
  let service: OrderService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(() => ({
              from: jest.fn(() => ({
                select: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({ data: { id: '1', order_number: 'ORD001', total_amount: 1000 }, error: null })),
                    limit: jest.fn(() => ({
                      single: jest.fn(() => Promise.resolve({ data: { id: '1', order_number: 'ORD001', total_amount: 1000 }, error: null })),
                    })),
                  })),
                  insert: jest.fn(() => ({
                    select: jest.fn(() => ({
                      single: jest.fn(() => Promise.resolve({ data: { id: '1', order_number: 'ORD001', total_amount: 1000 }, error: null })),
                    })),
                  })),
                  update: jest.fn(() => ({
                    eq: jest.fn(() => ({
                      select: jest.fn(() => ({
                        single: jest.fn(() => Promise.resolve({ data: { id: '1', order_number: 'ORD001', total_amount: 1000 }, error: null })),
                      })),
                    })),
                  })),
                  delete: jest.fn(() => ({
                    eq: jest.fn(() => ({
                      single: jest.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
                    })),
                  })),
                })),
              })),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an order', async () => {
    const createOrderDto = {
      items: [
        {
          variantId: 'variant-1',
          quantity: 2,
        }
      ],
      shippingAddressId: 'address-1',
      billingAddressId: 'address-1',
      notes: 'Test order',
    };

    const result = await service.create(createOrderDto, 'user-1');
    expect(result).toEqual({ id: '1', order_number: 'ORD001', total_amount: 1000 });
  });

  it('should find an order by ID', async () => {
    const result = await service.findOne('1', 'user-1');
    expect(result).toEqual({ id: '1', order_number: 'ORD001', total_amount: 1000 });
  });

  it('should update an order status', async () => {
    const result = await service.updateStatus('1', 'confirmed', 'user-1');
    expect(result).toEqual({ id: '1', order_number: 'ORD001', total_amount: 1000, status: 'confirmed' });
  });

  it('should get user orders', async () => {
    const result = await service.findByUser('user-1');
    expect(Array.isArray(result)).toBe(true);
  });
});