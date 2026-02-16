import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateShippingRequestDto } from './dto/create-shipping-request.dto';
import { UpdateShippingRequestDto } from './dto/update-shipping-request.dto';

@Injectable()
export class ShippingLogisticsService {
  private readonly logger = new Logger(ShippingLogisticsService.name);

  constructor(private supabaseService: SupabaseService) {}

  async calculateShippingRates(fromPincode: string, toPincode: string, weight: number, carrierId?: string) {
    // In a real implementation, this would call carrier APIs to get rates
    // For now, we'll simulate the response
    
    const carriers = carrierId 
      ? await this.getCarrierById(carrierId)
      : await this.getAllActiveCarriers();
    
    const rates = carriers.map(carrier => {
      // Calculate rate based on distance and weight
      const distance = this.calculateDistance(fromPincode, toPincode);
      const distanceFactor = distance * 2; // Rs. 2 per km
      const weightFactor = weight * 10; // Rs. 10 per kg
      const baseRate = 50; // Minimum charge
      
      const rate = baseRate + distanceFactor + weightFactor;
      
      return {
        carrierId: carrier.id,
        carrierName: carrier.name,
        serviceType: carrier.carrier_type,
        estimatedDays: carrier.code === 'delhivery' ? 3 : carrier.code === 'vrl' ? 5 : 7,
        rate: parseFloat(rate.toFixed(2)),
        trackingAvailable: carrier.carrier_type === 'api',
      };
    });

    return rates;
  }

  async createShippingRequest(createShippingRequestDto: CreateShippingRequestDto, userId: string) {
    // Validate order exists and belongs to user
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        shipping_address:addresses(*),
        billing_address:addresses(*)
      `)
      .eq('id', createShippingRequestDto.orderId)
      .eq('user_id', userId)
      .single();

    if (orderError) {
      throw new Error(`Order not found: ${orderError.message}`);
    }

    if (order.status !== 'confirmed' && order.status !== 'processing') {
      throw new Error('Cannot ship order with status: ' + order.status);
    }

    // Calculate shipping cost
    const rates = await this.calculateShippingRates(
      order.shipping_address.pincode,
      order.billing_address.pincode,
      this.calculateOrderWeight(order.items),
      createShippingRequestDto.carrierId
    );

    const selectedRate = rates.find(rate => rate.carrierId === createShippingRequestDto.carrierId);
    if (!selectedRate) {
      throw new Error('Selected carrier not available for this route');
    }

    // Create shipment record
    const { data: shipment, error: shipmentError } = await this.supabaseService.getClient()
      .from('shipments')
      .insert([
        {
          order_id: createShippingRequestDto.orderId,
          carrier_id: createShippingRequestDto.carrierId,
          status: 'pending',
          shipping_cost: selectedRate.rate,
          estimated_delivery_days: selectedRate.estimatedDays,
          created_by: userId,
        }
      ])
      .select(`
        *,
        order:orders(order_number, total_amount),
        carrier:shipping_carriers(name, code, carrier_type)
      `)
      .single();

    if (shipmentError) {
      throw new Error(shipmentError.message);
    }

    // Update order with shipping information
    await this.supabaseService.getClient()
      .from('orders')
      .update({
        shipping_cost: selectedRate.rate,
        total_amount: order.total_amount + selectedRate.rate,
        status: 'processing',
      })
      .eq('id', order.id);

    return shipment;
  }

  async trackShipment(trackingNumber: string) {
    // In a real implementation, this would call the carrier's tracking API
    // For now, we'll simulate the response
    
    const { data: shipment, error: shipmentError } = await this.supabaseService.getClient()
      .from('shipments')
      .select(`
        *,
        order:orders(order_number),
        carrier:shipping_carriers(name, code)
      `)
      .eq('tracking_number', trackingNumber)
      .single();

    if (shipmentError) {
      throw new Error(`Shipment not found: ${shipmentError.message}`);
    }

    // Simulate tracking information
    const trackingUpdates = [
      {
        status: 'Order Confirmed',
        location: shipment.carrier.name + ' Facility',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Order confirmed and prepared for dispatch'
      },
      {
        status: 'Picked Up',
        location: 'Mumbai, Maharashtra',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Package picked up from seller location'
      },
      {
        status: 'In Transit',
        location: 'Delhi, India',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Package is moving towards destination'
      },
      {
        status: 'Out for Delivery',
        location: 'Bangalore, Karnataka',
        timestamp: new Date().toISOString(),
        description: 'Package is out for delivery'
      }
    ];

    return {
      ...shipment,
      trackingHistory: trackingUpdates,
      currentStatus: 'Out for Delivery',
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    };
  }

  async updateShipmentStatus(shipmentId: string, status: string, trackingData?: any) {
    const validStatuses = [
      'pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'rto', 'lost'
    ];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid shipment status: ${status}`);
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('shipments')
      .update({
        status,
        tracking_data: trackingData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId)
      .select(`
        *,
        order:orders(id, status)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // If shipment is delivered, update order status
    if (status === 'delivered') {
      await this.supabaseService.getClient()
        .from('orders')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', data.order.id);
    }

    return data;
  }

  async getShipmentsByOrder(orderId: string, userId?: string) {
    let query = this.supabaseService.getClient()
      .from('shipments')
      .select(`
        *,
        order:orders(order_number),
        carrier:shipping_carriers(name, code, carrier_type)
      `)
      .eq('order_id', orderId);

    if (userId) {
      query = query.eq('order.user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getShipmentsByUser(userId: string, status?: string) {
    let query = this.supabaseService.getClient()
      .from('shipments')
      .select(`
        *,
        order:orders(order_number, total_amount),
        carrier:shipping_carriers(name, code)
      `)
      .eq('order.user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  private calculateDistance(pincode1: string, pincode2: string): number {
    // In a real implementation, this would use a mapping service to calculate actual distance
    // For simulation, we'll return a random distance based on pincode difference
    const num1 = parseInt(pincode1.substring(0, 3));
    const num2 = parseInt(pincode2.substring(0, 3));
    const diff = Math.abs(num1 - num2);
    
    // Return distance in kilometers (randomized for simulation)
    return diff * 10 + Math.floor(Math.random() * 50);
  }

  private calculateOrderWeight(items: any[]): number {
    // Calculate total weight of order based on items
    // In a real implementation, this would use actual product weights
    return items.reduce((total, item) => {
      // Assuming each item has a weight property or we use a default
      return total + (item.weight || 0.5) * item.quantity;
    }, 0);
  }

  private async getCarrierById(carrierId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('shipping_carriers')
      .select('*')
      .eq('id', carrierId)
      .eq('is_active', true)
      .single();

    if (error) {
      throw new Error(`Carrier not found: ${error.message}`);
    }

    return [data];
  }

  private async getAllActiveCarriers() {
    const { data, error } = await this.supabaseService.getClient()
      .from('shipping_carriers')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}