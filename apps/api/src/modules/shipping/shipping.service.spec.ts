import { Test, TestingModule } from '@nestjs/testing';
import { ShippingService } from './shipping.service';
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

describe('ShippingService', () => {
  let service: ShippingService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a shipment successfully', async () => {
      const createShipmentDto = {
        orderId: 'order1',
        carrierId: 'carrier1',
        awbNumber: 'AWB123456789',
        lrNumber: 'LR987654321',
        trackingUrl: 'https://example.com/track/AWB123456789',
        status: 'pending' as const,
      };

      const mockOrder = {
        id: 'order1',
        order_number: 'ORD123456789-1234',
        status: 'confirmed',
        shipping_address: {
          id: 'addr1',
          address_line1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        items: [
          {
            id: 'item1',
            variant_id: 'variant1',
            quantity: 2,
            total_price: 2000,
            variant: {
              id: 'variant1',
              product: {
                name: 'Neem Oil 1500ppm',
                weight: 1.0, // 1kg
                dimensions: '10x10x10',
              }
            }
          }
        ],
      };

      const mockShipment = {
        id: 'shipment1',
        order_id: 'order1',
        carrier_id: 'carrier1',
        awb_number: 'AWB123456789',
        lr_number: 'LR987654321',
        tracking_url: 'https://example.com/track/AWB123456789',
        status: 'pending',
        total_weight: 2.0, // 2 items * 1kg each
        total_value: 2000,
        shipping_address: mockOrder.shipping_address,
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

      // Mock the shipment insertion
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockShipment, error: null }),
            })),
          })),
        })),
      } as any);

      // Mock the shipment items insertion
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
                single: jest.fn().mockResolvedValue({ data: { ...mockOrder, status: 'shipped' }, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the shipment items query for inventory update
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              data: [{ id: 'item1', product_variant_id: 'variant1', quantity: 2 }],
              error: null,
            })),
          })),
        })),
      } as any);

      const result = await service.create(createShipmentDto);

      expect(result).toEqual(mockShipment);
    });

    it('should throw an error if order is not found', async () => {
      const createShipmentDto = {
        orderId: 'nonexistent-order',
        carrierId: 'carrier1',
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

      await expect(service.create(createShipmentDto)).rejects.toThrow('Order not found: Order not found');
    });

    it('should throw an error if order is not ready for shipping', async () => {
      const createShipmentDto = {
        orderId: 'order1',
        carrierId: 'carrier1',
      };

      const mockOrder = {
        id: 'order1',
        order_number: 'ORD123456789-1234',
        status: 'awaiting_approval', // Not ready for shipping
        shipping_address: {},
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

      await expect(service.create(createShipmentDto)).rejects.toThrow('Order is not ready for shipping');
    });
  });

  describe('updateStatus', () => {
    it('should update shipment status successfully', async () => {
      const shipmentId = 'shipment1';
      const status = 'in_transit';

      const mockShipment = {
        id: shipmentId,
        order_id: 'order1',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock the shipment update
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: { ...mockShipment, status }, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the shipment query for order ID retrieval
      jest.spyOn(supabaseService, 'getClient').mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockShipment, error: null }),
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
                single: jest.fn().mockResolvedValue({ data: { id: 'order1', status: 'shipped' }, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.updateStatus(shipmentId, status);

      expect(result).toEqual({ ...mockShipment, status });
    });

    it('should throw an error for invalid status', async () => {
      await expect(service.updateStatus('shipment1', 'invalid_status')).rejects.toThrow('Invalid shipment status');
    });
  });

  describe('getTrackingInfo', () => {
    it('should return tracking info for Delhivery', async () => {
      const awbNumber = '1234567890';
      const carrierCode = 'delhivery';

      const result = await service.getTrackingInfo(awbNumber, carrierCode);

      expect(result).toEqual({
        awb: awbNumber,
        status: 'in_transit',
        origin: 'Mumbai',
        destination: 'Bangalore',
        currentLocation: 'Pune',
        estimatedDelivery: expect.any(String), // ISO date string
        events: expect.arrayContaining([
          expect.objectContaining({
            status: 'picked_up',
            location: 'Mumbai',
          }),
          expect.objectContaining({
            status: 'in_transit',
            location: 'Pune',
          }),
        ]),
      });
    });

    it('should return tracking info for VRL', async () => {
      const awbNumber = '0987654321';
      const carrierCode = 'vrl';

      const result = await service.getTrackingInfo(awbNumber, carrierCode);

      expect(result).toEqual({
        awb: awbNumber,
        status: 'out_for_delivery',
        origin: 'Chennai',
        destination: 'Hyderabad',
        currentLocation: 'Hyderabad',
        estimatedDelivery: expect.any(String), // ISO date string
        events: expect.arrayContaining([
          expect.objectContaining({
            status: 'picked_up',
            location: 'Chennai',
          }),
          expect.objectContaining({
            status: 'out_for_delivery',
            location: 'Hyderabad',
          }),
        ]),
      });
    });

    it('should throw an error for unsupported carrier', async () => {
      await expect(service.getTrackingInfo('1234567890', 'unsupported_carrier')).rejects.toThrow('Unsupported carrier: unsupported_carrier');
    });
  });

  describe('createBulkShipments', () => {
    it('should create multiple shipments successfully', async () => {
      const shipmentsData = [
        {
          orderId: 'order1',
          carrierId: 'carrier1',
          awbNumber: 'AWB1',
        },
        {
          orderId: 'order2',
          carrierId: 'carrier2',
          awbNumber: 'AWB2',
        },
      ];

      // Mock successful creation for both shipments
      jest.spyOn(service, 'create').mockImplementation(async (dto) => {
        return {
          id: `shipment-${dto.orderId}`,
          ...dto,
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        };
      });

      const result = await service.createBulkShipments(shipmentsData);

      expect(result).toEqual([
        { success: true, data: { id: 'shipment-order1', orderId: 'order1', status: 'pending' } },
        { success: true, data: { id: 'shipment-order2', orderId: 'order2', status: 'pending' } },
      ]);
    });
  });
});