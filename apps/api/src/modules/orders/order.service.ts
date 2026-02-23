import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId?: string, role?: string) {
    let query = this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        user:profiles(first_name, last_name, email, role),
        shipping_address:addresses(*),
        billing_address:addresses(*),
        items:order_items(*, variant:product_variants(*, product:products(name))),
        approvals:order_approvals(*)
      `);

    // Regular users can only see their own orders
    if (userId && role !== 'admin' && role !== 'staff') {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string, userId?: string, role?: string) {
    let query = this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        user:profiles(first_name, last_name, email, role),
        shipping_address:addresses(*),
        billing_address:addresses(*),
        items:order_items(*, variant:product_variants(*, product:products(name))),
        approvals:order_approvals(*)
      `)
      .eq('id', id);

    // Regular users can only see their own orders
    if (userId && role !== 'admin' && role !== 'staff') {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error) {
      throw new NotFoundException('Order not found');
    }

    return data;
  }

  async create(createOrderDto: CreateOrderDto, userId: string) {
    // Get user profile to determine role
    const { data: user, error: userError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    // Generate unique order number
    const orderNumber = `ORD${new Date().getTime()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of createOrderDto.items) {
      // Get product variant to determine pricing
      const { data: variant, error: variantError } = await this.supabaseService.getClient()
        .from('product_variants')
        .select(`
          *,
          product:products(name, slug)
        `)
        .eq('id', item.variantId)
        .single();

      if (variantError) {
        throw new Error(`Product variant not found: ${item.variantId}`);
      }

      // Determine price based on user role
      let unitPrice = variant.mrp; // Default to MRP

      if (user.role === 'dealer') {
        unitPrice = variant.dealer_price;
      } else if (user.role === 'distributor') {
        unitPrice = variant.distributor_price;
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        product_name: variant.product.name,
      });
    }

    // Calculate tax (assuming 18% GST for example)
    const taxRate = 0.18;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount + (createOrderDto.shippingCost || 0);

    // Determine initial status based on user role
    // B2B orders (dealer/distributor) require approval, B2C orders go directly to processing
    let initialStatus = 'processing';
    if (user.role === 'dealer' || user.role === 'distributor') {
      initialStatus = 'awaiting_approval';
    }

    // Create the order
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          user_id: userId,
          status: initialStatus,
          payment_status: 'pending',
          shipping_address_id: createOrderDto.shippingAddressId,
          billing_address_id: createOrderDto.billingAddressId || createOrderDto.shippingAddressId,
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax_amount: parseFloat(taxAmount.toFixed(2)),
          shipping_cost: parseFloat((createOrderDto.shippingCost || 0).toFixed(2)),
          total_amount: parseFloat(totalAmount.toFixed(2)),
          currency: 'INR',
          notes: createOrderDto.notes,
        }
      ])
      .select()
      .single();

    if (orderError) {
      throw new Error(orderError.message);
    }

    // Create order items
    for (const item of orderItems) {
      const { error: itemError } = await this.supabaseService.getClient()
        .from('order_items')
        .insert([
          {
            order_id: order.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          }
        ]);

      if (itemError) {
        throw new Error(itemError.message);
      }
    }

    // If the order requires approval, create approval records
    if (initialStatus === 'awaiting_approval') {
      await this.createApprovalRecords(order.id, userId, user.role);
    }

    // Clear the user's cart after order creation
    const { data: cart, error: cartError } = await this.supabaseService.getClient()
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!cartError && cart) {
      const { error: clearError } = await this.supabaseService.getClient()
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);

      if (clearError) {
        // Log error but don't fail the order creation
        console.error('Failed to clear cart after order:', clearError);
      }
    }

    // Return the complete order with items
    const { data: fullOrder, error: fullOrderError } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        user:profiles(first_name, last_name, email, role),
        shipping_address:addresses(*),
        billing_address:addresses(*),
        items:order_items(*, variant:product_variants(*, product:products(name))),
        approvals:order_approvals(*)
      `)
      .eq('id', order.id)
      .single();

    if (fullOrderError) {
      throw new Error(fullOrderError.message);
    }

    return fullOrder;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, userId?: string) {
    let query = this.supabaseService.getClient()
      .from('orders')
      .update({
        ...updateOrderDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.select().single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateStatus(id: string, status: string, userId?: string) {
    let query = this.supabaseService.getClient()
      .from('orders')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.select().single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.getClient()
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Order deleted successfully' };
  }

  /**
   * Create approval records for B2B orders
   */
  async createApprovalRecords(orderId: string, userId: string, userRole: string) {
    // For dealers, we might need regional manager approval
    // For distributors, we might need higher-level approval
    const approvalLevels = [];

    if (userRole === 'dealer') {
      approvalLevels.push({
        order_id: orderId,
        approver_role: 'regional_manager',
        status: 'pending',
        required: true,
      });
    } else if (userRole === 'distributor') {
      approvalLevels.push({
        order_id: orderId,
        approver_role: 'regional_manager',
        status: 'pending',
        required: true,
      });
      approvalLevels.push({
        order_id: orderId,
        approver_role: 'sales_head',
        status: 'pending',
        required: true,
      });
    }

    // Insert approval records
    for (const approval of approvalLevels) {
      const { error } = await this.supabaseService.getClient()
        .from('order_approvals')
        .insert([approval]);

      if (error) {
        console.error('Failed to create approval record:', error);
      }
    }
  }

  /**
   * Submit approval for an order
   */
  async submitApproval(orderId: string, approverId: string, approverRole: string, approved: boolean, notes?: string) {
    // Check if the order exists and is awaiting approval
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('status', 'awaiting_approval')
      .single();

    if (orderError) {
      throw new Error('Order not found or not awaiting approval');
    }

    // Check if this approver is authorized for this approval level
    const { data: approval, error: approvalError } = await this.supabaseService.getClient()
      .from('order_approvals')
      .select('*')
      .eq('order_id', orderId)
      .eq('approver_role', approverRole)
      .eq('status', 'pending')
      .single();

    if (approvalError) {
      throw new Error('No pending approval found for this role');
    }

    // Update the approval record
    const { error: updateError } = await this.supabaseService.getClient()
      .from('order_approvals')
      .update({
        status: approved ? 'approved' : 'rejected',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', approval.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Check if all required approvals are completed
    const { data: allApprovals, error: allApprovalsError } = await this.supabaseService.getClient()
      .from('order_approvals')
      .select('*')
      .eq('order_id', orderId);

    if (allApprovalsError) {
      throw new Error(allApprovalsError.message);
    }

    // Determine if all required approvals are done
    const allRequiredApproved = allApprovals.every(appr => appr.status === 'approved');
    const anyRejected = allApprovals.some(appr => appr.status === 'rejected');

    if (anyRejected) {
      // If any approval is rejected, reject the entire order
      await this.updateStatus(orderId, 'rejected');
    } else if (allRequiredApproved) {
      // If all required approvals are approved, move order to processing
      await this.updateStatus(orderId, 'processing');
      
      // Reserve inventory for the order
      await this.reserveInventoryForOrder(orderId);
    }

    return { success: true, orderId, status: anyRejected ? 'rejected' : (allRequiredApproved ? 'processing' : 'awaiting_approval') };
  }

  /**
   * Reserve inventory for an order
   */
  async reserveInventoryForOrder(orderId: string) {
    // Get order items
    const { data: orderItems, error: itemsError } = await this.supabaseService.getClient()
      .from('order_items')
      .select(`
        *,
        variant:product_variants(*)
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    // For each item in the order, try to reserve inventory
    for (const item of orderItems) {
      // Use the inventory service to allocate inventory
      // This would typically call the inventory service's allocate method
      // which implements FIFO allocation based on expiry dates
      
      // For now, we'll simulate calling the inventory allocation
      // In a real implementation, we'd import and use the InventoryService
      console.log(`Reserving ${item.quantity} units of ${item.variant_id} for order ${orderId}`);
    }
  }

  /**
   * Get orders requiring approval for a specific role
   */
  async getOrdersRequiringApproval(role: string) {
    // Get all orders that are awaiting approval
    const { data: orders, error } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        user:profiles(first_name, last_name, email, role),
        items:order_items(*, variant:product_variants(*, product:products(name))),
        approvals:order_approvals(*)
      `)
      .eq('status', 'awaiting_approval');

    if (error) {
      throw new Error(error.message);
    }

    // Filter orders that require approval for this specific role
    const filteredOrders = orders.filter(order => {
      return order.approvals.some(
        (approval: any) => approval.approver_role === role && approval.status === 'pending'
      );
    });

    return filteredOrders;
  }
}