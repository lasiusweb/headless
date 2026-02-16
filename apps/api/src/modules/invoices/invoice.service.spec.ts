import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
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
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [],
              error: null,
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

describe('InvoiceService', () => {
  let service: InvoiceService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an invoice successfully', async () => {
      const orderId = 'order1';

      const mockOrder = {
        id: 'order1',
        order_number: 'ORD123456789-1234',
        status: 'confirmed',
        total_amount: 1000,
        user: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          gst_number: '12ABCDE1234PZ',
          business_address: 'Mumbai',
        },
        shipping_address: {
          state: 'Maharashtra',
        },
        billing_address: {
          state: 'Maharashtra',
        },
        items: [
          {
            id: 'item1',
            variant_id: 'variant1',
            quantity: 2,
            unit_price: 500,
            total_price: 1000,
            variant: {
              id: 'variant1',
              name: 'Neem Oil 1500ppm',
              sku: 'NEEM-OIL-1500',
              product: {
                name: 'Neem Oil 1500ppm',
                hsn_code: '3808',
                category_id: 'cat1',
              }
            }
          }
        ],
      };

      const mockInvoice = {
        id: 'invoice1',
        order_id: 'order1',
        invoice_number: 'INV202302-1234',
        customer_name: 'John Doe',
        customer_gst_number: '12ABCDE1234PZ',
        billing_address: mockOrder.billing_address,
        shipping_address: mockOrder.shipping_address,
        cgst_amount: 90, // 9% of 1000
        sgst_amount: 90, // 9% of 1000
        igst_amount: 0, // 0 for intra-state
        total_taxable_amount: 1000,
        total_gst_amount: 180, // 18% of 1000
        total_amount: 1180, // 1000 + 180
        issued_at: new Date().toISOString(),
        due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'draft',
        is_inter_state: false,
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

      // Mock the invoice insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockInvoice, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the invoice items insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: {}, error: null }),
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
                single: jest.fn().mockResolvedValue({ data: { ...mockOrder, status: 'invoiced' }, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the final invoice query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockInvoice, error: null }),
            })),
          })),
        })),
      } as any);

      const result = await service.create(orderId);

      expect(result).toEqual(mockInvoice);
    });

    it('should throw an error if order is not found', async () => {
      const orderId = 'nonexistent-order';

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

      await expect(service.create(orderId)).rejects.toThrow('Order not found: Order not found');
    });

    it('should throw an error if order is not eligible for invoice generation', async () => {
      const orderId = 'order1';

      const mockOrder = {
        id: 'order1',
        order_number: 'ORD123456789-1234',
        status: 'awaiting_approval', // Not eligible for invoice
        total_amount: 1000,
        user: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          gst_number: '12ABCDE1234PZ',
          business_address: 'Mumbai',
        },
        shipping_address: {
          state: 'Maharashtra',
        },
        billing_address: {
          state: 'Maharashtra',
        },
        items: [],
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

      await expect(service.create(orderId)).rejects.toThrow('Invoice can only be generated for confirmed or processing orders');
    });
  });

  describe('generateCreditNote', () => {
    it('should generate a credit note successfully', async () => {
      const invoiceId = 'invoice1';
      const reason = 'Product return';
      const adjustmentAmount = 500;

      const mockOriginalInvoice = {
        id: 'invoice1',
        invoice_number: 'INV202302-1234',
        total_amount: 1180,
        status: 'paid',
      };

      const mockCreditNote = {
        id: 'creditnote1',
        original_invoice_id: 'invoice1',
        credit_note_number: 'CRN202302-1234',
        reason: 'Product return',
        adjustment_amount: 500,
        issued_at: new Date().toISOString(),
        status: 'issued',
      };

      // Mock the original invoice query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockOriginalInvoice, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the credit note insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockCreditNote, error: null }),
            })),
          })),
        })),
      } as any);

      const result = await service.generateCreditNote(invoiceId, reason, adjustmentAmount);

      expect(result).toEqual(mockCreditNote);
    });
  });

  describe('generateDebitNote', () => {
    it('should generate a debit note successfully', async () => {
      const invoiceId = 'invoice1';
      const reason = 'Additional charges';
      const adjustmentAmount = 100;

      const mockOriginalInvoice = {
        id: 'invoice1',
        invoice_number: 'INV202302-1234',
        total_amount: 1180,
        status: 'paid',
      };

      const mockDebitNote = {
        id: 'debitnote1',
        original_invoice_id: 'invoice1',
        debit_note_number: 'DBN202302-1234',
        reason: 'Additional charges',
        adjustment_amount: 100,
        issued_at: new Date().toISOString(),
        status: 'issued',
      };

      // Mock the original invoice query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockOriginalInvoice, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the debit note insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockDebitNote, error: null }),
            })),
          })),
        })),
      } as any);

      const result = await service.generateDebitNote(invoiceId, reason, adjustmentAmount);

      expect(result).toEqual(mockDebitNote);
    });
  });

  describe('getInvoicesByCustomer', () => {
    it('should return invoices for a specific customer', async () => {
      const customerId = 'customer1';

      const mockInvoices = [
        {
          id: 'invoice1',
          invoice_number: 'INV202302-1234',
          total_amount: 1180,
          status: 'paid',
          order: {
            order_number: 'ORD123456789-1234',
            total_amount: 1000,
            status: 'delivered',
          },
          items: [
            {
              id: 'item1',
              product_variant: {
                name: 'Neem Oil 1500ppm',
                sku: 'NEEM-OIL-1500',
              }
            }
          ]
        }
      ];

      // Mock the invoices query
      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockInvoices,
                error: null,
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getInvoicesByCustomer(customerId);

      expect(result).toEqual(mockInvoices);
    });
  });

  describe('getInvoicesByDateRange', () => {
    it('should return invoices within a date range', async () => {
      const startDate = '2023-01-01';
      const endDate = '2023-02-28';

      const mockInvoices = [
        {
          id: 'invoice1',
          invoice_number: 'INV202302-1234',
          total_amount: 1180,
          issued_at: '2023-02-15T10:30:00.000Z',
          order: {
            order_number: 'ORD123456789-1234',
            total_amount: 1000,
            user_id: 'customer1',
          },
          user: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
          }
        }
      ];

      // Mock the invoices query
      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                order: jest.fn(() => ({
                  data: mockInvoices,
                  error: null,
                })),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getInvoicesByDateRange(startDate, endDate);

      expect(result).toEqual(mockInvoices);
    });
  });
});