export interface PaymentIntent {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'created' | 'initiated' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'card' | 'net_banking' | 'upi' | 'wallet' | 'emi';
  gateway: 'easebuzz' | 'payu';
  gatewayTransactionId?: string;
  gatewayOrderId?: string;
  paymentToken?: string;
  returnUrl?: string;
  webhookUrl?: string;
  failureReason?: string;
  refundedAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentWebhookPayload {
  id: string;
  transaction_id: string;
  order_id: string;
  amount: number;
  status: 'success' | 'failure' | 'pending';
  payment_mode: string;
  bank_ref_num: string;
  card_num: string;
  bank_code: string;
  gateway_name: string;
  gateway_order_id: string;
  checksum: string;
}

export interface RefundRequest {
  id: string;
  paymentIntentId: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'requested' | 'processed' | 'failed';
  gatewayRefundId?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentConfig {
  easebuzz: {
    merchant_key: string;
    salt: string;
    environment: 'test' | 'production';
    webhook_url: string;
  };
  payu: {
    merchant_key: string;
    salt: string;
    environment: 'test' | 'production';
    webhook_url: string;
  };
}