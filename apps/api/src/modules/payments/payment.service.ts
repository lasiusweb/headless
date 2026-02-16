import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private supabaseService: SupabaseService) {}

  async initiatePayment(createPaymentDto: CreatePaymentDto, userId: string) {
    // In a real implementation, this would call the payment gateway API
    // For now, we'll simulate the process

    // Get order details to validate the payment
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        *,
        user:profiles(role)
      `)
      .eq('id', createPaymentDto.orderId)
      .single();

    if (orderError) {
      throw new Error(`Order not found: ${orderError.message}`);
    }

    if (order.user_id !== userId) {
      throw new UnauthorizedException('You can only pay for your own orders');
    }

    // Check if order is approved before allowing payment
    if (order.status !== 'processing' && order.status !== 'confirmed') {
      // For B2B orders, ensure they have been approved
      if (['dealer', 'distributor'].includes(order.user.role) && order.status !== 'awaiting_approval') {
        throw new BadRequestException('Order must be approved before payment can be initiated');
      } else if (!['dealer', 'distributor'].includes(order.user.role) && order.status === 'awaiting_approval') {
        throw new BadRequestException('Order is awaiting approval before payment can be initiated');
      }
    }

    if (order.payment_status !== 'pending') {
      throw new BadRequestException('Order payment status is not pending');
    }

    // Generate a secure transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Generate a checksum for security
    const checksum = this.generateChecksum({
      orderId: order.id,
      amount: order.total_amount,
      transactionId,
      userId
    });

    // Create payment record
    const paymentData = {
      order_id: createPaymentDto.orderId,
      amount: order.total_amount,
      currency: order.currency || 'INR',
      payment_method: createPaymentDto.paymentMethod,
      transaction_id: transactionId,
      status: 'initiated',
      checksum: checksum,
      gateway_response: {
        message: 'Payment initiated successfully',
        order_id: order.order_number,
        amount: order.total_amount,
        currency: order.currency || 'INR',
      },
      created_by: userId,
    };

    const { data: payment, error: paymentError } = await this.supabaseService.getClient()
      .from('payment_transactions') // Assuming this table exists in the schema
      .insert([paymentData])
      .select()
      .single();

    if (paymentError) {
      this.logger.error(`Error creating payment record: ${paymentError.message}`);
      throw new Error(paymentError.message);
    }

    // Return payment initiation details
    // In a real implementation, this would redirect to the payment gateway
    return {
      success: true,
      message: 'Payment initiated successfully',
      paymentId: payment.id,
      orderId: order.id,
      orderNumber: order.order_number,
      amount: order.total_amount,
      currency: order.currency || 'INR',
      transactionId: transactionId,
      checksum: checksum,
      paymentUrl: this.generatePaymentUrl(createPaymentDto.paymentMethod, {
        orderId: order.order_number,
        amount: order.total_amount,
        transactionId,
        callbackUrl: createPaymentDto.callbackUrl,
        returnUrl: createPaymentDto.returnUrl,
        checksum
      }),
      gateway: createPaymentDto.paymentMethod,
    };
  }

  async verifyPayment(paymentId: string, gateway: string, gatewayData: any) {
    // In a real implementation, this would verify the payment with the gateway
    // For now, we'll simulate the verification

    const { data: payment, error: paymentError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        *,
        order:orders(order_number, total_amount, user_id, status)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      throw new Error(`Payment not found: ${paymentError.message}`);
    }

    // Verify the checksum for security
    const isValid = this.validateChecksum({
      orderId: payment.order_id,
      amount: payment.amount,
      transactionId: payment.transaction_id,
      userId: payment.created_by
    }, payment.checksum);

    if (!isValid) {
      throw new BadRequestException('Invalid checksum. Payment verification failed for security reasons.');
    }

    // Simulate verification with gateway
    // In a real implementation, this would call the gateway's verification API
    const isVerified = this.verifyWithGateway(gateway, gatewayData, payment.transaction_id);

    if (isVerified) {
      // Update payment status
      const { error: updateError } = await this.supabaseService.getClient()
        .from('payment_transactions')
        .update({
          status: 'completed',
          gateway_response: {
            ...payment.gateway_response,
            verified: true,
            verification_data: gatewayData
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) {
        this.logger.error(`Error updating payment status: ${updateError.message}`);
        throw new Error(updateError.message);
      }

      // Update order payment status
      const { error: orderUpdateError } = await this.supabaseService.getClient()
        .from('orders')
        .update({
          payment_status: 'paid',
          status: payment.order.status === 'awaiting_approval' ? 'processing' : 'confirmed' // Move to confirmed after payment
        })
        .eq('id', payment.order_id);

      if (orderUpdateError) {
        this.logger.error(`Error updating order payment status: ${orderUpdateError.message}`);
        // Don't throw error as payment was successful, just log it
      }

      return {
        success: true,
        message: 'Payment verified successfully',
        paymentId: payment.id,
        orderId: payment.order_id,
        orderNumber: payment.order.order_number,
        amount: payment.amount,
        status: 'completed',
      };
    } else {
      // Update payment status to failed
      const { error: updateError } = await this.supabaseService.getClient()
        .from('payment_transactions')
        .update({
          status: 'failed',
          gateway_response: {
            ...payment.gateway_response,
            verified: false,
            verification_data: gatewayData,
            error: 'Payment verification failed'
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) {
        this.logger.error(`Error updating payment status: ${updateError.message}`);
        throw new Error(updateError.message);
      }

      return {
        success: false,
        message: 'Payment verification failed',
        paymentId: payment.id,
        orderId: payment.order_id,
        status: 'failed',
      };
    }
  }

  async handleWebhook(gateway: string, payload: any) {
    // Handle payment gateway webhook notifications
    // This would be called by the payment gateway when payment status changes

    this.logger.log(`Received webhook from ${gateway}`, JSON.stringify(payload));

    // Extract transaction ID from webhook payload
    // This varies by payment gateway
    let transactionId;
    if (gateway === 'easebuzz') {
      transactionId = payload.txnid || payload.transaction_id;
    } else if (gateway === 'payu') {
      transactionId = payload.txnid || payload.transaction_id || payload.payuMoneyId;
    } else {
      throw new Error(`Unsupported payment gateway: ${gateway}`);
    }

    if (!transactionId) {
      throw new Error('Transaction ID not found in webhook payload');
    }

    // Find the payment record by transaction ID
    const { data: payment, error: paymentError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        *,
        order:orders(order_number, total_amount, user_id, status)
      `)
      .eq('transaction_id', transactionId)
      .single();

    if (paymentError) {
      this.logger.error(`Payment not found for transaction ID ${transactionId}: ${paymentError.message}`);
      throw new Error(`Payment not found for transaction ID: ${transactionId}`);
    }

    // Verify the webhook authenticity with the payment gateway
    const isWebhookValid = await this.validateWebhook(gateway, payload);
    if (!isWebhookValid) {
      this.logger.warn(`Invalid webhook received for transaction ${transactionId} from ${gateway}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    // Determine status from webhook payload
    let status = 'pending';
    let statusMessage = '';

    if (gateway === 'easebuzz') {
      if (payload.status === 'success') {
        status = 'completed';
        statusMessage = 'Payment successful via Easebuzz';
      } else if (payload.status === 'failure') {
        status = 'failed';
        statusMessage = 'Payment failed via Easebuzz';
      } else if (payload.status === 'pending') {
        status = 'pending';
        statusMessage = 'Payment pending via Easebuzz';
      }
    } else if (gateway === 'payu') {
      if (payload.status === 'success' || payload.status === 'captured') {
        status = 'completed';
        statusMessage = 'Payment successful via PayU';
      } else if (payload.status === 'failure' || payload.status === 'failed') {
        status = 'failed';
        statusMessage = 'Payment failed via PayU';
      } else if (payload.status === 'pending') {
        status = 'pending';
        statusMessage = 'Payment pending via PayU';
      }
    }

    // Update payment status
    const { error: updateError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .update({
        status: status,
        gateway_response: {
          ...payment.gateway_response,
          webhook_received: true,
          webhook_payload: payload,
          status_message: statusMessage
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      this.logger.error(`Error updating payment status: ${updateError.message}`);
      throw new Error(updateError.message);
    }

    // If payment was successful, update order status
    if (status === 'completed') {
      const { error: orderUpdateError } = await this.supabaseService.getClient()
        .from('orders')
        .update({
          payment_status: 'paid',
          status: payment.order.status === 'awaiting_approval' ? 'processing' : 'confirmed' // Move to confirmed after payment
        })
        .eq('id', payment.order_id);

      if (orderUpdateError) {
        this.logger.error(`Error updating order status: ${orderUpdateError.message}`);
        // Don't throw error as payment was successful, just log it
      }
    }

    return {
      success: true,
      message: `Webhook processed for transaction ${transactionId}`,
      status: status,
    };
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    // In a real implementation, this would call the payment gateway's refund API
    // For now, we'll simulate the refund process

    const { data: payment, error: paymentError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        *,
        order:orders(order_number, total_amount, user_id)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      throw new Error(`Payment not found: ${paymentError.message}`);
    }

    if (payment.status !== 'completed') {
      throw new BadRequestException('Cannot refund a payment that is not completed');
    }

    // Validate refund amount
    if (amount && amount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed the original payment amount');
    }

    // Generate a secure refund ID
    const refundId = `REF${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    // Simulate refund with gateway
    const refundAmount = amount || payment.amount;
    const isRefunded = this.processRefundWithGateway(payment.payment_method, payment.transaction_id, refundAmount);

    if (isRefunded) {
      // Update payment status to refunded
      const { error: updateError } = await this.supabaseService.getClient()
        .from('payment_transactions')
        .update({
          status: 'refunded',
          gateway_response: {
            ...payment.gateway_response,
            refunded: true,
            refund_id: refundId,
            refund_amount: refundAmount,
            refund_reason: reason
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) {
        this.logger.error(`Error updating payment status to refunded: ${updateError.message}`);
        throw new Error(updateError.message);
      }

      // Update order payment status
      const { error: orderUpdateError } = await this.supabaseService.getClient()
        .from('orders')
        .update({
          payment_status: 'refunded',
          status: 'cancelled' // Cancel order when refunded
        })
        .eq('id', payment.order_id);

      if (orderUpdateError) {
        this.logger.error(`Error updating order status after refund: ${orderUpdateError.message}`);
        // Don't throw error as refund was processed, just log it
      }

      return {
        success: true,
        message: 'Refund processed successfully',
        refundId: refundId,
        paymentId: payment.id,
        orderId: payment.order_id,
        refundAmount: refundAmount,
        status: 'refunded',
      };
    } else {
      throw new Error('Refund failed at gateway level');
    }
  }

  /**
   * Process partial payment for an order
   */
  async processPartialPayment(orderId: string, userId: string, amount: number) {
    // Get order details
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error(`Order not found: ${orderError.message}`);
    }

    if (order.user_id !== userId) {
      throw new UnauthorizedException('You can only make partial payments for your own orders');
    }

    if (order.payment_status === 'paid') {
      throw new BadRequestException('Order is already fully paid');
    }

    if (amount <= 0) {
      throw new BadRequestException('Partial payment amount must be greater than zero');
    }

    if (amount > order.total_amount) {
      throw new BadRequestException('Partial payment amount cannot exceed the total order amount');
    }

    // Generate a secure transaction ID for the partial payment
    const transactionId = `PARTIAL_TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Generate a checksum for security
    const checksum = this.generateChecksum({
      orderId: order.id,
      amount: amount,
      transactionId,
      userId,
      isPartial: true
    });

    // Create payment record for the partial payment
    const paymentData = {
      order_id: orderId,
      amount: amount,
      currency: order.currency || 'INR',
      payment_method: 'partial_payment', // Special method for partial payments
      transaction_id: transactionId,
      status: 'initiated',
      checksum: checksum,
      gateway_response: {
        message: 'Partial payment initiated successfully',
        order_id: order.order_number,
        amount: amount,
        currency: order.currency || 'INR',
        is_partial: true
      },
      created_by: userId,
    };

    const { data: payment, error: paymentError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .insert([paymentData])
      .select()
      .single();

    if (paymentError) {
      this.logger.error(`Error creating partial payment record: ${paymentError.message}`);
      throw new Error(paymentError.message);
    }

    return {
      success: true,
      message: 'Partial payment initiated successfully',
      paymentId: payment.id,
      orderId: order.id,
      orderNumber: order.order_number,
      amount: amount,
      currency: order.currency || 'INR',
      transactionId: transactionId,
      checksum: checksum,
      paymentUrl: this.generatePaymentUrl('partial_payment', {
        orderId: order.order_number,
        amount: amount,
        transactionId,
        checksum
      }),
      gateway: 'partial_payment',
      isPartial: true,
    };
  }

  /**
   * Get payment history for a user
   */
  async getUserPaymentHistory(userId: string) {
    const { data: payments, error } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        *,
        order:orders(order_number, total_amount, status)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return payments;
  }

  /**
   * Generate checksum for payment security
   */
  private generateChecksum(data: any): string {
    // In a real implementation, you would use the payment gateway's checksum algorithm
    // For example, with PayU: hash the concatenated string of required parameters with merchant salt
    const dataString = JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Validate checksum for payment security
   */
  private validateChecksum(data: any, expectedChecksum: string): boolean {
    const calculatedChecksum = this.generateChecksum(data);
    return calculatedChecksum === expectedChecksum;
  }

  /**
   * Validate webhook authenticity
   */
  private async validateWebhook(gateway: string, payload: any): Promise<boolean> {
    // In a real implementation, you would validate the webhook signature
    // using the payment gateway's specific method
    // For example, with PayU: verify the hash using merchant key and salt
    
    // For simulation purposes, we'll return true
    // In production, implement the actual validation logic
    return true;
  }

  /**
   * Generate payment URL based on gateway
   */
  private generatePaymentUrl(gateway: string, params: any): string {
    // In a real implementation, you would generate the actual payment gateway URL
    // with the required parameters
    
    switch (gateway) {
      case 'easebuzz':
        return `https://easebuzz.com/pay?order_id=${params.orderId}&amount=${params.amount}&txn_id=${params.transactionId}`;
      case 'payu':
        return `https://secure.payu.in/_payment?order_id=${params.orderId}&amount=${params.amount}&txnid=${params.transactionId}`;
      case 'razorpay':
        return `https://checkout.razorpay.com/v1/checkout?key_id=YOUR_KEY_ID&order_id=${params.orderId}&amount=${params.amount}`;
      case 'stripe':
        return `https://checkout.stripe.com/pay?sessionId=cs_${params.transactionId}`;
      case 'partial_payment':
        return `https://kn-biosciences.com/pay/partial?order_id=${params.orderId}&amount=${params.amount}&txn_id=${params.transactionId}`;
      default:
        return `https://example-gateway.com/pay/${params.transactionId}`;
    }
  }

  private verifyWithGateway(gateway: string, gatewayData: any, transactionId: string): boolean {
    // In a real implementation, this would call the payment gateway's verification API
    // For simulation purposes, we'll return true for successful verification
    // In production, you would validate the data with the gateway's API

    this.logger.log(`Verifying payment with ${gateway} for transaction ${transactionId}`);

    // Simulate verification - in real implementation, call gateway API
    // Example: Call Easebuzz/PayU verification endpoint
    return true; // Simulated success
  }

  private processRefundWithGateway(gateway: string, transactionId: string, amount: number): boolean {
    // In a real implementation, this would call the payment gateway's refund API
    // For simulation purposes, we'll return true for successful refund
    // In production, you would process the refund with the gateway's API

    this.logger.log(`Processing refund with ${gateway} for transaction ${transactionId}, amount: ${amount}`);

    // Simulate refund - in real implementation, call gateway refund API
    return true; // Simulated success
  }
}