// services/shippingService.ts
import { ShippingOrder, ShippingRate, ShipmentTrackingEvent } from '../api/src/modules/shipping/interfaces/shipping.interface';
import { CreateShippingOrderDto, UpdateShippingOrderDto, ShippingRateDto, TrackShipmentDto } from '../api/src/modules/shipping/dto/shipping.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the shipping API
 */
export class ShippingService {
  /**
   * Creates a new shipping order
   */
  static async createShippingOrder(data: CreateShippingOrderDto): Promise<ShippingOrder> {
    const response = await fetch(`${API_BASE_URL}/shipping/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create shipping order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a shipping order
   */
  static async updateShippingOrder(id: string, data: UpdateShippingOrderDto): Promise<ShippingOrder> {
    const response = await fetch(`${API_BASE_URL}/shipping/order/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update shipping order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a shipping order by ID
   */
  static async getShippingOrderById(id: string): Promise<ShippingOrder> {
    const response = await fetch(`${API_BASE_URL}/shipping/order/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch shipping order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a shipping order by tracking number
   */
  static async getShippingOrderByTrackingNumber(trackingNumber: string): Promise<ShippingOrder> {
    const response = await fetch(`${API_BASE_URL}/shipping/order/tracking/${trackingNumber}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch shipping order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets shipping orders by order ID
   */
  static async getShippingOrdersByOrder(orderId: string): Promise<ShippingOrder[]> {
    const response = await fetch(`${API_BASE_URL}/shipping/order/order/${orderId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch shipping orders for order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets shipping orders by customer ID
   */
  static async getShippingOrdersByCustomer(customerId: string): Promise<ShippingOrder[]> {
    const response = await fetch(`${API_BASE_URL}/shipping/order/customer/${customerId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch shipping orders for customer: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets shipping orders by status
   */
  static async getShippingOrdersByStatus(status: string): Promise<ShippingOrder[]> {
    const response = await fetch(`${API_BASE_URL}/shipping/order/status/${status}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch shipping orders with status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets tracking history for a shipment
   */
  static async getTrackingHistory(data: TrackShipmentDto): Promise<ShipmentTrackingEvent[]> {
    const response = await fetch(`${API_BASE_URL}/shipping/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tracking history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a shipping rate
   */
  static async createShippingRate(data: ShippingRateDto): Promise<ShippingRate> {
    const response = await fetch(`${API_BASE_URL}/shipping/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create shipping rate: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a shipping rate
   */
  static async getShippingRate(
    carrier: string,
    serviceType: string,
    originPincode: string,
    destPincode: string,
    weight: number
  ): Promise<ShippingRate | null> {
    const response = await fetch(
      `${API_BASE_URL}/shipping/rate/${carrier}/${serviceType}/${originPincode}/${destPincode}/${weight}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch shipping rate: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Calculates shipping cost
   */
  static async calculateShippingCost(
    carrier: string,
    serviceType: string,
    originPincode: string,
    destPincode: string,
    weight: number
  ): Promise<number> {
    const response = await fetch(
      `${API_BASE_URL}/shipping/cost/${carrier}/${serviceType}/${originPincode}/${destPincode}/${weight}`
    );

    if (!response.ok) {
      throw new Error(`Failed to calculate shipping cost: ${response.statusText}`);
    }

    return response.json();
  }
}