export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: ReturnItem[];
  reason: ReturnReason;
  reasonDetails?: string;
  status: 'pending' | 'approved' | 'rejected' | 'picked_up' | 'received' | 'processing' | 'refunded' | 'cancelled';
  refundMethod: 'original' | 'store_credit' | 'exchange';
  refundAmount: number;
  shippingAddress: Address;
  pickupAddress?: Address;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  images?: string[];
  requestedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  pickedUpAt?: Date;
  receivedAt?: Date;
  receivedBy?: string;
  processedAt?: Date;
  processedBy?: string;
  refundedAt?: Date;
  refundedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReturnItem {
  id: string;
  orderItemId: string;
  productId: string;
  productName: string;
  sku: string;
  batchId?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  condition: 'unused' | 'used' | 'damaged' | 'defective' | 'expired';
  images?: string[];
}

export interface ReturnReason {
  id: string;
  category: 'wrong_product' | 'damaged' | 'defective' | 'expired' | 'not_as_described' | 'changed_mind' | 'other';
  description: string;
  isActive: boolean;
  requiresImage: boolean;
  autoApprove: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Refund {
  id: string;
  refundNumber: string;
  returnRequestId: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  refundMethod: 'original' | 'store_credit' | 'exchange';
  paymentGatewayRefundId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  failureReason?: string;
  processedBy: string;
  processedAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exchange {
  id: string;
  exchangeNumber: string;
  returnRequestId: string;
  returnNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  returnedItems: ExchangeItem[];
  replacementItems: ExchangeItem[];
  priceDifference: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  shippingAddress: Address;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  requestedAt: Date;
  approvedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
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

export interface ReturnPolicy {
  id: string;
  name: string;
  description: string;
  returnWindow: number; // in days
  eligibleProductCategories: string[];
  excludedProductCategories: string[];
  conditions: string[];
  refundMethods: ('original' | 'store_credit' | 'exchange')[];
  whoPaysShipping: 'customer' | 'company' | 'depends';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReturnAnalytics {
  id: string;
  period: string; // Format: YYYY-MM
  totalReturns: number;
  totalRefunds: number;
  totalExchanges: number;
  returnRate: number; // percentage of orders returned
  averageRefundAmount: number;
  averageProcessingTime: number; // in days
  byReason: {
    wrong_product: number;
    damaged: number;
    defective: number;
    expired: number;
    not_as_described: number;
    changed_mind: number;
    other: number;
  };
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
    refunded: number;
    cancelled: number;
  };
  topReturnedProducts: {
    productId: string;
    productName: string;
    returnCount: number;
    returnRate: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}