import { Test, TestingModule } from '@nestjs/testing';
import { MobilePosService } from './mobile-pos.service';
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
          lte: jest.fn(() => ({
            gte: jest.fn(() => ({
              in: jest.fn(() => ({
                order: jest.fn(() => ({
                  data: [],
                  error: null,
                })),
              })),
            })),
          })),
        })),
        gt: jest.fn(() => ({
          order: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            in: jest.fn(() => ({
              order: jest.fn(() => ({
                data: [],
                error: null,
              })),
            })),
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

describe('MobilePosService', () => {
  let service: MobilePosService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobilePosService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<MobilePosService>(MobilePosService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPosTransaction', () => {
    it('should create a new POS transaction successfully', async () => {
      const userId = 'user123';
      const createPosTransactionDto = {
        items: [
          {
            variantId: 'variant1',
            quantity: 2,
          }
        ],
        customerType: 'retail',
        paymentMethod: 'cash',
        notes: 'Test POS transaction'
      };

      const mockUser = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role: 'staff'
      };

      const mockVariant = {
        id: 'variant1',
        name: 'Neem Oil 1500ppm',
        sku: 'NEEM-OIL-1500',
        product: {
          id: 'prod1',
          name: 'Neem Oil',
          category_id: 'cat1'
        },
        mrp: 500,
        dealer_price: 450,
        distributor_price: 400
      };

      const mockPosTransaction = {
        id: 'pos123',
        transaction_number: 'POS20230216-12345',
        user_id: userId,
        customer_type: 'retail',
        subtotal: 1000,
        tax_amount: 180, // 18% tax
        total_amount: 1180,
        payment_method: 'cash',
        payment_status: 'completed',
        status: 'completed',
        notes: 'Test POS transaction',
        is_online: false,
        sync_status: 'pending',
        created_by: userId,
      };

      // Mock user query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock variant query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockVariant, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock POS transaction insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockPosTransaction, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock POS transaction items insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: {}, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the final transaction query with items
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ 
                  data: { ...mockPosTransaction, user: mockUser, items: [] }, 
                  error: null 
                }),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.createPosTransaction(createPosTransactionDto, userId);

      expect(result).toEqual({ ...mockPosTransaction, user: mockUser, items: [] });
    });

    it('should throw an error if no items are provided', async () => {
      const userId = 'user123';
      const createPosTransactionDto = {
        items: [], // Empty items array
        customerType: 'retail',
        paymentMethod: 'cash',
      };

      await expect(
        service.createPosTransaction(createPosTransactionDto, userId)
      ).rejects.toThrow('At least one item is required for a POS transaction');
    });

    it('should throw an error if user is not found', async () => {
      const userId = 'nonexistent-user';
      const createPosTransactionDto = {
        items: [
          {
            variantId: 'variant1',
            quantity: 1,
          }
        ],
        customerType: 'retail',
        paymentMethod: 'cash',
      };

      // Mock user query to return an error
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: 'User not found' } }),
            })),
          })),
        })),
      } as any);

      await expect(
        service.createPosTransaction(createPosTransactionDto, userId)
      ).rejects.toThrow('User not found');
    });
  });

  describe('getPosTransactionById', () => {
    it('should return a POS transaction with items', async () => {
      const transactionId = 'pos123';
      const userId = 'user123';

      const mockTransaction = {
        id: transactionId,
        transaction_number: 'POS20230216-12345',
        user_id: userId,
        customer_type: 'dealer',
        subtotal: 1000,
        tax_amount: 180,
        total_amount: 1180,
        payment_method: 'upi',
        payment_status: 'completed',
        status: 'completed',
        notes: 'Test transaction',
        created_by: userId,
      };

      const mockItems = [
        {
          id: 'item1',
          pos_transaction_id: transactionId,
          variant_id: 'variant1',
          variant_name: 'Neem Oil 1500ppm',
          product_name: 'Neem Oil',
          hsn_code: '380890',
          quantity: 2,
          unit_price: 500,
          total_price: 1000,
        }
      ];

      // Mock the transaction query with joined data
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ 
                  data: { ...mockTransaction, user: { first_name: 'John', last_name: 'Doe' }, items: mockItems }, 
                  error: null 
                }),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getPosTransactionById(transactionId, userId);

      expect(result).toEqual({ 
        ...mockTransaction, 
        user: { first_name: 'John', last_name: 'Doe' }, 
        items: mockItems 
      });
    });

    it('should throw NotFoundException if transaction is not found', async () => {
      const transactionId = 'nonexistent';
      const userId = 'user123';

      // Mock the transaction query to return an error
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ 
                  data: null, 
                  error: { code: 'PGRST116', message: 'Row not found' } // Supabase error code for not found
                }),
              })),
            })),
          })),
        })),
      } as any);

      await expect(
        service.getPosTransactionById(transactionId, userId)
      ).rejects.toThrow('POS transaction not found');
    });
  });

  describe('processPartialPayment', () => {
    it('should process a partial payment successfully', async () => {
      const orderId = 'order123';
      const userId = 'user123';
      const amount = 500;

      const mockOrder = {
        id: orderId,
        order_number: 'ORD-20230216-12345',
        user_id: userId,
        total_amount: 1000,
        currency: 'INR',
        payment_status: 'pending',
        status: 'processing',
      };

      const mockPayment = {
        id: 'payment123',
        order_id: orderId,
        amount: amount,
        currency: 'INR',
        payment_method: 'partial_payment',
        transaction_id: 'PARTIAL_TXN1234567890',
        status: 'initiated',
        checksum: 'checksum123',
      };

      // Mock order query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock payment insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockPayment, error: null }),
            })),
          })),
        })),
      } as any);

      const result = await service.processPartialPayment(orderId, userId, amount);

      expect(result).toEqual({
        success: true,
        message: 'Partial payment initiated successfully',
        paymentId: mockPayment.id,
        orderId: mockOrder.id,
        orderNumber: mockOrder.order_number,
        amount: amount,
        currency: mockOrder.currency,
        transactionId: expect.any(String),
        checksum: expect.any(String),
        paymentUrl: expect.any(String),
        gateway: 'partial_payment',
        isPartial: true,
      });
    });

    it('should throw an error if order is already fully paid', async () => {
      const orderId = 'order123';
      const userId = 'user123';
      const amount = 500;

      const mockOrder = {
        id: orderId,
        order_number: 'ORD-20230216-12345',
        user_id: userId,
        total_amount: 1000,
        currency: 'INR',
        payment_status: 'paid', // Already paid
        status: 'confirmed',
      };

      // Mock order query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
            })),
          })),
        })),
      } as any);

      await expect(
        service.processPartialPayment(orderId, userId, amount)
      ).rejects.toThrow('Order is already fully paid');
    });
  });

  describe('syncOfflineTransactions', () => {
    it('should sync offline transactions successfully', async () => {
      const userId = 'user123';

      const mockOfflineTransactions = [
        {
          id: 'pos1',
          transaction_number: 'POS20230216-11111',
          user_id: userId,
          total_amount: 1000,
          status: 'completed',
          is_online: false,
          sync_status: 'pending',
          items: [
            {
              id: 'item1',
              variant_id: 'variant1',
              quantity: 2,
              total_price: 1000,
            }
          ]
        }
      ];

      // Mock the offline transactions query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  order: jest.fn(() => ({
                    data: mockOfflineTransactions,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the sync update
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: { synced: true }, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the items sync update
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              returning: jest.fn(() => ({
                eq: jest.fn(() => ({
                  select: jest.fn(() => ({
                    single: jest.fn().mockResolvedValue({ data: { synced: true }, error: null }),
                  })),
                })),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.syncOfflineTransactions(userId);

      expect(result).toEqual({
        totalTransactions: 1,
        syncedCount: 1,
        failedCount: 0,
        results: [
          {
            transactionId: 'pos1',
            success: true,
            syncResult: { synced: true, transactionId: 'pos1' }
          }
        ]
      });
    });
  });

  describe('getPosDashboardMetrics', () => {
    it('should return POS dashboard metrics', async () => {
      const userId = 'user123';
      const filters = {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        endDate: new Date().toISOString(),
      };

      const mockRevenueData = [
        {
          total_amount: 5000,
          payment_method: 'cash',
          status: 'completed'
        },
        {
          total_amount: 3000,
          payment_method: 'upi',
          status: 'completed'
        }
      ];

      const mockTopProducts = [
        {
          product_name: 'Neem Oil 1500ppm',
          total_quantity: 10,
          total_revenue: 5000
        }
      ];

      // Mock revenue data query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest.fn(() => ({
                  in: jest.fn(() => ({
                    data: mockRevenueData,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        })),
      } as any);

      // Mock top products query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              group: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => ({
                    data: mockTopProducts,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getPosDashboardMetrics(userId, filters);

      expect(result).toEqual({
        totalRevenue: 8000, // 5000 + 3000
        transactionCount: 2,
        avgTransactionValue: 4000, // 8000 / 2
        revenueByMethod: {
          cash: 5000,
          upi: 3000
        },
        topProducts: mockTopProducts,
        period: {
          start: filters.startDate,
          end: filters.endDate
        }
      });
    });
  });
});