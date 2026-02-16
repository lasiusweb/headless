import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
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
        gt: jest.fn(() => ({
          order: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      rpc: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const filters = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      };

      const mockRevenueData = [{ total_revenue: 10000 }];
      const mockOrderData = [{ total_orders: 50 }];
      const mockUserData = [{ total_users: 200 }];
      const mockProductData = [
        { product_id: 'prod1', product_name: 'Neem Oil', total_sold: 100 },
        { product_id: 'prod2', product_name: 'Bio Fertilizer', total_sold: 80 },
      ];

      // Mock the RPC calls for metrics
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        rpc: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: mockRevenueData, error: null }),
        })),
      } as any);

      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        rpc: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: mockOrderData, error: null }),
        })),
      } as any);

      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        rpc: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: mockUserData, error: null }),
        })),
      } as any);

      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        rpc: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: mockProductData, error: null }),
        })),
      } as any);

      // Mock the forecasted metrics
      jest.spyOn(service, 'getForecastedMetrics').mockResolvedValue({
        revenue: 12000,
        orders: 60,
        confidence: 85,
        forecastPeriods: 3,
        period: {
          start: '2023-02-01',
          end: '2023-05-01'
        }
      });

      const result = await service.getDashboardMetrics(filters);

      expect(result).toEqual({
        revenue: mockRevenueData[0],
        orders: mockOrderData[0],
        users: mockUserData[0],
        topProducts: mockProductData,
        forecast: {
          revenue: 12000,
          orders: 60,
          confidence: 85,
          forecastPeriods: 3,
          period: {
            start: '2023-02-01',
            end: '2023-05-01'
          }
        },
        period: {
          start: filters.startDate,
          end: filters.endDate
        }
      });
    });
  });

  describe('getSalesReport', () => {
    it('should return sales report grouped by day', async () => {
      const filters = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        groupBy: 'day' as const,
      };

      const mockOrders = [
        {
          created_at: '2023-01-01T10:00:00Z',
          total_amount: 1000,
          status: 'delivered',
          user: { role: 'customer' },
        },
        {
          created_at: '2023-01-01T15:00:00Z',
          total_amount: 1500,
          status: 'delivered',
          user: { role: 'dealer' },
        },
      ];

      // Mock the orders query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                in: jest.fn(() => ({
                  order: jest.fn(() => ({
                    data: mockOrders,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getSalesReport(filters);

      expect(result).toEqual({
        salesData: expect.arrayContaining([
          expect.objectContaining({
            date: '2023-01-01',
            totalSales: 2500, // 1000 + 1500
            orderCount: 2,
            avgOrderValue: 1250, // 2500 / 2
          })
        ]),
        seasonalTrends: expect.any(Array),
        period: {
          start: filters.startDate,
          end: filters.endDate
        },
        groupBy: filters.groupBy
      });
    });
  });

  describe('getProductPerformanceReport', () => {
    it('should return product performance report', async () => {
      const filters = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      };

      const mockOrderItems = [
        {
          variant: {
            id: 'variant1',
            name: 'Neem Oil 1500ppm',
            sku: 'NEEM-OIL-1500',
            product: {
              id: 'prod1',
              name: 'Neem Oil',
              category_id: 'cat1',
            }
          },
          quantity: 2,
          unit_price: 500,
          total_price: 1000,
          order: {
            status: 'delivered',
            created_at: '2023-01-01T10:00:00Z',
          }
        }
      ];

      // Mock the order items query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  data: mockOrderItems,
                  error: null,
                })),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the seasonal performance
      jest.spyOn(service, 'getSeasonalProductPerformance').mockResolvedValue([]);

      const result = await service.getProductPerformanceReport(filters);

      expect(result).toEqual({
        productPerformance: expect.arrayContaining([
          expect.objectContaining({
            productId: 'prod1',
            productName: 'Neem Oil',
            totalQuantitySold: 2,
            totalRevenue: 1000,
            orderCount: 1,
            avgOrderValue: 1000,
            variants: expect.arrayContaining([
              expect.objectContaining({
                variantId: 'variant1',
                variantName: 'Neem Oil 1500ppm',
                sku: 'NEEM-OIL-1500',
                totalQuantitySold: 2,
                totalRevenue: 1000,
                orderCount: 1,
              })
            ])
          })
        ]),
        seasonalPerformance: [],
        period: {
          start: filters.startDate,
          end: filters.endDate
        }
      });
    });
  });

  describe('getDealerPerformanceReport', () => {
    it('should return dealer performance report', async () => {
      const filters = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      };

      const mockOrders = [
        {
          id: 'order1',
          order_number: 'ORD123456789-1234',
          total_amount: 1000,
          created_at: '2023-01-01T10:00:00Z',
          user_id: 'user1',
          user: {
            first_name: 'John',
            last_name: 'Doe',
            role: 'dealer',
            dealer_info: {}
          },
          items: [
            {
              variant: {
                name: 'Neem Oil 1500ppm'
              },
              quantity: 2,
              unit_price: 500
            }
          ],
          status: 'delivered'
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
            dealerId: 'user1',
            dealerName: 'John Doe',
            totalOrders: 1,
            totalRevenue: 1000,
            totalCommission: 100, // 10% of 1000
            avgOrderValue: 1000,
            orderDetails: expect.arrayContaining([
              expect.objectContaining({
                orderId: 'order1',
                orderNumber: 'ORD123456789-1234',
                totalAmount: 1000,
                items: expect.arrayContaining([
                  expect.objectContaining({
                    name: 'Neem Oil 1500ppm',
                    quantity: 2,
                    price: 500
                  })
                ])
              })
            ])
          })
        ]),
        period: {
          start: filters.startDate,
          end: filters.endDate
        }
      });
    });
  });

  describe('getForecastedMetrics', () => {
    it('should return forecasted metrics', async () => {
      const filters = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        forecastPeriods: 3,
      };

      const mockHistoricalData = [
        { created_at: '2022-01-01T00:00:00Z', total_amount: 1000, status: 'delivered' },
        { created_at: '2022-02-01T00:00:00Z', total_amount: 1200, status: 'delivered' },
        { created_at: '2022-03-01T00:00:00Z', total_amount: 1100, status: 'delivered' },
      ];

      // Mock the historical data query
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              in: jest.fn(() => ({
                data: mockHistoricalData,
                error: null,
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getForecastedMetrics(filters);

      expect(result).toEqual({
        revenue: expect.any(Number),
        orders: expect.any(Number),
        confidence: expect.any(Number),
        forecastPeriods: 3,
        period: {
          start: expect.any(String),
          end: expect.any(String)
        }
      });
    });
  });
});