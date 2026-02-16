import { Test, TestingModule } from '@nestjs/testing';
import { ZohoIntegrationService } from './zoho-integration.service';
import { SupabaseService } from '../../supabase/supabase.service';
import axios from 'axios';

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

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ZohoIntegrationService', () => {
  let service: ZohoIntegrationService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZohoIntegrationService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<ZohoIntegrationService>(ZohoIntegrationService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAccessToken', () => {
    it('should return the access token', async () => {
      process.env.ZOHO_ACCESS_TOKEN = 'test-token';

      const token = await service.getAccessToken();

      expect(token).toBe('test-token');
    });

    it('should throw an error if access token is not set', async () => {
      delete process.env.ZOHO_ACCESS_TOKEN;

      await expect(service.getAccessToken()).rejects.toThrow('ZOHO_ACCESS_TOKEN environment variable is not set');
    });
  });

  describe('syncOrderToZoho', () => {
    it('should sync an order to Zoho successfully', async () => {
      const orderId = 'order1';

      const mockOrder = {
        id: 'order1',
        order_number: 'ORD123456789-1234',
        total_amount: 1000,
        user: {
          id: 'user1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '9876543210',
          business_address: 'Mumbai, Maharashtra'
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
                id: 'product1',
                name: 'Neem Oil 1500ppm',
                hsn_code: '380890'
              }
            }
          }
        ],
        shipping_address: {
          id: 'addr1',
          address_line1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        billing_address: {
          id: 'addr1',
          address_line1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        }
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

      // Mock the invoice update
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: { ...mockOrder, status: 'synced' }, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the sync operation logging
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: {}, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the Zoho API call
      mockedAxios.post.mockResolvedValue({
        data: {
          invoice: {
            invoice_id: 'zoho-inv-12345'
          }
        }
      });

      // Mock the access token
      jest.spyOn(service, 'getAccessToken').mockResolvedValue('test-token');

      const result = await service.syncOrderToZoho(orderId);

      expect(result).toEqual({
        success: true,
        message: 'Order synced to Zoho successfully',
        zohoInvoiceId: 'zoho-inv-12345',
        orderId: mockOrder.id,
        orderNumber: mockOrder.order_number,
      });
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

      await expect(service.syncOrderToZoho(orderId)).rejects.toThrow('Order not found: Order not found');
    });
  });

  describe('syncProductToZoho', () => {
    it('should sync a product to Zoho successfully', async () => {
      const productId = 'product1';

      const mockProduct = {
        id: 'product1',
        name: 'Neem Oil 1500ppm',
        description: 'High quality neem oil with 1500ppm concentration',
        hsn_code: '380890',
        sku: 'NEEM-OIL-1500',
        mrp: 500,
        is_active: true,
        category: {
          name: 'Pesticides'
        }
      };

      // Mock the product query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockProduct, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the sync operation logging
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: {}, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the Zoho API call
      mockedAxios.post.mockResolvedValue({
        data: {
          item: {
            item_id: 'zoho-item-12345'
          }
        }
      });

      // Mock the access token
      jest.spyOn(service, 'getAccessToken').mockResolvedValue('test-token');

      const result = await service.syncProductToZoho(productId);

      expect(result).toEqual({
        success: true,
        message: 'Product synced to Zoho successfully',
        zohoProductId: 'zoho-item-12345',
        productId: mockProduct.id,
        productName: mockProduct.name,
      });
    });

    it('should throw an error if product is not found', async () => {
      const productId = 'nonexistent-product';

      // Mock the product query to return an error
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Product not found' } }),
            })),
          })),
        })),
      } as any);

      await expect(service.syncProductToZoho(productId)).rejects.toThrow('Product not found: Product not found');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when Zoho connection is working', async () => {
      // Mock the access token
      jest.spyOn(service, 'getAccessToken').mockResolvedValue('test-token');

      // Mock the Zoho API call
      mockedAxios.get.mockResolvedValue({
        data: {
          organizations: [{
            organization_id: 'org123',
            name: 'Test Organization'
          }]
        }
      });

      const result = await service.healthCheck();

      expect(result).toEqual({
        status: 'healthy',
        details: {
          zohoConnected: true,
          tokenValid: true,
          organizationId: expect.any(String),
          timestamp: expect.any(String),
        }
      });
    });

    it('should return unhealthy status when Zoho connection fails', async () => {
      // Mock the access token
      jest.spyOn(service, 'getAccessToken').mockResolvedValue('test-token');

      // Mock the Zoho API call to fail
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        details: {
          zohoConnected: false,
          error: 'Network error',
          timestamp: expect.any(String),
        }
      });
    });
  });
});