import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('PaymentService', () => {
  let service: PaymentService;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn(),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn().mockReturnValue(mockSupabaseClient),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initiatePayment', () => {
    it('should initiate payment for approved order', async () => {
      const userId = 'user-123';
      const createPaymentDto = {
        orderId: 'order-123',
        paymentMethod: 'easebuzz',
        callbackUrl: 'https://example.com/callback',
        returnUrl: 'https://example.com/return',
      };

      const mockOrder = {
        id: 'order-123',
        order_number: 'ORD2026021234',
        user_id: userId,
        total_amount: 1000,
        currency: 'INR',
        status: 'processing',
        payment_status: 'pending',
        user: { role: 'retailer' },
      };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
      });

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { id: 'payment-123', transaction_id: 'TXN123456' }, 
          error: null 
        }),
      });

      const result = await service.initiatePayment(createPaymentDto, userId);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('payment-123');
      expect(result.amount).toBe(1000);
    });

    it('should throw UnauthorizedException for another user order', async () => {
      const userId = 'user-123';
      const createPaymentDto = {
        orderId: 'order-456',
        paymentMethod: 'easebuzz',
        callbackUrl: 'https://example.com/callback',
        returnUrl: 'https://example.com/return',
      };

      const mockOrder = {
        id: 'order-456',
        user_id: 'user-789', // Different user
        total_amount: 1000,
        status: 'processing',
        payment_status: 'pending',
      };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
      });

      await expect(service.initiatePayment(createPaymentDto, userId))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException for unapproved dealer order', async () => {
      const userId = 'dealer-123';
      const createPaymentDto = {
        orderId: 'order-123',
        paymentMethod: 'easebuzz',
        callbackUrl: 'https://example.com/callback',
        returnUrl: 'https://example.com/return',
      };

      const mockOrder = {
        id: 'order-123',
        user_id: userId,
        total_amount: 1000,
        status: 'pending_approval',
        payment_status: 'pending',
        user: { role: 'dealer' },
      };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
      });

      await expect(service.initiatePayment(createPaymentDto, userId))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('verifyPayment', () => {
    it('should verify successful payment and update order status', async () => {
      const paymentId = 'payment-123';
      const gateway = 'easebuzz';
      const gatewayData = { status: 'success' };

      const mockPayment = {
        id: paymentId,
        order_id: 'order-123',
        transaction_id: 'TXN123456',
        amount: 1000,
        checksum: 'valid-checksum',
        created_by: 'user-123',
        status: 'initiated',
        order: {
          order_number: 'ORD2026021234',
          total_amount: 1000,
          user_id: 'user-123',
          status: 'processing',
        },
      };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPayment, error: null }),
      });

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await service.verifyPayment(paymentId, gateway, gatewayData);

      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
    });
  });

  describe('refundPayment', () => {
    it('should process refund for completed payment', async () => {
      const paymentId = 'payment-123';

      const mockPayment = {
        id: paymentId,
        order_id: 'order-123',
        transaction_id: 'TXN123456',
        amount: 1000,
        status: 'completed',
        payment_method: 'easebuzz',
        order: {
          order_number: 'ORD2026021234',
          total_amount: 1000,
          user_id: 'user-123',
        },
      };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPayment, error: null }),
      });

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await service.refundPayment(paymentId, undefined, 'Customer request');

      expect(result.success).toBe(true);
      expect(result.status).toBe('refunded');
    });

    it('should throw BadRequestException for non-completed payment', async () => {
      const paymentId = 'payment-123';

      const mockPayment = {
        id: paymentId,
        order_id: 'order-123',
        status: 'initiated', // Not completed
        amount: 1000,
      };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPayment, error: null }),
      });

      await expect(service.refundPayment(paymentId))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('processPartialPayment', () => {
    it('should process partial payment for order', async () => {
      const orderId = 'order-123';
      const userId = 'user-123';
      const amount = 500;

      const mockOrder = {
        id: orderId,
        user_id: userId,
        order_number: 'ORD2026021234',
        total_amount: 1000,
        currency: 'INR',
        payment_status: 'pending',
      };

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
      });

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { id: 'payment-partial-123' }, 
          error: null 
        }),
      });

      const result = await service.processPartialPayment(orderId, userId, amount);

      expect(result.success).toBe(true);
      expect(result.amount).toBe(500);
      expect(result.isPartial).toBe(true);
    });
  });

  describe('getUserPaymentHistory', () => {
    it('should return payment history for user', async () => {
      const userId = 'user-123';

      const mockPayments = [
        {
          id: 'payment-1',
          order_id: 'order-1',
          amount: 500,
          status: 'completed',
          order: { order_number: 'ORD2026021234', total_amount: 500, status: 'processing' },
        },
        {
          id: 'payment-2',
          order_id: 'order-2',
          amount: 300,
          status: 'completed',
          order: { order_number: 'ORD2026021235', total_amount: 300, status: 'delivered' },
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        ...mockQueryBuilder,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockPayments, error: null }),
      });

      const result = await service.getUserPaymentHistory(userId);

      expect(result).toEqual(mockPayments);
      expect(result.length).toBe(2);
    });
  });
});
