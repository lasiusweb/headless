import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class InventoryTrackingService {
  private readonly logger = new Logger(InventoryTrackingService.name);

  constructor(private supabaseService: SupabaseService) {}

  async getInventoryLevels(productId?: string, warehouseId?: string) {
    let query = this.supabaseService.getClient()
      .from('inventory')
      .select(`
        *,
        variant:product_variants(name, sku, product:products(name)),
        warehouse:warehouses(name, code)
      `)
      .eq('is_active', true);

    if (productId) {
      query = query.eq('variant.product_id', productId);
    }

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getLowStockItems(threshold: number = 10) {
    const { data, error } = await this.supabaseService.getClient()
      .from('inventory')
      .select(`
        *,
        variant:product_variants(name, sku, product:products(name)),
        warehouse:warehouses(name, code)
      `)
      .lt('available_quantity', threshold)
      .gt('available_quantity', 0)
      .order('available_quantity', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getOutOfStockItems() {
    const { data, error } = await this.supabaseService.getClient()
      .from('inventory')
      .select(`
        *,
        variant:product_variants(name, sku, product:products(name)),
        warehouse:warehouses(name, code)
      `)
      .eq('available_quantity', 0);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getInventoryMovement(variantId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabaseService.getClient()
      .from('inventory_logs')
      .select(`
        *,
        variant:product_variants(name, sku),
        user:profiles(first_name, last_name)
      `)
      .eq('variant_id', variantId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateInventoryLevel(variantId: string, warehouseId: string, quantityChange: number, reason: string, userId?: string) {
    // Get current inventory level
    const { data: currentInventory, error: inventoryError } = await this.supabaseService.getClient()
      .from('inventory')
      .select('*')
      .eq('variant_id', variantId)
      .eq('warehouse_id', warehouseId)
      .single();

    if (inventoryError && inventoryError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw new Error(inventoryError.message);
    }

    let newStockLevel: number;
    let newReservedQuantity: number;
    let newAvailableQuantity: number;

    if (currentInventory) {
      // Update existing inventory
      newStockLevel = currentInventory.stock_level + quantityChange;
      newReservedQuantity = currentInventory.reserved_quantity;
      newAvailableQuantity = newStockLevel - newReservedQuantity;

      const { error: updateError } = await this.supabaseService.getClient()
        .from('inventory')
        .update({
          stock_level: newStockLevel,
          available_quantity: newAvailableQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentInventory.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      // Create new inventory record if it doesn't exist
      if (quantityChange < 0) {
        throw new Error('Cannot reduce inventory below zero for non-existent inventory');
      }

      newStockLevel = quantityChange;
      newReservedQuantity = 0;
      newAvailableQuantity = newStockLevel;

      const { error: insertError } = await this.supabaseService.getClient()
        .from('inventory')
        .insert([
          {
            variant_id: variantId,
            warehouse_id: warehouseId,
            stock_level: newStockLevel,
            reserved_quantity: newReservedQuantity,
            available_quantity: newAvailableQuantity,
          }
        ]);

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    // Create inventory log entry
    await this.createInventoryLog(
      variantId,
      warehouseId,
      quantityChange,
      newStockLevel,
      reason,
      userId
    );

    return {
      variantId,
      warehouseId,
      previousStockLevel: currentInventory?.stock_level || 0,
      newStockLevel,
      quantityChange,
      reason,
    };
  }

  async transferInventory(fromWarehouseId: string, toWarehouseId: string, variantId: string, quantity: number, reason: string, userId?: string) {
    if (quantity <= 0) {
      throw new Error('Transfer quantity must be greater than 0');
    }

    // Check if enough stock is available in source warehouse
    const { data: sourceInventory, error: sourceError } = await this.supabaseService.getClient()
      .from('inventory')
      .select('*')
      .eq('variant_id', variantId)
      .eq('warehouse_id', fromWarehouseId)
      .single();

    if (sourceError) {
      throw new Error(`Source inventory not found: ${sourceError.message}`);
    }

    if (sourceInventory.available_quantity < quantity) {
      throw new Error(`Insufficient stock in source warehouse. Available: ${sourceInventory.available_quantity}, Requested: ${quantity}`);
    }

    // Reduce stock in source warehouse
    await this.updateInventoryLevel(variantId, fromWarehouseId, -quantity, `Transfer to warehouse ${toWarehouseId}`, userId);

    // Increase stock in destination warehouse
    await this.updateInventoryLevel(variantId, toWarehouseId, quantity, `Transfer from warehouse ${fromWarehouseId}`, userId);

    return {
      variantId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      reason,
      transferredAt: new Date().toISOString(),
    };
  }

  async reserveInventory(variantId: string, warehouseId: string, quantity: number) {
    // Get current inventory
    const { data: inventory, error: inventoryError } = await this.supabaseService.getClient()
      .from('inventory')
      .select('*')
      .eq('variant_id', variantId)
      .eq('warehouse_id', warehouseId)
      .single();

    if (inventoryError) {
      throw new Error(`Inventory not found: ${inventoryError.message}`);
    }

    if (inventory.available_quantity < quantity) {
      throw new Error(`Insufficient available stock. Available: ${inventory.available_quantity}, Requested: ${quantity}`);
    }

    // Update reserved quantity
    const newReservedQuantity = inventory.reserved_quantity + quantity;
    const newAvailableQuantity = inventory.stock_level - newReservedQuantity;

    const { error: updateError } = await this.supabaseService.getClient()
      .from('inventory')
      .update({
        reserved_quantity: newReservedQuantity,
        available_quantity: newAvailableQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventory.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Create inventory log entry
    await this.createInventoryLog(
      variantId,
      warehouseId,
      -quantity, // Negative because it's a reservation
      inventory.stock_level,
      'Reservation',
      null
    );

    return {
      variantId,
      warehouseId,
      quantity,
      reservedAt: new Date().toISOString(),
      availableAfterReservation: newAvailableQuantity,
    };
  }

  async releaseReservation(variantId: string, warehouseId: string, quantity: number) {
    // Get current inventory
    const { data: inventory, error: inventoryError } = await this.supabaseService.getClient()
      .from('inventory')
      .select('*')
      .eq('variant_id', variantId)
      .eq('warehouse_id', warehouseId)
      .single();

    if (inventoryError) {
      throw new Error(`Inventory not found: ${inventoryError.message}`);
    }

    if (inventory.reserved_quantity < quantity) {
      throw new Error(`Cannot release more than reserved. Reserved: ${inventory.reserved_quantity}, Requested: ${quantity}`);
    }

    // Update reserved quantity
    const newReservedQuantity = inventory.reserved_quantity - quantity;
    const newAvailableQuantity = inventory.stock_level - newReservedQuantity;

    const { error: updateError } = await this.supabaseService.getClient()
      .from('inventory')
      .update({
        reserved_quantity: newReservedQuantity,
        available_quantity: newAvailableQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventory.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Create inventory log entry
    await this.createInventoryLog(
      variantId,
      warehouseId,
      quantity, // Positive because it's a release
      inventory.stock_level,
      'Reservation Release',
      null
    );

    return {
      variantId,
      warehouseId,
      quantity,
      releasedAt: new Date().toISOString(),
      availableAfterRelease: newAvailableQuantity,
    };
  }

  async getInventoryReport(filters?: { 
    startDate?: string; 
    endDate?: string; 
    productId?: string; 
    warehouseId?: string 
  }) {
    // This would aggregate inventory movements over time
    // For now, returning a simplified report
    const query = this.supabaseService.getClient()
      .from('inventory_logs')
      .select(`
        *,
        variant:product_variants(name, sku, product:products(name)),
        warehouse:warehouses(name, code)
      `);

    if (filters?.startDate) {
      query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query.lte('created_at', filters.endDate);
    }
    if (filters?.productId) {
      query.eq('variant.product_id', filters.productId);
    }
    if (filters?.warehouseId) {
      query.eq('warehouse_id', filters.warehouseId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Aggregate data for the report
    const report = {
      totalMovements: data.length,
      totalIn: data.filter(log => log.change_quantity > 0).reduce((sum, log) => sum + log.change_quantity, 0),
      totalOut: Math.abs(data.filter(log => log.change_quantity < 0).reduce((sum, log) => sum + log.change_quantity, 0)),
      movements: data,
    };

    return report;
  }

  private async createInventoryLog(
    variantId: string,
    warehouseId: string,
    changeQuantity: number,
    newStockLevel: number,
    reason: string,
    userId?: string
  ) {
    const { error } = await this.supabaseService.getClient()
      .from('inventory_logs')
      .insert([
        {
          variant_id: variantId,
          warehouse_id: warehouseId,
          change_type: changeQuantity > 0 ? 'in' : 'out',
          change_quantity: changeQuantity,
          new_stock_level: newStockLevel,
          reason,
          created_by: userId || null,
        }
      ]);

    if (error) {
      this.logger.error(`Error creating inventory log: ${error.message}`);
      // Don't throw error as it shouldn't affect the main operation
    }
  }
}