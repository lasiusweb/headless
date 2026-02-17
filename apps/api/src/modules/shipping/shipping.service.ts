import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import axios from 'axios';

export interface ShippingRate {
  carrier: string;
  service: string;
  rate: number;
  estimatedDays: number;
  currency: string;
}

export interface Shipment {
  id: string;
  awbNumber: string;
  carrier: string;
  status: string;
  trackingUrl: string;
  labelUrl?: string;
  manifestUrl?: string;
}

export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  message: string;
}

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private readonly delhiveryApiKey: string;
  private readonly vrlApiKey: string;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    this.delhiveryApiKey = this.configService.get<string>('DELHIVERY_API_KEY') || '';
    this.vrlApiKey = this.configService.get<string>('VRL_API_KEY') || '';
  }

  /**
   * Get shipping rates from multiple carriers
   */
  async getShippingRates(params: {
    originPincode: string;
    destinationPincode: string;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
  }): Promise<ShippingRate[]> {
    const rates: ShippingRate[] = [];

    try {
      // Get Delhivery rates
      const delhiveryRates = await this.getDelhiveryRates(params);
      rates.push(...delhiveryRates);
    } catch (error) {
      this.logger.error('Error getting Delhivery rates:', error.message);
    }

    try {
      // Get VRL rates
      const vrlRates = await this.getVrlRates(params);
      rates.push(...vrlRates);
    } catch (error) {
      this.logger.error('Error getting VRL rates:', error.message);
    }

    // Sort by rate (cheapest first)
    return rates.sort((a, b) => a.rate - b.rate);
  }

  /**
   * Get rates from Delhivery
   */
  private async getDelhiveryRates(params: any): Promise<ShippingRate[]> {
    if (!this.delhiveryApiKey) {
      // Return mock rates if API key not configured
      return [
        {
          carrier: 'Delhivery',
          service: 'Surface',
          rate: 60 + (params.weight * 10),
          estimatedDays: 5,
          currency: 'INR',
        },
        {
          carrier: 'Delhivery',
          service: 'Express',
          rate: 100 + (params.weight * 15),
          estimatedDays: 3,
          currency: 'INR',
        },
      ];
    }

    try {
      const response = await axios.post(
        'https://api.delhivery.com/courier/api/rate',
        {
          origin_pincode: params.originPincode,
          destination_pincode: params.destinationPincode,
          weight: params.weight,
          dimensions: {
            length: params.length || 30,
            width: params.width || 20,
            height: params.height || 10,
          },
        },
        {
          headers: {
            'Authorization': `Token ${this.delhiveryApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.rates.map((rate: any) => ({
        carrier: 'Delhivery',
        service: rate.service_name,
        rate: rate.total_rate,
        estimatedDays: rate.estimated_days,
        currency: 'INR',
      }));
    } catch (error) {
      this.logger.error('Delhivery rate API error:', error.message);
      throw error;
    }
  }

  /**
   * Get rates from VRL Logistics
   */
  private async getVrlRates(params: any): Promise<ShippingRate[]> {
    if (!this.vrlApiKey) {
      // Return mock rates if API key not configured
      return [
        {
          carrier: 'VRL',
          service: 'Road',
          rate: 50 + (params.weight * 8),
          estimatedDays: 7,
          currency: 'INR',
        },
        {
          carrier: 'VRL',
          service: 'Premium',
          rate: 80 + (params.weight * 12),
          estimatedDays: 4,
          currency: 'INR',
        },
      ];
    }

    try {
      const response = await axios.post(
        'https://api.vrllogistics.in/api/rates',
        {
          from_pincode: params.originPincode,
          to_pincode: params.destinationPincode,
          weight: params.weight,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.vrlApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.services.map((service: any) => ({
        carrier: 'VRL',
        service: service.service_name,
        rate: service.rate,
        estimatedDays: service.transit_days,
        currency: 'INR',
      }));
    } catch (error) {
      this.logger.error('VRL rate API error:', error.message);
      throw error;
    }
  }

  /**
   * Create shipment with carrier
   */
  async createShipment(params: {
    orderId: string;
    carrier: string;
    service: string;
    pickupAddress: any;
    deliveryAddress: any;
    items: any[];
    weight: number;
  }): Promise<Shipment> {
    let shipment: Shipment;

    if (params.carrier.toLowerCase() === 'delhivery') {
      shipment = await this.createDelhiveryShipment(params);
    } else if (params.carrier.toLowerCase() === 'vrl') {
      shipment = await this.createVrlShipment(params);
    } else {
      throw new Error(`Unsupported carrier: ${params.carrier}`);
    }

    // Save shipment to database
    await this.saveShipmentToDatabase({
      ...shipment,
      order_id: params.orderId,
      items: params.items,
      weight: params.weight,
    });

    return shipment;
  }

  /**
   * Create shipment with Delhivery
   */
  private async createDelhiveryShipment(params: any): Promise<Shipment> {
    if (!this.delhiveryApiKey) {
      // Return mock shipment if API key not configured
      return {
        id: `DEL${Date.now()}`,
        awbNumber: `DEL${Math.floor(100000000 + Math.random() * 900000000)}`,
        carrier: 'Delhivery',
        status: 'label_generated',
        trackingUrl: `https://www.delhivery.com/track/?awb=${`DEL${Math.floor(100000000 + Math.random() * 900000000)}`}`,
        labelUrl: '/api/shipping/labels/mock-label.pdf',
      };
    }

    try {
      const response = await axios.post(
        'https://api.delhivery.com/courier/api/create_order',
        {
          pickup_address: params.pickupAddress,
          delivery_address: params.deliveryAddress,
          items: params.items,
          weight: params.weight,
          service: params.service,
        },
        {
          headers: {
            'Authorization': `Token ${this.delhiveryApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        id: response.data.order_id,
        awbNumber: response.data.awb_number,
        carrier: 'Delhivery',
        status: response.data.status,
        trackingUrl: response.data.tracking_url,
        labelUrl: response.data.label_url,
        manifestUrl: response.data.manifest_url,
      };
    } catch (error) {
      this.logger.error('Delhivery shipment creation error:', error.message);
      throw error;
    }
  }

  /**
   * Create shipment with VRL
   */
  private async createVrlShipment(params: any): Promise<Shipment> {
    if (!this.vrlApiKey) {
      // Return mock shipment if API key not configured
      return {
        id: `VRL${Date.now()}`,
        awbNumber: `VRL${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        carrier: 'VRL',
        status: 'label_generated',
        trackingUrl: `https://www.vrllogistics.in/track/?awb=${`VRL${Math.floor(1000000000 + Math.random() * 9000000000)}`}`,
        labelUrl: '/api/shipping/labels/mock-label.pdf',
      };
    }

    try {
      const response = await axios.post(
        'https://api.vrllogistics.in/api/shipments',
        {
          consignor: params.pickupAddress,
          consignee: params.deliveryAddress,
          parcels: params.items,
          weight: params.weight,
          service_type: params.service,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.vrlApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        id: response.data.shipment_id,
        awbNumber: response.data.awb_number,
        carrier: 'VRL',
        status: response.data.status,
        trackingUrl: response.data.tracking_url,
        labelUrl: response.data.label_url,
      };
    } catch (error) {
      this.logger.error('VRL shipment creation error:', error.message);
      throw error;
    }
  }

  /**
   * Track shipment
   */
  async trackShipment(awbNumber: string, carrier: string): Promise<TrackingEvent[]> {
    if (carrier.toLowerCase() === 'delhivery') {
      return this.trackDelhiveryShipment(awbNumber);
    } else if (carrier.toLowerCase() === 'vrl') {
      return this.trackVrlShipment(awbNumber);
    } else {
      throw new Error(`Unsupported carrier: ${carrier}`);
    }
  }

  /**
   * Track Delhivery shipment
   */
  private async trackDelhiveryShipment(awbNumber: string): Promise<TrackingEvent[]> {
    if (!this.delhiveryApiKey) {
      // Return mock tracking events if API key not configured
      return [
        {
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Mumbai, MH',
          status: 'picked_up',
          message: 'Shipment picked up from seller',
        },
        {
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Pune, MH',
          status: 'in_transit',
          message: 'Shipment in transit',
        },
        {
          timestamp: new Date().toISOString(),
          location: 'Bangalore, KA',
          status: 'out_for_delivery',
          message: 'Out for delivery',
        },
      ];
    }

    try {
      const response = await axios.get(
        `https://api.delhivery.com/courier/api/track/${awbNumber}`,
        {
          headers: {
            'Authorization': `Token ${this.delhiveryApiKey}`,
          },
        },
      );

      return response.data.tracking_events.map((event: any) => ({
        timestamp: event.timestamp,
        location: event.location,
        status: event.status,
        message: event.message,
      }));
    } catch (error) {
      this.logger.error('Delhivery tracking error:', error.message);
      throw error;
    }
  }

  /**
   * Track VRL shipment
   */
  private async trackVrlShipment(awbNumber: string): Promise<TrackingEvent[]> {
    if (!this.vrlApiKey) {
      // Return mock tracking events if API key not configured
      return [
        {
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Delhi',
          status: 'picked_up',
          message: 'Consignment picked up',
        },
        {
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Hubli, KA',
          status: 'in_transit',
          message: 'Reached destination hub',
        },
      ];
    }

    try {
      const response = await axios.get(
        `https://api.vrllogistics.in/api/track/${awbNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${this.vrlApiKey}`,
          },
        },
      );

      return response.data.events.map((event: any) => ({
        timestamp: event.datetime,
        location: event.location,
        status: event.status,
        message: event.description,
      }));
    } catch (error) {
      this.logger.error('VRL tracking error:', error.message);
      throw error;
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(awbNumber: string, carrier: string): Promise<boolean> {
    if (carrier.toLowerCase() === 'delhivery') {
      return this.cancelDelhiveryShipment(awbNumber);
    } else if (carrier.toLowerCase() === 'vrl') {
      return this.cancelVrlShipment(awbNumber);
    } else {
      throw new Error(`Unsupported carrier: ${carrier}`);
    }
  }

  private async cancelDelhiveryShipment(awbNumber: string): Promise<boolean> {
    // Implementation for Delhivery cancellation
    this.logger.log(`Cancelling Delhivery shipment: ${awbNumber}`);
    return true;
  }

  private async cancelVrlShipment(awbNumber: string): Promise<boolean> {
    // Implementation for VRL cancellation
    this.logger.log(`Cancelling VRL shipment: ${awbNumber}`);
    return true;
  }

  /**
   * Save shipment to database
   */
  private async saveShipmentToDatabase(shipment: any): Promise<void> {
    const { error } = await this.supabaseService.getClient()
      .from('shipments')
      .insert([{
        order_id: shipment.order_id,
        awb_number: shipment.awbNumber,
        carrier: shipment.carrier,
        status: shipment.status,
        tracking_url: shipment.trackingUrl,
        label_url: shipment.labelUrl,
        manifest_url: shipment.manifestUrl,
        items: shipment.items,
        weight: shipment.weight,
        created_at: new Date().toISOString(),
      }]);

    if (error) {
      this.logger.error('Error saving shipment:', error.message);
      throw error;
    }
  }

  /**
   * Get shipments by order ID
   */
  async getShipmentsByOrderId(orderId: string): Promise<any[]> {
    const { data, error } = await this.supabaseService.getClient()
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error fetching shipments:', error.message);
      throw error;
    }

    return data || [];
  }
}
