import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotificationWsProvider } from './providers/notification-ws.provider';

// Mock the SupabaseService
const mockSupabaseService = {
  getClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {},
            error: null,
          })),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              offset: jest.fn(() => ({
                data: [],
                error: null,
              })),
            })),
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
          single: jest.fn(() => ({
            data: {},
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {},
              error: null,
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          returning: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: {},
                  error: null,
                })),
              })),
            })),
          })),
        })),
      })),
    })),
  })),
};

// Mock the NotificationWsProvider
const mockNotificationWsProvider = {
  sendNotificationToUser: jest.fn(),
};

describe('NotificationService', () => {
  let service: NotificationService;
  let supabaseService: SupabaseService;
  let notificationWsProvider: NotificationWsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: NotificationWsProvider,
          useValue: mockNotificationWsProvider,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    notificationWsProvider = module.get<NotificationWsProvider>(NotificationWsProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new notification successfully', async () => {
      const createNotificationDto = {
        userId: 'user123',
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'general',
        priority: 'medium',
        data: { orderId: 'order123' },
      };

      const mockUser = {
        id: 'user123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const mockOrder = {
        id: 'order123',
        order_number: 'ORD-12345',
        total_amount: 1000,
        user_id: 'user123',
        payment_status: 'pending',
        status: 'pending',
      };

      const mockNotification = {
        id: 'notif123',
        user_id: 'user123',
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'general',
        priority: 'medium',
        status: 'initiated',
        data: { orderId: 'order123' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

      // Mock the notification insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockNotification, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock sending notification through channels
      jest.spyOn(service as any, 'sendMultiChannelNotification').mockResolvedValue(undefined);

      const result = await service.create(createNotificationDto);

      expect(result).toEqual(mockNotification);
      expect(notificationWsProvider.sendNotificationToUser).toHaveBeenCalledWith(
        mockNotification.user_id,
        expect.objectContaining({
          id: mockNotification.id,
          title: mockNotification.title,
          message: mockNotification.message,
        })
      );
    });

    it('should throw an error if order is not found', async () => {
      const createNotificationDto = {
        userId: 'user123',
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'order_update',
        priority: 'high',
        data: { orderId: 'nonexistent-order' },
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

      await expect(service.create(createNotificationDto)).rejects.toThrow('Order not found: Order not found');
    });
  });

  describe('sendOrderStatusUpdate', () => {
    it('should send an order status update notification', async () => {
      const orderId = 'order123';
      const newStatus = 'shipped';
      const userId = 'user123';

      const mockOrder = {
        id: orderId,
        order_number: 'ORD-12345',
        total_amount: 1000,
        user_id: userId,
        status: 'processing',
        payment_status: 'paid',
      };

      const mockUser = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        role: 'customer',
        notification_preferences: {
          email: true,
          sms: false,
          push: true,
          in_app: true,
        },
      };

      const mockNotification = {
        id: 'notif123',
        user_id: userId,
        title: 'Order Status Update',
        message: 'Your order #ORD-12345 has been updated to shipped',
        type: 'order_update',
        priority: 'medium',
        status: 'initiated',
        data: {
          orderId,
          orderNumber: 'ORD-12345',
          newStatus,
          totalAmount: 1000,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

      // Mock the notification insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockNotification, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock sending notification through channels
      jest.spyOn(service as any, 'sendMultiChannelNotification').mockResolvedValue(undefined);

      const result = await service.sendOrderStatusUpdate(orderId, newStatus, userId);

      expect(result).toEqual(mockNotification);
      expect(notificationWsProvider.sendNotificationToUser).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          id: mockNotification.id,
          title: mockNotification.title,
          message: mockNotification.message,
        })
      );
    });
  });

  describe('sendInventoryAlert', () => {
    it('should send an inventory alert notification to relevant users', async () => {
      const variantId = 'variant123';
      const newStockLevel = 5;

      const mockVariant = {
        id: variantId,
        name: 'Neem Oil 1500ppm',
        sku: 'NEEM-OIL-1500',
        product: {
          id: 'prod123',
          name: 'Neem Oil',
          slug: 'neem-oil'
        }
      };

      const mockUsers = [
        {
          id: 'admin123',
          role: 'admin',
          notification_preferences: {
            email: true,
            sms: true,
            push: true,
            in_app: true,
          },
        },
        {
          id: 'manager456',
          role: 'manager',
          notification_preferences: {
            email: true,
            sms: false,
            push: true,
            in_app: true,
          },
        }
      ];

      const mockNotifications = [
        {
          id: 'notif1',
          user_id: 'admin123',
          title: 'Low Stock Alert',
          message: 'Inventory for Neem Oil (Neem Oil 1500ppm) is now 5 units',
          type: 'inventory_alert',
          priority: 'high',
          status: 'initiated',
          created_at: new Date().toISOString(),
        },
        {
          id: 'notif2',
          user_id: 'manager456',
          title: 'Low Stock Alert',
          message: 'Inventory for Neem Oil (Neem Oil 1500ppm) is now 5 units',
          type: 'inventory_alert',
          priority: 'high',
          status: 'initiated',
          created_at: new Date().toISOString(),
        }
      ];

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

      // Mock the users query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              data: mockUsers,
              error: null,
            })),
          })),
        })),
      } as any);

      // Mock the notification insertions
      jest.spyOn(supabaseService, 'getClient')
        .mockImplementationOnce(() => ({
          from: jest.fn(() => ({
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: mockNotifications[0], error: null }),
              })),
            })),
          })),
        } as any))
        .mockImplementationOnce(() => ({
          from: jest.fn(() => ({
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: mockNotifications[1], error: null }),
              })),
            })),
          })),
        } as any));

      // Mock sending notification through channels
      jest.spyOn(service as any, 'sendMultiChannelNotification').mockResolvedValue(undefined);

      const result = await service.sendInventoryAlert(variantId, newStockLevel);

      expect(result).toEqual(mockNotifications);
    });
  });

  describe('processPartialPayment', () => {
    it('should process a partial payment notification', async () => {
      const orderId = 'order123';
      const userId = 'user123';
      const amount = 500;

      const mockOrder = {
        id: orderId,
        order_number: 'ORD-12345',
        total_amount: 1000,
        user_id: userId,
        payment_status: 'partial',
        status: 'processing',
      };

      const mockPayment = {
        id: 'payment123',
        order_id: orderId,
        amount: amount,
        currency: 'INR',
        payment_method: 'partial_payment',
        transaction_id: `PARTIAL_TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'initiated',
        created_by: userId,
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

      // Mock sending notification through channels
      jest.spyOn(service as any, 'sendMultiChannelNotification').mockResolvedValue(undefined);

      const result = await service.processPartialPayment(orderId, userId, amount);

      expect(result).toEqual(expect.objectContaining({
        success: true,
        message: 'Partial payment initiated successfully',
        paymentId: mockPayment.id,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: amount,
        currency: 'INR',
        isPartial: true,
      }));
    });
  });

  describe('getDealerPerformanceReport', () => {
    it('should return dealer performance report', async () => {
      const filters = {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        endDate: new Date().toISOString(),
        dealerId: 'dealer123',
      };

      const mockOrders = [
        {
          id: 'order1',
          order_number: 'ORD-12345',
          total_amount: 1000,
          user_id: 'dealer123',
          status: 'delivered',
          created_at: new Date().toISOString(),
          user: {
            id: 'dealer123',
            first_name: 'Jane',
            last_name: 'Doe',
            role: 'dealer',
          },
          items: [
            {
              id: 'item1',
              variant: {
                name: 'Neem Oil 1500ppm',
              },
              quantity: 2,
              unit_price: 500,
            }
          ]
        }
      ];

      // Mock the orders query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  in: jest.fn(() => ({
                    data: mockOrders,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getDealerPerformanceReport(filters);

      expect(result).toEqual({
        dealerPerformance: expect.arrayContaining([
          expect.objectContaining({
            dealerId: 'dealer123',
            dealerName: 'Jane Doe',
            totalOrders: 1,
            totalRevenue: 1000,
            totalCommission: 100, // 10% of 1000
          })
        ]),
        period: {
          start: filters.startDate,
          end: filters.endDate
        }
      });
    });
  });

  describe('getDistributorPerformanceReport', () => {
    it('should return distributor performance report', async () => {
      const filters = {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        endDate: new Date().toISOString(),
        distributorId: 'dist123',
      };

      const mockOrders = [
        {
          id: 'order1',
          order_number: 'ORD-12345',
          total_amount: 2000,
          user_id: 'dist123',
          status: 'delivered',
          created_at: new Date().toISOString(),
          user: {
            id: 'dist123',
            first_name: 'Bob',
            last_name: 'Smith',
            role: 'distributor',
          },
          items: [
            {
              id: 'item1',
              variant: {
                name: 'Bio Fertilizer 1Kg',
              },
              quantity: 4,
              unit_price: 500,
            }
          ]
        }
      ];

      // Mock the orders query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  in: jest.fn(() => ({
                    data: mockOrders,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getDistributorPerformanceReport(filters);

      expect(result).toEqual({
        distributorPerformance: expect.arrayContaining([
          expect.objectContaining({
            distributorId: 'dist123',
            distributorName: 'Bob Smith',
            totalOrders: 1,
            totalRevenue: 2000,
            totalCommission: 300, // 15% of 2000
          })
        ]),
        period: {
          start: filters.startDate,
          end: filters.endDate
        }
      });
    });
  });

  describe('getCustomerLifetimeValueReport', () => {
    it('should return customer lifetime value report', async () => {
      const filters = {
        startDate: new Date(new Date().setDate(new Date().getDate() - 365)).toISOString(), // Last year
        endDate: new Date().toISOString(),
        customerId: 'cust123',
      };

      const mockOrders = [
        {
          id: 'order1',
          order_number: 'ORD-12345',
          total_amount: 1500,
          user_id: 'cust123',
          status: 'delivered',
          created_at: new Date(new Date().setDate(new Date().getDate() - 100)).toISOString(),
          user: {
            id: 'cust123',
            first_name: 'Alice',
            last_name: 'Johnson',
            email: 'alice@example.com',
            role: 'customer',
          }
        },
        {
          id: 'order2',
          order_number: 'ORD-12346',
          total_amount: 2500,
          user_id: 'cust123',
          status: 'delivered',
          created_at: new Date(new Date().setDate(new Date().getDate() - 50)).toISOString(),
          user: {
            id: 'cust123',
            first_name: 'Alice',
            last_name: 'Johnson',
            email: 'alice@example.com',
            role: 'customer',
          }
        }
      ];

      // Mock the orders query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  in: jest.fn(() => ({
                    data: mockOrders,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getCustomerLifetimeValueReport(filters);

      expect(result).toEqual({
        customerData: expect.arrayContaining([
          expect.objectContaining({
            customerId: 'cust123',
            customerName: 'Alice Johnson',
            totalOrders: 2,
            totalSpent: 4000, // 1500 + 2500
            avgOrderValue: 2000, // 4000 / 2
          })
        ]),
        period: {
          start: filters.startDate,
          end: filters.endDate
        }
      });
    });
  });
});