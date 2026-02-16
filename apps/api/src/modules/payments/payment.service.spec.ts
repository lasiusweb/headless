import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
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

describe('PaymentService', () => {
  let service: PaymentService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiatePayment', () => {
    it('should initiate a payment successfully', async () => {
      const userId = 'user1';
      const createPaymentDto = {
        orderId: 'order1',
        paymentMethod: 'easebuzz',
        callbackUrl: 'https://example.com/callback',
        returnUrl: 'https://example.com/return',
      };

      const mockOrder = {
        id: 'order1',
        order_number: 'ORD123456789-1234',
        user_id: userId,
        user: { role: 'customer' },
        total_amount: 1000,
        currency: 'INR',
        payment_status: 'pending',
        status: 'processing',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockPayment = {
        id: 'payment1',
        order_id: 'order1',
        amount: 1000,
        currency: 'INR',
        payment_method: 'easebuzz',
        transaction_id: 'TXN12345678901234',
        status: 'initiated',
        checksum: 'checksum123',
        gateway_response: {
          message: 'Payment initiated successfully',
          order_id: 'ORD123456789-1234',
          amount: 1000,
          currency: 'INR',
        },
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock the order query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the payment insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockPayment, error: null }),
            })),
          })),
        })),
      } as any);

      const result = await service.initiatePayment(createPaymentDto, userId);

      expect(result).toEqual({
        success: true,
        message: 'Payment initiated successfully',
        paymentId: mockPayment.id,
        orderId: mockOrder.id,
        orderNumber: mockOrder.order_number,
        amount: mockOrder.total_amount,
        currency: mockOrder.currency,
        transactionId: mockPayment.transaction_id,
        checksum: mockPayment.checksum,
        paymentUrl: expect.any(String),
        gateway: createPaymentDto.paymentMethod,
      });
    });

    it('should throw an error if order is not found', async () => {
      const userId = 'user1';
      const createPaymentDto = {
        orderId: 'nonexistent-order',
        paymentMethod: 'easebuzz',
      };

      // Mock the order query to return an error
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Order not found' } }),
            })),
          })),
        })),
      } as any);

      await expect(service.initiatePayment(createPaymentDto, userId)).rejects.toThrow('Order not found: Order not found');
    });
  });

  describe('verifyPayment', () => {
    it('should verify a payment successfully', async () => {
      const paymentId = 'payment1';
      const gateway = 'easebuzz';
      const gatewayData = { status: 'success', txnid: 'TXN12345678901234' };

      const mockPayment = {
        id: paymentId,
        order_id: 'order1',
        amount: 1000,
        currency: 'INR',
        payment_method: 'easebuzz',
        transaction_id: 'TXN12345678901234',
        status: 'initiated',
        checksum: 'checksum123',
        gateway_response: {
          message: 'Payment initiated successfully',
          order_id: 'ORD123456789-1234',
          amount: 1000,
          currency: 'INR',
        },
        created_by: 'user1',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockOrder = {
        id: 'order1',
        order_number: 'ORD123456789-1234',
        total_amount: 1000,
        user_id: 'user1',
        status: 'processing',
      };

      // Mock the payment query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ 
                data: { ...mockPayment, order: mockOrder }, 
                error: null 
              }),
            })),
          })),
        })),
      } as any);

      // Mock the payment update
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ 
                  data: { ...mockPayment, status: 'completed' }, 
                  error: null 
                }),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the order update
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ 
                  data: { ...mockOrder, payment_status: 'paid', status: 'confirmed' }, 
                  error: null 
                }),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.verifyPayment(paymentId, gateway, gatewayData);

      expect(result).toEqual({
        success: true,
        message: 'Payment verified successfully',
        paymentId: mockPayment.id,
        orderId: mockPayment.order_id,
        orderNumber: mockOrder.order_number,
        amount: mockPayment.amount,
        status: 'completed',
      });
    });
  });

  describe('processPartialPayment', () => {
    it('should process a partial payment successfully', async () => {
      const orderId = 'order1';
      const userId = 'user1';
      const amount = 500;

      const mockOrder = {
        id: orderId,
        order_number: 'ORD123456789-1234',
        user_id: userId,
        total_amount: 1000,
        currency: 'INR',
        payment_status: 'pending',
        status: 'processing',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockPayment = {
        id: 'payment1',
        order_id: orderId,
        amount: amount,
        currency: 'INR',
        payment_method: 'partial_payment',
        transaction_id: 'PARTIAL_TXN12345678901234',
        status: 'initiated',
        checksum: 'checksum123',
        gateway_response: {
          message: 'Partial payment initiated successfully',
          order_id: 'ORD123456789-1234',
          amount: amount,
          currency: 'INR',
          is_partial: true,
        },
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock the order query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the payment insertion
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
        transactionId: mockPayment.transaction_id,
        checksum: mockPayment.checksum,
        paymentUrl: expect.any(String),
        gateway: 'partial_payment',
        isPartial: true,
      });
    });
  });

  describe('getUserPaymentHistory', () => {
    it('should return user\'s payment history', async () => {
      const userId = 'user1';

      const mockPayments = [
        {
          id: 'payment1',
          order_id: 'order1',
          amount: 1000,
          currency: 'INR',
          payment_method: 'easebuzz',
          transaction_id: 'TXN12345678901234',
          status: 'completed',
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
          order: {
            order_number: 'ORD123456789-1234',
            total_amount: 1000,
            status: 'confirmed',
          }
        }
      ];

      // Mock the payment history query
      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockPayments,
                error: null,
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getUserPaymentHistory(userId);

      expect(result).toEqual(mockPayments);
    });
  });
});