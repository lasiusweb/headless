export interface ShippingOrder {
  id: string;
  orderId: string;
  customerId: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: ShippingItem[];
  carrier: 'delhivery' | 'vrl' | 'bluedart' | 'ups' | 'fedex' | 'self';
  serviceType: 'standard' | 'express' | 'same_day' | 'next_day';
  weight: number; // in kg
  dimensions: Dimensions;
  declaredValue: number; // for insurance
  status: 'pending' | 'label_generated' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled';
  trackingNumber?: string;
  labelUrl?: string;
  pickupSlot?: PickupSlot;
  deliverySlot?: DeliverySlot;
  shippingCost: number;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  weight: number; // in kg
  dimensions: Dimensions;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  contactName: string;
  contactPhone: string;
}

export interface Dimensions {
  length: number; // in cm
  width: number; // in cm
  height: number; // in cm
}

export interface PickupSlot {
  date: Date;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface DeliverySlot {
  date: Date;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface ShippingRate {
  id: string;
  carrier: 'delhivery' | 'vrl' | 'bluedart' | 'ups' | 'fedex' | 'self';
  serviceType: 'standard' | 'express' | 'same_day' | 'next_day';
  originPincode: string;
  destinationPincode: string;
  minWeight: number; // in kg
  maxWeight: number; // in kg
  ratePerKg: number;
  additionalCharges: number;
  estimatedDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentTrackingEvent {
  id: string;
  trackingNumber: string;
  status: 'origin_scan' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'exception';
  location: string;
  timestamp: Date;
  remarks?: string;
  createdAt: Date;
}