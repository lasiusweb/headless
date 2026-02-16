import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
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

describe('OrderService', () => {
  let service: OrderService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order with correct status based on user role', async () => {
      const userId = 'user1';
      const createOrderDto = {
        items: [
          {
            variantId: 'variant1',
            quantity: 2,
          }
        ],
        shippingAddressId: 'address1',
        billingAddressId: 'address1',
        shippingCost: 50,
        notes: 'Test order',
      };

      const mockUser = { id: userId, role: 'dealer' };
      const mockVariant = {
        id: 'variant1',
        name: 'Test Variant',
        sku: 'TEST001',
        mrp: 100,
        dealer_price: 80,
        distributor_price: 70,
        product: {
          name: 'Test Product',
          slug: 'test-product'
        }
      };
      const mockOrder = {
        id: 'order1',
        order_number: 'ORD123456789-1234',
        user_id: userId,
        status: 'awaiting_approval', // Should be awaiting approval for dealer
        payment_status: 'pending',
        shipping_address_id: 'address1',
        billing_address_id: 'address1',
        subtotal: 160, // 2 * 80 (dealer price)
        tax_amount: 28.8, // 18% tax
        shipping_cost: 50,
        total_amount: 238.8,
        currency: 'INR',
        notes: 'Test order',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock the user query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the variant query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockVariant, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the order insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the order items insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: {}, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the cart query (no cart found)
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            })),
          })),
        })),
      } as any);

      // Mock the final order query with full details
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: { ...mockOrder, user: mockUser }, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the approval records creation
      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: {}, error: null }),
            })),
          })),
        })),
      } as any);

      const result = await service.create(createOrderDto, userId);

      expect(result).toEqual({ ...mockOrder, user: mockUser });
      expect(result.status).toBe('awaiting_approval');
    });
  });

  describe('submitApproval', () => {
    it('should submit approval and update order status when all approvals are granted', async () => {
      const orderId = 'order1';
      const approverId = 'approver1';
      const approverRole = 'regional_manager';
      const approved = true;

      const mockOrder = {
        id: orderId,
        status: 'awaiting_approval',
      };

      const mockApproval = {
        id: 'approval1',
        order_id: orderId,
        approver_role: approverRole,
        status: 'pending',
      };

      const mockAllApprovals = [
        {
          id: 'approval1',
          order_id: orderId,
          approver_role: approverRole,
          status: 'approved', // This one gets updated
        }
      ];

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

      // Mock the approval query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({ data: mockApproval, error: null }),
                })),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the approval update
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: {}, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the all approvals query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              data: mockAllApprovals,
              error: null,
            })),
          })),
        })),
      } as any);

      // Mock the status update
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: { ...mockOrder, status: 'processing' }, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the inventory reservation
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      } as any);

      const result = await service.submitApproval(orderId, approverId, approverRole, approved);

      expect(result).toEqual({ 
        success: true, 
        orderId, 
        status: 'processing' 
      });
    });

    it('should reject the order if any approval is denied', async () => {
      const orderId = 'order1';
      const approverId = 'approver1';
      const approverRole = 'regional_manager';
      const approved = false; // Denying the approval

      const mockOrder = {
        id: orderId,
        status: 'awaiting_approval',
      };

      const mockApproval = {
        id: 'approval1',
        order_id: orderId,
        approver_role: approverRole,
        status: 'pending',
      };

      const mockAllApprovals = [
        {
          id: 'approval1',
          order_id: orderId,
          approver_role: approverRole,
          status: 'rejected', // This one gets updated to rejected
        },
        {
          id: 'approval2',
          order_id: orderId,
          approver_role: 'sales_head',
          status: 'pending',
        }
      ];

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

      // Mock the approval query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({ data: mockApproval, error: null }),
                })),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the approval update
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: {}, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the all approvals query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              data: mockAllApprovals,
              error: null,
            })),
          })),
        })),
      } as any);

      // Mock the status update (should be rejected)
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: { ...mockOrder, status: 'rejected' }, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.submitApproval(orderId, approverId, approverRole, approved);

      expect(result).toEqual({ 
        success: true, 
        orderId, 
        status: 'rejected' 
      });
    });
  });

  describe('getOrdersRequiringApproval', () => {
    it('should return orders requiring approval for a specific role', async () => {
      const role = 'regional_manager';
      const mockOrders = [
        {
          id: 'order1',
          status: 'awaiting_approval',
          user: { first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'dealer' },
          items: [],
          approvals: [
            { approver_role: 'regional_manager', status: 'pending' }
          ]
        }
      ];

      // Mock the orders query
      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              data: mockOrders,
              error: null,
            })),
          })),
        })),
      } as any);

      const result = await service.getOrdersRequiringApproval(role);

      expect(result).toEqual(mockOrders);
    });
  });
});