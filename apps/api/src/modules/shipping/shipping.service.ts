import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  ShippingOrder, 
  ShippingRate, 
  ShipmentTrackingEvent 
} from './interfaces/shipping.interface';
import { 
  CreateShippingOrderDto, 
  UpdateShippingOrderDto, 
  ShippingRateDto, 
  TrackShipmentDto 
} from './dto/shipping.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private shippingOrders: ShippingOrder[] = [];
  private shippingRates: ShippingRate[] = [];
  private trackingEvents: ShipmentTrackingEvent[] = [];

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {}

  async createShippingOrder(createShippingOrderDto: CreateShippingOrderDto): Promise<ShippingOrder> {
    // Calculate estimated delivery date based on service type and carrier
    const estimatedDeliveryDate = this.calculateEstimatedDeliveryDate(
      createShippingOrderDto.serviceType,
      createShippingOrderDto.carrier,
      createShippingOrderDto.shippingAddress.pincode,
      createShippingOrderDto.billingAddress.pincode
    );

    // Create a new shipping order
    const shippingOrder: ShippingOrder = {
      id: Math.random().toString(36).substring(7),
      ...createShippingOrderDto,
      status: 'pending',
      estimatedDeliveryDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.shippingOrders.push(shippingOrder);

    // Process the shipping order based on the selected carrier
    if (createShippingOrderDto.carrier === 'delhivery') {
      return this.processWithDelhivery(shippingOrder);
    } else if (createShippingOrderDto.carrier === 'vrl') {
      return this.processWithVRL(shippingOrder);
    } else {
      // For other carriers, generate a tracking number and label
      return this.generateTrackingAndLabel(shippingOrder);
    }
  }

  private async processWithDelhivery(shippingOrder: ShippingOrder): Promise<ShippingOrder> {
    // In a real implementation, this would call the Delhivery API
    // For now, we'll simulate the process
    
    // Get Delhivery configuration
    const delhiveryApiKey = this.configService.get<string>('DELHIVERY_API_KEY');

    // Simulate creating a shipment on Delhivery
    const trackingNumber = `DL${Date.now()}`;
    const labelUrl = `https://example.com/labels/${trackingNumber}.pdf`;

    // Update the shipping order with Delhivery-specific information
    const index = this.shippingOrders.findIndex(s => s.id === shippingOrder.id);
    if (index !== -1) {
      this.shippingOrders[index] = {
        ...this.shippingOrders[index],
        status: 'label_generated',
        trackingNumber,
        labelUrl,
        updatedAt: new Date(),
      };
    }

    this.logger.log(`Shipment created with Delhivery for order ${shippingOrder.orderId}, tracking: ${trackingNumber}`);

    // Add origin scan event
    this.addTrackingEvent({
      id: Math.random().toString(36).substring(7),
      trackingNumber,
      status: 'origin_scan',
      location: shippingOrder.shippingAddress.city,
      timestamp: new Date(),
      remarks: 'Package received at origin facility',
      createdAt: new Date(),
    });

    return this.shippingOrders[index];
  }

  private async processWithVRL(shippingOrder: ShippingOrder): Promise<ShippingOrder> {
    // In a real implementation, this would call the VRL API
    // For now, we'll simulate the process
    
    // Get VRL configuration
    const vrlApiKey = this.configService.get<string>('VRL_API_KEY');

    // Simulate creating a shipment on VRL
    const trackingNumber = `VRL${Date.now()}`;
    const labelUrl = `https://example.com/labels/${trackingNumber}.pdf`;

    // Update the shipping order with VRL-specific information
    const index = this.shippingOrders.findIndex(s => s.id === shippingOrder.id);
    if (index !== -1) {
      this.shippingOrders[index] = {
        ...this.shippingOrders[index],
        status: 'label_generated',
        trackingNumber,
        labelUrl,
        updatedAt: new Date(),
      };
    }

    this.logger.log(`Shipment created with VRL for order ${shippingOrder.orderId}, tracking: ${trackingNumber}`);

    // Add origin scan event
    this.addTrackingEvent({
      id: Math.random().toString(36).substring(7),
      trackingNumber,
      status: 'origin_scan',
      location: shippingOrder.shippingAddress.city,
      timestamp: new Date(),
      remarks: 'Package received at origin facility',
      createdAt: new Date(),
    });

    return this.shippingOrders[index];
  }

  private async generateTrackingAndLabel(shippingOrder: ShippingOrder): Promise<ShippingOrder> {
    // Generate a tracking number and label for other carriers
    const trackingNumber = `${shippingOrder.carrier.toUpperCase()}${Date.now()}`;
    const labelUrl = `https://example.com/labels/${trackingNumber}.pdf`;

    const index = this.shippingOrders.findIndex(s => s.id === shippingOrder.id);
    if (index !== -1) {
      this.shippingOrders[index] = {
        ...this.shippingOrders[index],
        status: 'label_generated',
        trackingNumber,
        labelUrl,
        updatedAt: new Date(),
      };
    }

    this.logger.log(`Shipment created with ${shippingOrder.carrier} for order ${shippingOrder.orderId}, tracking: ${trackingNumber}`);

    // Add origin scan event
    this.addTrackingEvent({
      id: Math.random().toString(36).substring(7),
      trackingNumber,
      status: 'origin_scan',
      location: shippingOrder.shippingAddress.city,
      timestamp: new Date(),
      remarks: 'Package received at origin facility',
      createdAt: new Date(),
    });

    return this.shippingOrders[index];
  }

  private calculateEstimatedDeliveryDate(
    serviceType: 'standard' | 'express' | 'same_day' | 'next_day',
    carrier: string,
    originPincode: string,
    destPincode: string
  ): Date {
    // Calculate estimated delivery based on service type and distance
    // This is a simplified calculation - in reality, this would use carrier APIs
    const baseDays = serviceType === 'same_day' ? 1 : 
                    serviceType === 'next_day' ? 1 : 
                    serviceType === 'express' ? 2 : 5;

    // Add extra days based on distance (simplified)
    const distanceFactor = Math.abs(parseInt(originPincode.substring(0, 3)) - parseInt(destPincode.substring(0, 3))) / 100;
    const totalDays = baseDays + Math.floor(distanceFactor);

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + totalDays);

    return estimatedDate;
  }

  async updateShippingOrder(id: string, updateShippingOrderDto: UpdateShippingOrderDto): Promise<ShippingOrder> {
    const index = this.shippingOrders.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Shipping order with ID ${id} not found`);
    }

    const oldStatus = this.shippingOrders[index].status;
    const newStatus = updateShippingOrderDto.status || oldStatus;

    // If status is changing to delivered, update the associated order
    if (newStatus === 'delivered' && oldStatus !== 'delivered') {
      await this.ordersService.updateOrder(this.shippingOrders[index].orderId, {
        status: 'delivered',
        deliveredAt: new Date(),
      });
    }

    this.shippingOrders[index] = {
      ...this.shippingOrders[index],
      ...updateShippingOrderDto,
      updatedAt: new Date(),
    };

    return this.shippingOrders[index];
  }

  async getShippingOrderById(id: string): Promise<ShippingOrder> {
    const shippingOrder = this.shippingOrders.find(s => s.id === id);
    if (!shippingOrder) {
      throw new Error(`Shipping order with ID ${id} not found`);
    }
    return shippingOrder;
  }

  async getShippingOrderByTrackingNumber(trackingNumber: string): Promise<ShippingOrder> {
    const shippingOrder = this.shippingOrders.find(s => s.trackingNumber === trackingNumber);
    if (!shippingOrder) {
      throw new Error(`Shipping order with tracking number ${trackingNumber} not found`);
    }
    return shippingOrder;
  }

  async getShippingOrdersByOrder(orderId: string): Promise<ShippingOrder[]> {
    return this.shippingOrders.filter(s => s.orderId === orderId);
  }

  async getShippingOrdersByCustomer(customerId: string): Promise<ShippingOrder[]> {
    return this.shippingOrders.filter(s => s.customerId === customerId);
  }

  async getShippingOrdersByStatus(status: string): Promise<ShippingOrder[]> {
    return this.shippingOrders.filter(s => s.status === status);
  }

  async addTrackingEvent(event: Omit<ShipmentTrackingEvent, 'id' | 'createdAt'>): Promise<ShipmentTrackingEvent> {
    const trackingEvent: ShipmentTrackingEvent = {
      id: Math.random().toString(36).substring(7),
      ...event,
      createdAt: new Date(),
    };

    this.trackingEvents.push(trackingEvent);
    return trackingEvent;
  }

  async getTrackingHistory(trackingNumber: string): Promise<ShipmentTrackingEvent[]> {
    return this.trackingEvents.filter(event => event.trackingNumber === trackingNumber)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createShippingRate(shippingRateDto: ShippingRateDto): Promise<ShippingRate> {
    const shippingRate: ShippingRate = {
      id: Math.random().toString(36).substring(7),
      ...shippingRateDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.shippingRates.push(shippingRate);
    return shippingRate;
  }

  async getShippingRate(
    carrier: string,
    serviceType: string,
    originPincode: string,
    destPincode: string,
    weight: number
  ): Promise<ShippingRate | null> {
    // Find applicable rate based on criteria
    const applicableRate = this.shippingRates.find(rate => 
      rate.carrier === carrier &&
      rate.serviceType === serviceType &&
      rate.originPincode === originPincode &&
      rate.destinationPincode === destPincode &&
      weight >= rate.minWeight &&
      weight <= rate.maxWeight
    );

    return applicableRate || null;
  }

  async calculateShippingCost(
    carrier: string,
    serviceType: string,
    originPincode: string,
    destPincode: string,
    weight: number
  ): Promise<number> {
    const rate = await this.getShippingRate(carrier, serviceType, originPincode, destPincode, weight);
    
    if (!rate) {
      // If no specific rate found, return a default cost
      return weight * 20 + 50; // Base cost of ₹50 + ₹20 per kg
    }

    const cost = (weight * rate.ratePerKg) + rate.additionalCharges;
    return parseFloat(cost.toFixed(2));
  }
}