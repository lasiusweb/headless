export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerType: 'retailer' | 'dealer' | 'distributor';
  items: OrderItem[];
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  pricingTier: 'retailer' | 'dealer' | 'distributor';
  subtotal: number;
  tax: number;
  discount: number;
  shippingCost: number;
  total: number;
  currency: string;
  billingAddress: Address;
  shippingAddress: Address;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxRate: number;
  total: number;
  batchIds?: string[]; // For tracking which batches were used for fulfillment
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderApproval {
  id: string;
  orderId: string;
  approverId: string;
  status: 'approved' | 'rejected';
  reason?: string;
  createdAt: Date;
}

export interface OrderFulfillment {
  id: string;
  orderId: string;
  items: OrderFulfillmentItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderFulfillmentItem {
  id: string;
  orderItemId: string;
  productId: string;
  quantity: number;
  batchId?: string; // The batch from which the item was fulfilled
  warehouseLocation?: string;
}