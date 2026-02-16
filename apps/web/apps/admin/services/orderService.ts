// services/orderService.ts
import { Order } from '../api/src/modules/orders/interfaces/order.interface';
import { CreateOrderDto, UpdateOrderDto, ApproveOrderDto, RejectOrderDto, ShipOrderDto } from '../api/src/modules/orders/dto/order.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the order API
 */
export class OrderService {
  /**
   * Creates a new order
   */
  static async createOrder(data: CreateOrderDto): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets all orders
   */
  static async getAllOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/orders`);

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets an order by ID
   */
  static async getOrderById(id: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates an order
   */
  static async updateOrder(id: string, data: UpdateOrderDto): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Approves an order
   */
  static async approveOrder(orderId: string, data: ApproveOrderDto): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to approve order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Rejects an order
   */
  static async rejectOrder(orderId: string, data: RejectOrderDto): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to reject order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Ships an order
   */
  static async shipOrder(orderId: string, data: ShipOrderDto): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/ship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to ship order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets orders by customer
   */
  static async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/orders/customer/${customerId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch orders for customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets orders by status
   */
  static async getOrdersByStatus(status: string): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/orders/status/${status}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch orders with status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets pending approval orders
   */
  static async getPendingApprovals(): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/orders/pending-approvals`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pending approval orders: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets an order by order number
   */
  static async getOrderByOrderNumber(orderNumber: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/order-number/${orderNumber}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch order by number: ${response.statusText}`);
    }

    return response.json();
  }
}