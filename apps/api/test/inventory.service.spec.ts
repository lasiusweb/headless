import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    getClient: jest.fn(() => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { 
                id: 'inv-1', 
                variant_id: 'variant-1', 
                warehouse_id: 'warehouse-1', 
                stock_level: 100,
                available_quantity: 80,
                reserved_quantity: 20
              }, 
              error: null 
            })),
            limit: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ 
                data: { 
                  id: 'inv-1', 
                  variant_id: 'variant-1', 
                  warehouse_id: 'warehouse-1', 
                  stock_level: 100,
                  available_quantity: 80,
                  reserved_quantity: 20
                }, 
                error: null 
              })),
            })),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ 
                data: { 
                  id: 'inv-1', 
                  variant_id: 'variant-1', 
                  warehouse_id: 'warehouse-1', 
                  stock_level: 100,
                  available_quantity: 100,
                  reserved_quantity: 0
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
                    id: 'inv-1', 
                    variant_id: 'variant-1', 
                    warehouse_id: 'warehouse-1', 
                    stock_level: 150,
                    available_quantity: 150,
                    reserved_quantity: 0
                  }, 
                  error: null 
                })),
              })),
            })),
          })),
          delete: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { id: 'inv-1' }, error: null })),
            })),
          })),
        })),
      })),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get inventory by variant and warehouse', async () => {
    const result = await service.findByVariantAndWarehouse('variant-1', 'warehouse-1');
    expect(result).toEqual({
      id: 'inv-1',
      variant_id: 'variant-1',
      warehouse_id: 'warehouse-1',
      stock_level: 100,
      available_quantity: 80,
      reserved_quantity: 20
    });
  });

  it('should create new inventory record', async () => {
    const createInventoryDto = {
      variantId: 'variant-1',
      warehouseId: 'warehouse-1',
      stockLevel: 100,
      reservedQuantity: 0,
    };

    const result = await service.create(createInventoryDto);
    expect(result).toEqual({
      id: 'inv-1',
      variant_id: 'variant-1',
      warehouse_id: 'warehouse-1',
      stock_level: 100,
      available_quantity: 100,
      reserved_quantity: 0
    });
  });

  it('should update inventory stock level', async () => {
    const updateInventoryDto = {
      stockLevel: 150,
      reservedQuantity: 0,
    };

    const result = await service.update('inv-1', updateInventoryDto);
    expect(result).toEqual({
      id: 'inv-1',
      variant_id: 'variant-1',
      warehouse_id: 'warehouse-1',
      stock_level: 150,
      available_quantity: 150,
      reserved_quantity: 0
    });
  });

  it('should allocate stock for an order', async () => {
    const result = await service.allocateStock('variant-1', 'warehouse-1', 10);
    expect(result).toEqual({
      success: true,
      message: 'Stock allocated successfully',
      newAvailableQuantity: 70, // 80 available - 10 allocated
      allocatedQuantity: 10,
    });
  });

  it('should deallocate stock when order is cancelled', async () => {
    const result = await service.deallocateStock('variant-1', 'warehouse-1', 10);
    expect(result).toEqual({
      success: true,
      message: 'Stock deallocated successfully',
      newAvailableQuantity: 90, // 80 available + 10 deallocated
      deallocatedQuantity: 10,
    });
  });

  it('should check if sufficient stock is available', async () => {
    const result = await service.hasSufficientStock('variant-1', 'warehouse-1', 50);
    expect(result).toBe(true); // 80 available >= 50 requested
  });

  it('should return false if insufficient stock is available', async () => {
    const result = await service.hasSufficientStock('variant-1', 'warehouse-1', 100);
    expect(result).toBe(false); // 80 available < 100 requested
  });
});