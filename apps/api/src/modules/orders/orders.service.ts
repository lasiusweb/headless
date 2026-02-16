import { Injectable, Inject } from '@nestjs/common';
import { 
  Order, 
  OrderItem, 
  OrderApproval, 
  OrderFulfillment,
  Address
} from './interfaces/order.interface';
import { 
  CreateOrderDto, 
  UpdateOrderDto, 
  ApproveOrderDto, 
  RejectOrderDto, 
  ShipOrderDto 
} from './dto/order.dto';
import { InventoryService } from '../inventory/inventory.service';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private orderApprovals: OrderApproval[] = [];
  private orderFulfillments: OrderFulfillment[] = [];

  constructor(
    @Inject(InventoryService) private inventoryService: InventoryService,
    @Inject(PricingService) private pricingService: PricingService
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Generate unique order number
    const orderNumber = `ORD${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Get customer's pricing tier
    const userPricingTier = await this.pricingService.getUserPricingTier(createOrderDto.customerId);
    const pricingTier = userPricingTier.userType;

    // Calculate order items with pricing
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of createOrderDto.items) {
      // Get product details and calculate price based on user's tier
      const calculatedPrice = await this.pricingService.calculatePrice({
        productId: item.productId,
        userType: pricingTier,
        quantity: item.quantity,
      });

      const orderItem: OrderItem = {
        id: Math.random().toString(36).substring(7),
        productId: item.productId,
        productName: `Product Name - ${item.productId}`, // In a real app, this would come from product service
        sku: `SKU-${item.productId}`, // In a real app, this would come from product service
        quantity: item.quantity,
        unitPrice: calculatedPrice,
        discountPercentage: item.discountPercentage,
        taxRate: item.taxRate,
        total: calculatedPrice * item.quantity,
      };

      orderItems.push(orderItem);
      subtotal += orderItem.total;
    }

    // Calculate taxes, discounts, etc.
    const tax = subtotal * 0.18; // Assuming 18% GST
    const discount = 0; // Calculated based on promotions or user tier
    const shippingCost = subtotal > 5000 ? 0 : 100; // Free shipping over ₹5000
    const total = subtotal + tax - discount + shippingCost;

    // Create the order
    const newOrder: Order = {
      id: Math.random().toString(36).substring(7),
      orderNumber,
      customerId: createOrderDto.customerId,
      customerType: createOrderDto.customerType,
      items: orderItems,
      status: createOrderDto.customerType === 'retailer' ? 'approved' : 'pending_approval', // Retailers auto-approved, others need approval
      pricingTier,
      subtotal,
      tax,
      discount,
      shippingCost,
      total,
      currency: 'INR',
      billingAddress: createOrderDto.billingAddress,
      shippingAddress: createOrderDto.shippingAddress,
      paymentStatus: 'pending',
      notes: createOrderDto.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.push(newOrder);

    // If order is auto-approved (for retailers), reserve the stock
    if (newOrder.status === 'approved') {
      await this.reserveStockForOrder(newOrder);
    }

    return newOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    return [...this.orders];
  }

  async getOrderById(id: string): Promise<Order> {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) {
      throw new Error(`Order with ID ${id} not found`);
    }

    const oldStatus = this.orders[index].status;
    const newStatus = updateOrderDto.status || oldStatus;

    // If status is changing to approved and it wasn't already approved, reserve stock
    if (newStatus === 'approved' && oldStatus !== 'approved') {
      await this.reserveStockForOrder(this.orders[index]);
    }

    this.orders[index] = {
      ...this.orders[index],
      ...updateOrderDto,
      updatedAt: new Date(),
    };

    return this.orders[index];
  }

  async approveOrder(orderId: string, approveOrderDto: ApproveOrderDto): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (order.status !== 'pending_approval') {
      throw new Error(`Order ${orderId} is not in pending approval status`);
    }

    // Reserve stock for the order
    await this.reserveStockForOrder(order);

    // Update order status
    const updatedOrder = await this.updateOrder(orderId, {
      status: 'approved',
      approvedBy: approveOrderDto.approverId,
      approvedAt: new Date(),
    });

    // Create approval record
    const approval: OrderApproval = {
      id: Math.random().toString(36).substring(7),
      orderId,
      approverId: approveOrderDto.approverId,
      status: 'approved',
      createdAt: new Date(),
    };

    this.orderApprovals.push(approval);

    return updatedOrder;
  }

  async rejectOrder(orderId: string, rejectOrderDto: RejectOrderDto): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (order.status !== 'pending_approval') {
      throw new Error(`Order ${orderId} is not in pending approval status`);
    }

    // Update order status
    const updatedOrder = await this.updateOrder(orderId, {
      status: 'rejected',
      rejectedBy: rejectOrderDto.approverId,
      rejectedAt: new Date(),
      rejectionReason: rejectOrderDto.reason,
    });

    // Create approval record
    const approval: OrderApproval = {
      id: Math.random().toString(36).substring(7),
      orderId,
      approverId: rejectOrderDto.approverId,
      status: 'rejected',
      reason: rejectOrderDto.reason,
      createdAt: new Date(),
    };

    this.orderApprovals.push(approval);

    return updatedOrder;
  }

  async shipOrder(orderId: string, shipOrderDto: ShipOrderDto): Promise<OrderFulfillment> {
    const order = await this.getOrderById(orderId);

    if (order.status !== 'approved' && order.status !== 'processing') {
      throw new Error(`Order ${orderId} is not in an approved or processing status`);
    }

    // Create fulfillment record
    const fulfillment: OrderFulfillment = {
      id: Math.random().toString(36).substring(7),
      orderId,
      items: [], // Will be populated based on order items
      status: 'processing',
      trackingNumber: shipOrderDto.trackingNumber,
      carrier: shipOrderDto.carrier,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update order status
    await this.updateOrder(orderId, {
      status: 'shipped',
      shippedAt: new Date(),
    });

    this.orderFulfillments.push(fulfillment);
    return fulfillment;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.orders.filter(order => order.customerId === customerId);
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return this.orders.filter(order => order.status === status);
  }

  private async reserveStockForOrder(order: Order): Promise<void> {
    for (const item of order.items) {
      // Create a stock reservation for each item
      await this.inventoryService.createStockReservation({
        inventoryItemId: item.productId, // In a real app, this would map to inventory item ID
        orderId: order.id,
        customerId: order.customerId,
        quantity: item.quantity,
        expiresAfterHours: 24, // Reservation expires after 24 hours if not fulfilled
      });
    }
  }

  async getPendingApprovals(): Promise<Order[]> {
    return this.orders.filter(order => order.status === 'pending_approval');
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<Order> {
    const order = this.orders.find(o => o.orderNumber === orderNumber);
    if (!order) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }
    return order;
  }
}