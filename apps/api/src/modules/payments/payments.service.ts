import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentIntentDto, ProcessPaymentWebhookDto, RefundPaymentDto } from './dto/payment.dto';
import { PaymentIntent, RefundRequest } from './interfaces/payment.interface';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private paymentIntents: PaymentIntent[] = [];
  private refundRequests: RefundRequest[] = [];

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {}

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<PaymentIntent> {
    // Create a new payment intent
    const paymentIntent: PaymentIntent = {
      id: Math.random().toString(36).substring(7),
      ...createPaymentIntentDto,
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.paymentIntents.push(paymentIntent);

    // Process the payment based on the selected gateway
    if (createPaymentIntentDto.gateway === 'easebuzz') {
      return this.processWithEasebuzz(paymentIntent);
    } else if (createPaymentIntentDto.gateway === 'payu') {
      return this.processWithPayU(paymentIntent);
    } else {
      throw new Error(`Unsupported payment gateway: ${createPaymentIntentDto.gateway}`);
    }
  }

  private async processWithEasebuzz(paymentIntent: PaymentIntent): Promise<PaymentIntent> {
    // In a real implementation, this would call the Easebuzz API
    // For now, we'll simulate the process
    
    // Get Easebuzz configuration
    const easebuzzConfig = {
      merchant_key: this.configService.get<string>('EASEBUZZ_MERCHANT_KEY'),
      salt: this.configService.get<string>('EASEBUZZ_SALT'),
      environment: this.configService.get<'test' | 'production'>('EASEBUZZ_ENVIRONMENT') || 'test',
    };

    // Simulate creating a payment on Easebuzz
    const gatewayOrderId = `EZBZ${Date.now()}`;
    const paymentToken = Math.random().toString(36).substring(2, 15);

    // Update the payment intent with gateway-specific information
    const index = this.paymentIntents.findIndex(p => p.id === paymentIntent.id);
    if (index !== -1) {
      this.paymentIntents[index] = {
        ...this.paymentIntents[index],
        status: 'initiated',
        gatewayOrderId,
        paymentToken,
        updatedAt: new Date(),
      };
    }

    this.logger.log(`Payment initiated with Easebuzz for order ${paymentIntent.orderId}, gateway order ID: ${gatewayOrderId}`);

    return this.paymentIntents[index];
  }

  private async processWithPayU(paymentIntent: PaymentIntent): Promise<PaymentIntent> {
    // In a real implementation, this would call the PayU API
    // For now, we'll simulate the process
    
    // Get PayU configuration
    const payuConfig = {
      merchant_key: this.configService.get<string>('PAYU_MERCHANT_KEY'),
      salt: this.configService.get<string>('PAYU_SALT'),
      environment: this.configService.get<'test' | 'production'>('PAYU_ENVIRONMENT') || 'test',
    };

    // Simulate creating a payment on PayU
    const gatewayOrderId = `PAYU${Date.now()}`;
    const paymentToken = Math.random().toString(36).substring(2, 15);

    // Update the payment intent with gateway-specific information
    const index = this.paymentIntents.findIndex(p => p.id === paymentIntent.id);
    if (index !== -1) {
      this.paymentIntents[index] = {
        ...this.paymentIntents[index],
        status: 'initiated',
        gatewayOrderId,
        paymentToken,
        updatedAt: new Date(),
      };
    }

    this.logger.log(`Payment initiated with PayU for order ${paymentIntent.orderId}, gateway order ID: ${gatewayOrderId}`);

    return this.paymentIntents[index];
  }

  async processWebhook(payload: ProcessPaymentWebhookDto): Promise<boolean> {
    // Find the payment intent by gateway order ID
    const paymentIndex = this.paymentIntents.findIndex(
      p => p.gatewayOrderId === payload.gateway_order_id && p.gateway === payload.gateway_name.toLowerCase()
    );

    if (paymentIndex === -1) {
      this.logger.warn(`Payment intent not found for gateway order ID: ${payload.gateway_order_id}`);
      return false;
    }

    const paymentIntent = this.paymentIntents[paymentIndex];

    // Update payment status based on webhook
    let newStatus: PaymentIntent['status'] = paymentIntent.status;
    let failureReason: string | undefined;

    if (payload.status === 'success') {
      newStatus = 'completed';
    } else if (payload.status === 'failure') {
      newStatus = 'failed';
      failureReason = `Payment failed via ${payload.gateway_name}`;
    } else if (payload.status === 'pending') {
      newStatus = 'processing';
    }

    // Update the payment intent
    this.paymentIntents[paymentIndex] = {
      ...paymentIntent,
      status: newStatus,
      gatewayTransactionId: payload.transaction_id,
      failureReason,
      updatedAt: new Date(),
    };

    // Update the associated order's payment status
    await this.ordersService.updateOrder(paymentIntent.orderId, {
      paymentStatus: newStatus === 'completed' ? 'paid' : 
                    newStatus === 'failed' ? 'failed' : 
                    'pending',
    });

    this.logger.log(`Payment status updated to ${newStatus} for order ${paymentIntent.orderId}`);

    return true;
  }

  async initiateRefund(refundPaymentDto: RefundPaymentDto): Promise<RefundRequest> {
    // Find the payment intent
    const paymentIntent = this.paymentIntents.find(p => p.id === refundPaymentDto.paymentIntentId);
    if (!paymentIntent) {
      throw new Error(`Payment intent with ID ${refundPaymentDto.paymentIntentId} not found`);
    }

    if (paymentIntent.status !== 'completed') {
      throw new Error(`Cannot refund payment with status: ${paymentIntent.status}`);
    }

    if (refundPaymentDto.amount > paymentIntent.amount) {
      throw new Error(`Refund amount (${refundPaymentDto.amount}) exceeds payment amount (${paymentIntent.amount})`);
    }

    // Create a refund request
    const refundRequest: RefundRequest = {
      id: Math.random().toString(36).substring(7),
      paymentIntentId: refundPaymentDto.paymentIntentId,
      orderId: paymentIntent.orderId,
      amount: refundPaymentDto.amount,
      reason: refundPaymentDto.reason,
      status: 'requested',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.refundRequests.push(refundRequest);

    // Process the refund based on the original payment gateway
    if (paymentIntent.gateway === 'easebuzz') {
      await this.processRefundWithEasebuzz(refundRequest);
    } else if (paymentIntent.gateway === 'payu') {
      await this.processRefundWithPayU(refundRequest);
    }

    return refundRequest;
  }

  private async processRefundWithEasebuzz(refundRequest: RefundRequest): Promise<void> {
    // In a real implementation, this would call the Easebuzz refund API
    // For now, we'll simulate the process
    
    // Simulate refund processing
    setTimeout(async () => {
      const refundIndex = this.refundRequests.findIndex(r => r.id === refundRequest.id);
      if (refundIndex !== -1) {
        this.refundRequests[refundIndex] = {
          ...this.refundRequests[refundIndex],
          status: 'processed',
          gatewayRefundId: `REF_EZBZ_${Date.now()}`,
          processedAt: new Date(),
          updatedAt: new Date(),
        };

        // Update the payment intent to reflect the refund
        const paymentIndex = this.paymentIntents.findIndex(
          p => p.id === refundRequest.paymentIntentId
        );
        if (paymentIndex !== -1) {
          this.paymentIntents[paymentIndex] = {
            ...this.paymentIntents[paymentIndex],
            refundedAmount: (this.paymentIntents[paymentIndex].refundedAmount || 0) + refundRequest.amount,
            refundReason: refundRequest.reason,
            refundedAt: new Date(),
            updatedAt: new Date(),
          };
        }

        this.logger.log(`Refund processed for payment ${refundRequest.paymentIntentId}, amount: ${refundRequest.amount}`);
      }
    }, 2000); // Simulate processing delay
  }

  private async processRefundWithPayU(refundRequest: RefundRequest): Promise<void> {
    // In a real implementation, this would call the PayU refund API
    // For now, we'll simulate the process
    
    // Simulate refund processing
    setTimeout(async () => {
      const refundIndex = this.refundRequests.findIndex(r => r.id === refundRequest.id);
      if (refundIndex !== -1) {
        this.refundRequests[refundIndex] = {
          ...this.refundRequests[refundIndex],
          status: 'processed',
          gatewayRefundId: `REF_PAYU_${Date.now()}`,
          processedAt: new Date(),
          updatedAt: new Date(),
        };

        // Update the payment intent to reflect the refund
        const paymentIndex = this.paymentIntents.findIndex(
          p => p.id === refundRequest.paymentIntentId
        );
        if (paymentIndex !== -1) {
          this.paymentIntents[paymentIndex] = {
            ...this.paymentIntents[paymentIndex],
            refundedAmount: (this.paymentIntents[paymentIndex].refundedAmount || 0) + refundRequest.amount,
            refundReason: refundRequest.reason,
            refundedAt: new Date(),
            updatedAt: new Date(),
          };
        }

        this.logger.log(`Refund processed for payment ${refundRequest.paymentIntentId}, amount: ${refundRequest.amount}`);
      }
    }, 2000); // Simulate processing delay
  }

  async getPaymentIntentById(id: string): Promise<PaymentIntent> {
    const paymentIntent = this.paymentIntents.find(p => p.id === id);
    if (!paymentIntent) {
      throw new Error(`Payment intent with ID ${id} not found`);
    }
    return paymentIntent;
  }

  async getPaymentIntentsByOrder(orderId: string): Promise<PaymentIntent[]> {
    return this.paymentIntents.filter(p => p.orderId === orderId);
  }

  async getRefundRequestById(id: string): Promise<RefundRequest> {
    const refundRequest = this.refundRequests.find(r => r.id === id);
    if (!refundRequest) {
      throw new Error(`Refund request with ID ${id} not found`);
    }
    return refundRequest;
  }

  async getRefundRequestsByOrder(orderId: string): Promise<RefundRequest[]> {
    return this.refundRequests.filter(r => r.orderId === orderId);
  }
}