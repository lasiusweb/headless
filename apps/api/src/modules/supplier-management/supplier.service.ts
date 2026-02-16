import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name);

  constructor(private supabaseService: SupabaseService) {}

  async findAll(filters?: { 
    status?: string; 
    type?: 'manufacturer' | 'distributor' | 'wholesaler' | 'logistics';
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabaseService.getClient()
      .from('suppliers')
      .select(`
        *,
        products:supplier_products(count),
        orders:purchase_orders(count)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,gst_number.ilike.%${filters.search}%`
      );
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('suppliers')
      .select(`
        *,
        products:supplier_products(*, product:products(name, slug)),
        orders:purchase_orders(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Supplier not found');
    }

    return data;
  }

  async create(createSupplierDto: CreateSupplierDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('suppliers')
      .insert([
        {
          name: createSupplierDto.name,
          company_name: createSupplierDto.companyName,
          email: createSupplierDto.email,
          phone: createSupplierDto.phone,
          gst_number: createSupplierDto.gstNumber,
          pan_number: createSupplierDto.panNumber,
          type: createSupplierDto.type,
          address: createSupplierDto.address,
          bank_details: createSupplierDto.bankDetails,
          status: 'pending_verification',
          credit_limit: createSupplierDto.creditLimit || 0,
          payment_terms: createSupplierDto.paymentTerms || 'net_30',
          rating: 0,
          total_orders: 0,
          total_spent: 0,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('suppliers')
      .update({
        ...updateSupplierDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateStatus(id: string, status: string, updatedBy: string) {
    const validStatuses = ['active', 'inactive', 'suspended', 'pending_verification'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('suppliers')
      .update({
        status,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.getClient()
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Supplier deleted successfully' };
  }

  async getSupplierProducts(supplierId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('supplier_products')
      .select(`
        *,
        product:products(name, slug, description),
        variant:product_variants(name, sku)
      `)
      .eq('supplier_id', supplierId);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async addProductToSupplier(supplierId: string, productId: string, variantId: string, cost: number) {
    const { data, error } = await this.supabaseService.getClient()
      .from('supplier_products')
      .insert([
        {
          supplier_id: supplierId,
          product_id: productId,
          variant_id: variantId,
          cost_per_unit: cost,
          is_active: true,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getSupplierOrders(supplierId: string, filters?: { 
    status?: string; 
    startDate?: string; 
    endDate?: string 
  }) {
    let query = this.supabaseService.getClient()
      .from('purchase_orders')
      .select(`
        *,
        items:purchase_order_items(*, variant:product_variants(name, sku))
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createPurchaseOrder(createPurchaseOrderDto: CreatePurchaseOrderDto) {
    // Calculate totals
    let subtotal = 0;
    for (const item of createPurchaseOrderDto.items) {
      subtotal += item.quantity * item.unitCost;
    }

    const taxAmount = subtotal * 0.18; // 18% GST
    const totalAmount = subtotal + taxAmount;

    // Create the purchase order
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('purchase_orders')
      .insert([
        {
          supplier_id: createPurchaseOrderDto.supplierId,
          order_number: `PO${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'pending',
          subtotal: subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          currency: 'INR',
          notes: createPurchaseOrderDto.notes,
          expected_delivery_date: createPurchaseOrderDto.expectedDeliveryDate,
        }
      ])
      .select()
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    // Create order items
    for (const item of createPurchaseOrderDto.items) {
      const { error: itemError } = await this.supabaseService.getClient()
        .from('purchase_order_items')
        .insert([
          {
            order_id: order.id,
            variant_id: item.variantId,
            quantity: item.quantity,
            unit_cost: item.unitCost,
            total_cost: item.quantity * item.unitCost,
          }
        ]);

      if (itemError) {
        throw new Error(itemError.message);
      }
    }

    // Return the complete order with items
    const { data: fullOrder, error: fullOrderError } = await this.supabaseService.getClient()
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(name, company_name, email),
        items:purchase_order_items(*, variant:product_variants(name, sku))
      `)
      .eq('id', order.id)
      .single();

    if (fullOrderError) {
      throw new Error(fullOrderError.message);
    }

    return fullOrder;
  }

  async getSupplierPerformance(supplierId: string, period?: { 
    startDate?: string; 
    endDate?: string 
  }) {
    const startDate = period?.startDate || new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(); // Last 90 days
    const endDate = period?.endDate || new Date().toISOString();

    // Get supplier orders in the period
    const { data: orders, error: ordersError } = await this.supabaseService.getClient()
      .from('purchase_orders')
      .select('*')
      .eq('supplier_id', supplierId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (ordersError) {
      throw new Error(ordersError.message);
    }

    // Calculate performance metrics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const onTimeDeliveryRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Get rating from reviews (if available)
    const { data: reviews, error: reviewsError } = await this.supabaseService.getClient()
      .from('supplier_reviews')
      .select('rating')
      .eq('supplier_id', supplierId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const avgRating = reviews && reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return {
      supplierId,
      period: { startDate, endDate },
      metrics: {
        totalOrders,
        totalSpent,
        completedOrders,
        onTimeDeliveryRate: parseFloat(onTimeDeliveryRate.toFixed(2)),
        avgRating: parseFloat(avgRating.toFixed(2)),
        avgOrderValue: totalOrders > 0 ? parseFloat((totalSpent / totalOrders).toFixed(2)) : 0,
      },
      orders,
    };
  }

  async addSupplierReview(reviewData: {
    supplierId: string;
    userId: string;
    rating: number;
    comment?: string;
  }) {
    const { data, error } = await this.supabaseService.getClient()
      .from('supplier_reviews')
      .insert([
        {
          supplier_id: reviewData.supplierId,
          user_id: reviewData.userId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update supplier's average rating
    await this.updateSupplierRating(reviewData.supplierId);

    return data;
  }

  private async updateSupplierRating(supplierId: string) {
    const { data: reviews, error } = await this.supabaseService.getClient()
      .from('supplier_reviews')
      .select('rating')
      .eq('supplier_id', supplierId);

    if (error) {
      this.logger.error(`Error fetching supplier reviews: ${error.message}`);
      return;
    }

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      const { error: updateError } = await this.supabaseService.getClient()
        .from('suppliers')
        .update({ rating: avgRating })
        .eq('id', supplierId);

      if (updateError) {
        this.logger.error(`Error updating supplier rating: ${updateError.message}`);
      }
    }
  }
}