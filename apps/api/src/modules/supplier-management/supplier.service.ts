import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  gst_number?: string;
  pan_number?: string;
  address: any;
  payment_terms: number;
  credit_limit?: number;
  status: 'active' | 'inactive' | 'suspended';
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  items: any[];
  total_amount: number;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  expected_delivery_date: string;
  actual_delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity?: number;
  created_at: string;
}

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name);

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  /**
   * Get all suppliers
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('suppliers')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) {
      this.logger.error(`Error fetching suppliers: ${error.message}`);
      return [];
    }

    return data;
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(`Supplier with ID ${id} not found`);
    }

    return data;
  }

  /**
   * Create supplier
   */
  async createSupplier(supplierData: Partial<Supplier>): Promise<Supplier> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('suppliers')
      .insert([{
        ...supplierData,
        status: supplierData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating supplier: ${error.message}`);
      throw error;
    }

    this.logger.log(`Supplier created: ${data.id} - ${data.name}`);
    return data;
  }

  /**
   * Update supplier
   */
  async updateSupplier(id: string, supplierData: Partial<Supplier>): Promise<Supplier> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('suppliers')
      .update({
        ...supplierData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Supplier with ID ${id} not found`);
    }

    this.logger.log(`Supplier updated: ${id}`);
    return data;
  }

  /**
   * Create purchase order
   */
  async createPurchaseOrder(poData: {
    supplier_id: string;
    items: Array<{
      product_id: string;
      variant_id: string;
      quantity: number;
      unit_price: number;
    }>;
    expected_delivery_date: string;
    notes?: string;
  }): Promise<PurchaseOrder> {
    const client = this.supabaseService.getClient();

    // Generate PO number
    const poNumber = `PO${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Calculate total
    const totalAmount = poData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price),
      0
    );

    // Create PO
    const { data: po, error: poError } = await client
      .from('purchase_orders')
      .insert([{
        po_number: poNumber,
        supplier_id: poData.supplier_id,
        total_amount: totalAmount,
        status: 'pending',
        expected_delivery_date: poData.expected_delivery_date,
        notes: poData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (poError) {
      this.logger.error(`Error creating PO: ${poError.message}`);
      throw poError;
    }

    // Create PO items
    const poItems = poData.items.map(item => ({
      po_id: po.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      created_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await client
      .from('purchase_order_items')
      .insert(poItems);

    if (itemsError) {
      this.logger.error(`Error creating PO items: ${itemsError.message}`);
    }

    this.logger.log(`Purchase order created: ${po.id} - ${poNumber}`);
    return { ...po, items: poItems };
  }

  /**
   * Get purchase orders by supplier
   */
  async getPurchaseOrdersBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('purchase_orders')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Error fetching POs: ${error.message}`);
      return [];
    }

    return data;
  }

  /**
   * Approve purchase order
   */
  async approvePurchaseOrder(poId: string): Promise<PurchaseOrder> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('purchase_orders')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', poId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Purchase order with ID ${poId} not found`);
    }

    this.logger.log(`Purchase order approved: ${poId}`);
    return data;
  }

  /**
   * Mark PO as received
   */
  async receivePurchaseOrder(poId: string, items?: Array<{ id: string; received_quantity: number }>): Promise<PurchaseOrder> {
    const client = this.supabaseService.getClient();

    // Update PO status
    const { data: po, error: poError } = await client
      .from('purchase_orders')
      .update({
        status: 'received',
        actual_delivery_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', poId)
      .select()
      .single();

    if (poError) {
      throw new Error(`Purchase order with ID ${poId} not found`);
    }

    // Update item quantities if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await client
          .from('purchase_order_items')
          .update({
            received_quantity: item.received_quantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);
      }
    }

    // Update inventory
    await this.updateInventoryFromPO(poId);

    this.logger.log(`Purchase order received: ${poId}`);
    return po;
  }

  /**
   * Update inventory from received PO
   */
  private async updateInventoryFromPO(poId: string): Promise<void> {
    const client = this.supabaseService.getClient();

    // Get PO items
    const { data: items } = await client
      .from('purchase_order_items')
      .select('variant_id, received_quantity')
      .eq('po_id', poId);

    if (!items || items.length === 0) {
      return;
    }

    // Update inventory for each item
    for (const item of items) {
      const quantity = item.received_quantity || item.received_quantity === 0 
        ? item.received_quantity 
        : 0;

      // Update or create inventory record
      await client.rpc('upsert_inventory_from_po', {
        p_variant_id: item.variant_id,
        p_quantity: quantity,
      });
    }

    this.logger.log(`Inventory updated from PO ${poId}`);
  }

  /**
   * Get supplier analytics
   */
  async getSupplierAnalytics(supplierId: string): Promise<any> {
    const client = this.supabaseService.getClient();

    // Get total POs
    const { count: totalPOs } = await client
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId);

    // Get total spend
    const { data: pos } = await client
      .from('purchase_orders')
      .select('total_amount')
      .eq('supplier_id', supplierId)
      .eq('status', 'received');

    const totalSpend = pos?.reduce((sum, po) => sum + po.total_amount, 0) || 0;

    // Get average delivery time
    const { data: deliveredPOs } = await client
      .from('purchase_orders')
      .select('expected_delivery_date, actual_delivery_date')
      .eq('supplier_id', supplierId)
      .eq('status', 'received')
      .not('actual_delivery_date', 'is', null);

    let avgDeliveryTime = 0;
    if (deliveredPOs && deliveredPOs.length > 0) {
      const deliveryTimes = deliveredPOs.map(po => {
        const expected = new Date(po.expected_delivery_date).getTime();
        const actual = new Date(po.actual_delivery_date).getTime();
        return Math.ceil((actual - expected) / (1000 * 60 * 60 * 24));
      });
      avgDeliveryTime = deliveryTimes.reduce((sum, t) => sum + t, 0) / deliveryTimes.length;
    }

    return {
      supplier_id: supplierId,
      totalPOs: totalPOs || 0,
      totalSpend,
      avgDeliveryTime: Math.round(avgDeliveryTime),
      onTimeDeliveryRate: deliveredPOs
        ? (deliveredPOs.filter(po => {
            const expected = new Date(po.expected_delivery_date).getTime();
            const actual = new Date(po.actual_delivery_date).getTime();
            return actual <= expected;
          }).length / deliveredPOs.length) * 100
        : 0,
    };
  }

  /**
   * Get low stock products that need reordering
   */
  async getLowStockProducts(): Promise<any[]> {
    const client = this.supabaseService.getClient();
    const { data } = await client
      .from('inventory')
      .select(`
        *,
        variant:product_variants(
          name,
          sku,
          product:products(name)
        )
      `)
      .lt('available_stock', 'reorder_level');

    return data || [];
  }

  /**
   * Auto-create PO for low stock items
   */
  async autoCreatePurchaseOrders(): Promise<PurchaseOrder[]> {
    const lowStockItems = await this.getLowStockProducts();
    
    if (lowStockItems.length === 0) {
      return [];
    }

    // Group by supplier (this would need supplier mapping in real implementation)
    // For now, create a single PO
    const poItems = lowStockItems.map(item => ({
      product_id: item.variant.product_id,
      variant_id: item.variant.id,
      quantity: item.reorder_level * 2, // Order 2x reorder level
      unit_price: 0, // Would need cost price from product
    }));

    // Get default supplier (first active supplier)
    const suppliers = await this.getAllSuppliers();
    if (suppliers.length === 0) {
      this.logger.warn('No suppliers found for auto-PO creation');
      return [];
    }

    const po = await this.createPurchaseOrder({
      supplier_id: suppliers[0].id,
      items: poItems,
      expected_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Auto-generated PO for low stock items',
    });

    return [po];
  }
}
