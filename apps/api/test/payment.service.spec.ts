import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../src/modules/payments/payment.service';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    getClient: jest.fn(() => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: 'payment-1', 
                order_id: 'order-1', 
                amount: 1000, 
                status: 'pending',
                payment_method: 'easebuzz'
              }, 
              error: null 
            })),
            limit: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ 
                data: { 
                  id: 'payment-1', 
                  order_id: 'order-1', 
                  amount: 1000, 
                  status: 'pending',
                  payment_method: 'easebuzz'
                }, 
                error: null 
              })),
            })),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ 
                data: { 
                  id: 'payment-1', 
                  order_id: 'order-1', 
                  amount: 1000, 
                  status: 'initiated',
                  payment_method: 'easebuzz',
                  transaction_id: 'txn-12345'
                }, 
                error: null 
              })),
            })),
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ 
                  data: { 
                    id: 'payment-1', 
                    order_id: 'order-1', 
                    amount: 1000, 
                    status: 'completed',
                    payment_method: 'easebuzz'
                  }, 
                  error: null 
                })),
              })),
            })),
          })),
          delete: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { id: 'payment-1' }, error: null })),
            })),
          })),
        })),
      })),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initiate a payment', async () => {
    const createPaymentDto = {
      orderId: 'order-1',
      paymentMethod: 'easebuzz',
      amount: 1000,
    };

    const result = await service.initiatePayment(createPaymentDto, 'user-1');
    expect(result).toEqual({
      id: 'payment-1',
      orderId: 'order-1',
      amount: 1000,
      status: 'initiated',
      paymentMethod: 'easebuzz',
      transactionId: 'txn-12345',
    });
  });

  it('should verify a payment', async () => {
    const verifyPaymentDto = {
      transactionId: 'txn-12345',
      gateway: 'easebuzz',
      gatewayData: {
        status: 'success',
        amount: 1000,
        orderId: 'order-1',
      },
    };

    const result = await service.verifyPayment(verifyPaymentDto);
    expect(result).toEqual({
      id: 'payment-1',
      orderId: 'order-1',
      amount: 1000,
      status: 'completed',
      paymentMethod: 'easebuzz',
    });
  });

  it('should process a refund', async () => {
    const refundDto = {
      paymentId: 'payment-1',
      amount: 500,
      reason: 'Customer requested refund',
    };

    const result = await service.processRefund(refundDto);
    expect(result).toEqual({
      success: true,
      message: 'Refund processed successfully',
      refundId: expect.any(String),
      paymentId: 'payment-1',
      refundedAmount: 500,
    });
  });

  it('should get payment status', async () => {
    const result = await service.getPaymentStatus('payment-1');
    expect(result).toEqual({
      id: 'payment-1',
      orderId: 'order-1',
      amount: 1000,
      status: 'pending',
      paymentMethod: 'easebuzz',
    });
  });

  it('should get user payments', async () => {
    const result = await service.getUserPayments('user-1');
    expect(Array.isArray(result)).toBe(true);
  });
});