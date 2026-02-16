import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotFoundException } from '@nestjs/common';

// Mock the SupabaseService
const mockSupabaseService = {
  getClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          gt: jest.fn(() => ({
            single: jest.fn(),
          })),
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              gt: jest.fn(() => ({
                order: jest.fn(() => ({
                  single: jest.fn(),
                })),
              })),
            })),
          })),
        })),
        gt: jest.fn(() => ({
          order: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            gt: jest.fn(() => ({
              order: jest.fn(() => ({
                single: jest.fn(),
              })),
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

describe('InventoryService', () => {
  let service: InventoryService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new inventory record', async () => {
      const createInventoryDto = {
        variantId: 'var1',
        warehouseId: 'wh1',
        stockLevel: 100,
        reservedQuantity: 10,
        batchNumber: 'BATCH001',
        expiryDate: new Date('2025-12-31'),
        manufacturingDate: new Date('2023-01-01'),
        notes: 'Sample batch',
      };

      const mockCreatedInventory = {
        id: 'inv1',
        variant_id: createInventoryDto.variantId,
        warehouse_id: createInventoryDto.warehouseId,
        stock_level: createInventoryDto.stockLevel,
        reserved_quantity: createInventoryDto.reservedQuantity,
        batch_number: createInventoryDto.batchNumber,
        expiry_date: createInventoryDto.expiryDate,
        manufacturing_date: createInventoryDto.manufacturingDate,
        notes: createInventoryDto.notes,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: mockCreatedInventory, error: null }),
            })),
          })),
        })),
      } as any);

      const result = await service.create(createInventoryDto);
      expect(result).toEqual(mockCreatedInventory);
    });
  });

  describe('update', () => {
    it('should update and return the updated inventory record', async () => {
      const updateInventoryDto = {
        stockLevel: 90,
        reservedQuantity: 15,
        batchNumber: 'BATCH001_UPDATED',
        expiryDate: new Date('2026-12-31'),
        manufacturingDate: new Date('2023-06-01'),
        notes: 'Updated sample batch',
      };

      const mockUpdatedInventory = {
        id: 'inv1',
        variant_id: 'var1',
        warehouse_id: 'wh1',
        stock_level: updateInventoryDto.stockLevel,
        reserved_quantity: updateInventoryDto.reservedQuantity,
        batch_number: updateInventoryDto.batchNumber,
        expiry_date: updateInventoryDto.expiryDate,
        manufacturing_date: updateInventoryDto.manufacturingDate,
        notes: updateInventoryDto.notes,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: mockUpdatedInventory, error: null }),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.update('inv1', updateInventoryDto);
      expect(result).toEqual(mockUpdatedInventory);
    });
  });

  describe('allocateInventory', () => {
    it('should allocate inventory using FIFO logic', async () => {
      const productId = 'prod1';
      const warehouseId = 'wh1';
      const quantity = 50;

      const mockInventoryRecords = [
        {
          id: 'inv1',
          variant: {
            id: 'var1',
            name: 'Product Variant 1',
            sku: 'SKU001',
            product: {
              id: productId,
              name: 'Test Product',
              slug: 'test-product'
            }
          },
          warehouse: {
            name: 'Warehouse 1'
          },
          stock_level: 30,
          reserved_quantity: 5,
          batch_number: 'BATCH001',
          expiry_date: new Date('2024-12-31'),
        },
        {
          id: 'inv2',
          variant: {
            id: 'var2',
            name: 'Product Variant 2',
            sku: 'SKU002',
            product: {
              id: productId,
              name: 'Test Product',
              slug: 'test-product'
            }
          },
          warehouse: {
            name: 'Warehouse 1'
          },
          stock_level: 40,
          reserved_quantity: 10,
          batch_number: 'BATCH002',
          expiry_date: new Date('2025-06-30'),
        }
      ];

      // Mock the select query for inventory records
      const selectMock = {
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            gt: jest.fn(() => ({
              order: jest.fn(() => ({
                single: jest.fn(),
              })),
            })),
          })),
        })),
      };

      // Mock the select query for multiple records (without single)
      const selectMultipleMock = {
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            gt: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockInventoryRecords,
                error: null,
              })),
            })),
          })),
        })),
      };

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn((query) => {
            if (query.includes('single')) {
              return selectMock;
            } else {
              return selectMultipleMock;
            }
          }),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ 
                  data: { ...mockInventoryRecords[0], reserved_quantity: 55 }, 
                  error: null 
                }),
              })),
            })),
          })),
        })),
      } as any);

      // Mock the update call for the second inventory record
      jest.spyOn(supabaseService, 'getClient').mockImplementation(() => ({
        from: jest.fn(() => ({
          select: jest.fn((query) => {
            if (query.includes('single')) {
              return {
                eq: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({ 
                    data: { ...mockInventoryRecords[1], reserved_quantity: 35 }, 
                    error: null 
                  }),
                })),
              };
            } else {
              return selectMultipleMock;
            }
          }),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ 
                  data: { ...mockInventoryRecords[1], reserved_quantity: 35 }, 
                  error: null 
                }),
              })),
            })),
          })),
        })),
      }) as any);

      const result = await service.allocateInventory(productId, warehouseId, quantity);
      
      // Verify that the allocation was done correctly
      expect(result).toHaveLength(2); // Two batches were used
      expect(result[0].allocatedQuantity).toBe(25); // From first batch: 30 - 5 available
      expect(result[1].allocatedQuantity).toBe(25); // From second batch to reach 50 total
    });
  });

  describe('getExpiringInventory', () => {
    it('should return inventory that is expiring soon', async () => {
      const days = 30;
      const mockExpiringInventory = [
        {
          id: 'inv1',
          variant: {
            id: 'var1',
            name: 'Product Variant 1',
            sku: 'SKU001',
            product: {
              id: 'prod1',
              name: 'Test Product',
              slug: 'test-product'
            }
          },
          warehouse: {
            name: 'Warehouse 1'
          },
          stock_level: 30,
          reserved_quantity: 5,
          batch_number: 'BATCH001',
          expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        }
      ];

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      jest.spyOn(supabaseService, 'getClient').mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                gt: jest.fn(() => ({
                  order: jest.fn(() => ({
                    data: mockExpiringInventory,
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        })),
      } as any);

      const result = await service.getExpiringInventory(days);
      expect(result).toEqual(mockExpiringInventory);
    });
  });
});