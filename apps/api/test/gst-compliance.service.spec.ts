import { Test, TestingModule } from '@nestjs/testing';
import { GstComplianceService } from '../src/modules/gst-compliance/gst-compliance.service';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('GstComplianceService', () => {
  let service: GstComplianceService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    getClient: jest.fn(() => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: 'order-1', 
                order_number: 'ORD001', 
                total_amount: 1180, // Includes 18% GST
                shipping_address: { state: 'Maharashtra' },
                billing_address: { state: 'Maharashtra' },
                items: [
                  { 
                    id: 'item-1', 
                    variant_id: 'variant-1', 
                    quantity: 1, 
                    unit_price: 1000,
                    total_price: 1000
                  }
                ]
              }, 
              error: null 
            })),
            limit: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ 
                data: { 
                  id: 'order-1', 
                  order_number: 'ORD001', 
                  total_amount: 1180, 
                  shipping_address: { state: 'Maharashtra' },
                  billing_address: { state: 'Maharashtra' },
                  items: [
                    { 
                      id: 'item-1', 
                      variant_id: 'variant-1', 
                      quantity: 1, 
                      unit_price: 1000,
                      total_price: 1000
                    }
                  ]
                }, 
                error: null 
              })),
            })),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ 
                data: { 
                  id: 'invoice-1', 
                  order_id: 'order-1', 
                  invoice_number: 'INV202310-0001',
                  cgst_amount: 90,
                  sgst_amount: 90,
                  igst_amount: 0,
                  total_gst_amount: 180,
                  total_amount: 1180,
                  status: 'generated'
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
                    id: 'invoice-1', 
                    order_id: 'order-1', 
                    invoice_number: 'INV202310-0001',
                    cgst_amount: 90,
                    sgst_amount: 90,
                    igst_amount: 0,
                    total_gst_amount: 180,
                    total_amount: 1180,
                    status: 'generated'
                  }, 
                  error: null 
                })),
              })),
            })),
          })),
          delete: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { id: 'invoice-1' }, error: null })),
            })),
          })),
        })),
      })),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GstComplianceService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<GstComplianceService>(GstComplianceService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate GST for intra-state transaction', async () => {
    const result = await service.calculateGstForOrder('order-1');
    
    // For intra-state (same state), GST should be split as CGST + SGST
    expect(result.isInterState).toBe(false);
    expect(result.cgstAmount).toBeGreaterThan(0);
    expect(result.sgstAmount).toBeGreaterThan(0);
    expect(result.igstAmount).toBe(0);
    expect(result.totalGstAmount).toBeGreaterThan(0);
  });

  it('should calculate GST for inter-state transaction', async () => {
    // Mock an inter-state order
    jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: 'order-2', 
                order_number: 'ORD002', 
                total_amount: 1180,
                shipping_address: { state: 'Karnataka' },
                billing_address: { state: 'Maharashtra' }, // Different state
                items: [
                  { 
                    id: 'item-1', 
                    variant_id: 'variant-1', 
                    quantity: 1, 
                    unit_price: 1000,
                    total_price: 1000
                  }
                ]
              }, 
              error: null 
            })),
          })),
        })),
      })),
    } as any);

    const result = await service.calculateGstForOrder('order-2');
    
    // For inter-state (different states), GST should be IGST
    expect(result.isInterState).toBe(true);
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
    expect(result.igstAmount).toBeGreaterThan(0);
    expect(result.totalGstAmount).toBeGreaterThan(0);
  });

  it('should generate GST-compliant invoice', async () => {
    const result = await service.generateGstInvoice('order-1');
    
    expect(result.invoiceNumber).toMatch(/^INV\d{6}-[A-Z0-9]+$/);
    expect(result.taxSummary.cgstAmount).toBeGreaterThan(0);
    expect(result.taxSummary.sgstAmount).toBeGreaterThan(0);
    expect(result.taxSummary.igstAmount).toBe(0);
    expect(result.taxSummary.totalGstAmount).toBeGreaterThan(0);
  });

  it('should generate GSTR-1 report', async () => {
    const result = await service.generateGstr1Report(10, 2023); // October 2023
    
    expect(result).toHaveProperty('period');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('b2bInvoices');
    expect(result).toHaveProperty('b2clInvoices');
    expect(result).toHaveProperty('b2csInvoices');
    expect(result).toHaveProperty('nilRatedInvoices');
  });

  it('should validate GST number format', async () => {
    // Valid GST number format: 22AAAAA0000A1Z5
    const validGstNumber = '27AAAAA0000A1Z5';
    const invalidGstNumber = 'invalid-gst';
    
    const validResult = await service.validateGstNumber(validGstNumber);
    const invalidResult = await service.validateGstNumber(invalidGstNumber);
    
    expect(validResult).toBe(true);
    expect(invalidResult).toBe(false);
  });

  it('should get GST reports with filters', async () => {
    const filters = {
      startDate: '2023-10-01',
      endDate: '2023-10-31',
    };
    
    const result = await service.getGstReports(filters);
    
    expect(result).toHaveProperty('period');
    expect(result).toHaveProperty('totalInvoices');
    expect(result).toHaveProperty('taxableAmount');
    expect(result).toHaveProperty('cgstAmount');
    expect(result).toHaveProperty('sgstAmount');
    expect(result).toHaveProperty('igstAmount');
    expect(result).toHaveProperty('totalGstAmount');
    expect(result).toHaveProperty('totalAmount');
  });
});