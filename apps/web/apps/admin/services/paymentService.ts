// services/paymentService.ts
import { PaymentIntent, RefundRequest } from '../api/src/modules/payments/interfaces/payment.interface';
import { CreatePaymentIntentDto, ProcessPaymentWebhookDto, RefundPaymentDto } from '../api/src/modules/payments/dto/payment.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the payment API
 */
export class PaymentService {
  /**
   * Creates a new payment intent
   */
  static async createPaymentIntent(data: CreatePaymentIntentDto): Promise<PaymentIntent> {
    const response = await fetch(`${API_BASE_URL}/payments/intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create payment intent: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Initiates a refund for a payment
   */
  static async initiateRefund(data: RefundPaymentDto): Promise<RefundRequest> {
    const response = await fetch(`${API_BASE_URL}/payments/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to initiate refund: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a payment intent by ID
   */
  static async getPaymentIntentById(id: string): Promise<PaymentIntent> {
    const response = await fetch(`${API_BASE_URL}/payments/intent/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch payment intent: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets payment intents by order ID
   */
  static async getPaymentIntentsByOrder(orderId: string): Promise<PaymentIntent[]> {
    const response = await fetch(`${API_BASE_URL}/payments/intent/order/${orderId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch payment intents for order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets a refund request by ID
   */
  static async getRefundRequestById(id: string): Promise<RefundRequest> {
    const response = await fetch(`${API_BASE_URL}/payments/refund/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch refund request: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets refund requests by order ID
   */
  static async getRefundRequestsByOrder(orderId: string): Promise<RefundRequest[]> {
    const response = await fetch(`${API_BASE_URL}/payments/refund/order/${orderId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch refund requests for order: ${response.statusText}`);
    }

    return response.json();
  }
}