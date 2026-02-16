import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(private supabaseService: SupabaseService) {}

  async initiatePayment(createPaymentDto: CreatePaymentDto, userId: string) {
    // Get order details to calculate amount and validate
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
      throw new Error('Unauthorized: You can only pay for your own orders');
    }

    if (order.status !== 'pending') {
      throw new Error('Order is not in pending state');
    }

    // Calculate final amount based on user role (dealer/distributor pricing)
    let finalAmount = order.total_amount;
    
    // If user is dealer or distributor, we might have already calculated the discounted price
    // In a real implementation, this would be handled during order creation

    // Generate a unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Create payment record
    const { data: payment, error: paymentError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .insert([
        {
          order_id: createPaymentDto.orderId,
          amount: finalAmount,
          currency: 'INR',
          payment_method: createPaymentDto.method,
          transaction_id: transactionId,
          status: 'initiated',
          gateway_data: {
            method: createPaymentDto.method,
            ...(createPaymentDto.method === 'upi' && {
              upi_id: createPaymentDto.upiId
            }),
            ...(createPaymentDto.method === 'card' && {
              card_last_four: createPaymentDto.cardNumber?.slice(-4),
              card_type: createPaymentDto.cardType
            }),
            ...(createPaymentDto.method === 'net_banking' && {
              bank_code: createPaymentDto.bankCode
            })
          },
          created_by: userId,
        }
      ])
      .select()
      .single();

    if (paymentError) {
      this.logger.error(`Error creating payment record: ${paymentError.message}`);
      throw new Error(paymentError.message);
    }

    // Based on payment method, prepare gateway-specific data
    let gatewayResponse;
    switch (createPaymentDto.method) {
      case 'easebuzz':
        gatewayResponse = await this.processEasebuzzPayment(payment);
        break;
      case 'payu':
        gatewayResponse = await this.processPayUPayment(payment);
        break;
      case 'razorpay':
        gatewayResponse = await this.processRazorpayPayment(payment);
        break;
      case 'cod':
        // For COD, we just update the payment status to completed
        await this.updatePaymentStatus(payment.id, 'completed');
        return {
          success: true,
          paymentId: payment.id,
          orderId: payment.order_id,
          status: 'completed',
          message: 'Cash on delivery order placed successfully',
          transactionId: payment.transaction_id,
        };
      default:
        throw new Error(`Unsupported payment method: ${createPaymentDto.method}`);
    }

    return gatewayResponse;
  }

  private async processEasebuzzPayment(payment: any) {
    // In a real implementation, this would call the Easebuzz API
    // For now, we'll simulate the response
    this.logger.log(`Processing Easebuzz payment for transaction: ${payment.transaction_id}`);

    // Simulate API call to Easebuzz
    // const response = await this.httpService.post(easebuzzEndpoint, {
    //   key: process.env.EASEBUZZ_KEY,
    //   transaction_id: payment.transaction_id,
    //   amount: payment.amount,
    //   product_info: 'KN Biosciences Products',
    //   customer_name: payment.customer_name,
    //   customer_email: payment.customer_email,
    //   customer_phone: payment.customer_phone,
    //   redirect_url: `${process.env.FRONTEND_URL}/payment/callback/easebuzz`,
    //   cancel_url: `${process.env.FRONTEND_URL}/cart`,
    // });

    // For demo purposes, return a simulated response
    return {
      success: true,
      paymentId: payment.id,
      orderId: payment.order_id,
      status: 'initiated',
      message: 'Payment initiated successfully',
      transactionId: payment.transaction_id,
      gateway: 'easebuzz',
      paymentUrl: `https://demo.easebuzz.in/${payment.transaction_id}`, // Demo URL
    };
  }

  private async processPayUPayment(payment: any) {
    // In a real implementation, this would call the PayU API
    this.logger.log(`Processing PayU payment for transaction: ${payment.transaction_id}`);

    // For demo purposes, return a simulated response
    return {
      success: true,
      paymentId: payment.id,
      orderId: payment.order_id,
      status: 'initiated',
      message: 'Payment initiated successfully',
      transactionId: payment.transaction_id,
      gateway: 'payu',
      paymentUrl: `https://secure.payu.in/${payment.transaction_id}`, // Demo URL
    };
  }

  private async processRazorpayPayment(payment: any) {
    // In a real implementation, this would call the Razorpay API
    this.logger.log(`Processing Razorpay payment for transaction: ${payment.transaction_id}`);

    // For demo purposes, return a simulated response
    return {
      success: true,
      paymentId: payment.id,
      orderId: payment.order_id,
      status: 'initiated',
      message: 'Payment initiated successfully',
      transactionId: payment.transaction_id,
      gateway: 'razorpay',
      paymentUrl: `https://checkout.razorpay.com/${payment.transaction_id}`, // Demo URL
    };
  }

  async verifyPayment(paymentId: string, gateway: string, gatewayData: any) {
    const { data: payment, error: paymentError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        *,
        order:orders(total_amount, user_id)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      throw new Error(`Payment not found: ${paymentError.message}`);
    }

    let isVerified = false;
    let gatewayResponse;

    // In a real implementation, this would verify with the payment gateway
    switch (gateway) {
      case 'easebuzz':
        gatewayResponse = await this.verifyEasebuzzPayment(payment, gatewayData);
        isVerified = gatewayResponse.status === 'success';
        break;
      case 'payu':
        gatewayResponse = await this.verifyPayUPayment(payment, gatewayData);
        isVerified = gatewayResponse.status === 'success';
        break;
      case 'razorpay':
        gatewayResponse = await this.verifyRazorpayPayment(payment, gatewayData);
        isVerified = gatewayResponse.status === 'captured';
        break;
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }

    if (isVerified) {
      // Update payment status to completed
      await this.updatePaymentStatus(paymentId, 'completed');
      
      // Update order status to confirmed
      await this.updateOrderStatus(payment.order_id, 'confirmed');
      
      // Update inventory - decrease stock for ordered items
      await this.updateInventoryForOrder(payment.order_id);
      
      return {
        success: true,
        paymentId,
        orderId: payment.order_id,
        status: 'verified',
        message: 'Payment verified successfully',
      };
    } else {
      // Update payment status to failed
      await this.updatePaymentStatus(paymentId, 'failed');
      
      return {
        success: false,
        paymentId,
        orderId: payment.order_id,
        status: 'failed',
        message: gatewayResponse.message || 'Payment verification failed',
      };
    }
  }

  private async verifyEasebuzzPayment(payment: any, gatewayData: any) {
    // In a real implementation, this would call the Easebuzz verification API
    this.logger.log(`Verifying Easebuzz payment: ${payment.transaction_id}`);
    
    // Simulate verification response
    return {
      status: 'success',
      transactionId: payment.transaction_id,
      amount: payment.amount,
      message: 'Payment verified successfully'
    };
  }

  private async verifyPayUPayment(payment: any, gatewayData: any) {
    // In a real implementation, this would call the PayU verification API
    this.logger.log(`Verifying PayU payment: ${payment.transaction_id}`);
    
    // Simulate verification response
    return {
      status: 'success',
      transactionId: payment.transaction_id,
      amount: payment.amount,
      message: 'Payment verified successfully'
    };
  }

  private async verifyRazorpayPayment(payment: any, gatewayData: any) {
    // In a real implementation, this would call the Razorpay verification API
    this.logger.log(`Verifying Razorpay payment: ${payment.transaction_id}`);
    
    // Simulate verification response
    return {
      status: 'captured',
      transactionId: payment.transaction_id,
      amount: payment.amount,
      message: 'Payment verified successfully'
    };
  }

  async updatePaymentStatus(paymentId: string, status: string) {
    const { error } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (error) {
      this.logger.error(`Error updating payment status: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    const { error } = await this.supabaseService.getClient()
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      this.logger.error(`Error updating order status: ${error.message}`);
      throw new Error(error.message);
    }
  }

  private async updateInventoryForOrder(orderId: string) {
    // Get order items
    const { data: orderItems, error: itemsError } = await this.supabaseService.getClient()
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

    if (itemsError) {
      this.logger.error(`Error getting order items: ${itemsError.message}`);
      throw new Error(itemsError.message);
    }

    // For each item, reduce inventory
    for (const item of orderItems) {
      await this.reduceInventory(item.variant_id, item.quantity);
    }
  }

  private async reduceInventory(variantId: string, quantity: number) {
    // Get current inventory
    const { data: inventory, error: inventoryError } = await this.supabaseService.getClient()
      .from('inventory')
      .select('id, available_quantity')
      .eq('variant_id', variantId)
      .single();

    if (inventoryError) {
      this.logger.error(`Error getting inventory: ${inventoryError.message}`);
      throw new Error(inventoryError.message);
    }

    if (inventory.available_quantity < quantity) {
      throw new Error(`Insufficient inventory for variant ${variantId}. Available: ${inventory.available_quantity}, Required: ${quantity}`);
    }

    // Update inventory
    const { error: updateError } = await this.supabaseService.getClient()
      .from('inventory')
      .update({
        available_quantity: inventory.available_quantity - quantity,
        reserved_quantity: inventory.reserved_quantity - quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventory.id);

    if (updateError) {
      this.logger.error(`Error updating inventory: ${updateError.message}`);
      throw new Error(updateError.message);
    }

    // Log the inventory change
    await this.supabaseService.getClient()
      .from('inventory_logs')
      .insert({
        variant_id: variantId,
        change_type: 'sale',
        change_quantity: -quantity,
        new_quantity: inventory.available_quantity - quantity,
        reason: 'Order fulfillment',
        created_by: 'system', // In a real implementation, this would be the user ID
      });
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    const { data: payment, error: paymentError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select(`
        *,
        order:orders(status)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      throw new Error(`Payment not found: ${paymentError.message}`);
    }

    if (payment.status !== 'completed') {
      throw new Error('Cannot refund a payment that is not completed');
    }

    if (payment.order.status !== 'delivered' && reason !== 'order_cancelled') {
      throw new Error('Refunds are typically only allowed for delivered orders');
    }

    // In a real implementation, this would call the payment gateway's refund API
    let refundResponse;
    switch (payment.payment_method) {
      case 'easebuzz':
        refundResponse = await this.processEasebuzzRefund(payment, amount, reason);
        break;
      case 'payu':
        refundResponse = await this.processPayURefund(payment, amount, reason);
        break;
      case 'razorpay':
        refundResponse = await this.processRazorpayRefund(payment, amount, reason);
        break;
      default:
        throw new Error(`Refund not supported for payment method: ${payment.payment_method}`);
    }

    if (refundResponse.success) {
      // Update payment status to refunded
      await this.updatePaymentStatus(paymentId, 'refunded');
      
      // Update order status to refunded
      await this.updateOrderStatus(payment.order_id, 'refunded');
      
      // Increase inventory for refunded items
      await this.increaseInventoryForRefund(payment.order_id);
      
      return {
        success: true,
        refundId: refundResponse.refundId,
        paymentId,
        orderId: payment.order_id,
        refundedAmount: refundResponse.refundedAmount,
        status: 'refunded',
        message: 'Refund processed successfully',
      };
    } else {
      throw new Error(refundResponse.message || 'Refund failed');
    }
  }

  private async processEasebuzzRefund(payment: any, amount?: number, reason?: string) {
    // In a real implementation, this would call the Easebuzz refund API
    this.logger.log(`Processing Easebuzz refund for transaction: ${payment.transaction_id}`);
    
    // Simulate refund response
    return {
      success: true,
      refundId: `RFND${Date.now()}`,
      refundedAmount: amount || payment.amount,
      message: 'Refund processed successfully'
    };
  }

  private async processPayURefund(payment: any, amount?: number, reason?: string) {
    // In a real implementation, this would call the PayU refund API
    this.logger.log(`Processing PayU refund for transaction: ${payment.transaction_id}`);
    
    // Simulate refund response
    return {
      success: true,
      refundId: `RFND${Date.now()}`,
      refundedAmount: amount || payment.amount,
      message: 'Refund processed successfully'
    };
  }

  private async processRazorpayRefund(payment: any, amount?: number, reason?: string) {
    // In a real implementation, this would call the Razorpay refund API
    this.logger.log(`Processing Razorpay refund for transaction: ${payment.transaction_id}`);
    
    // Simulate refund response
    return {
      success: true,
      refundId: `RFND${Date.now()}`,
      refundedAmount: amount || payment.amount,
      message: 'Refund processed successfully'
    };
  }

  private async increaseInventoryForRefund(orderId: string) {
    // Get order items
    const { data: orderItems, error: itemsError } = await this.supabaseService.getClient()
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

    if (itemsError) {
      this.logger.error(`Error getting order items for refund: ${itemsError.message}`);
      throw new Error(itemsError.message);
    }

    // For each item, increase inventory
    for (const item of orderItems) {
      await this.increaseInventory(item.variant_id, item.quantity);
    }
  }

  private async increaseInventory(variantId: string, quantity: number) {
    // Get current inventory
    const { data: inventory, error: inventoryError } = await this.supabaseService.getClient()
      .from('inventory')
      .select('id, available_quantity')
      .eq('variant_id', variantId)
      .single();

    if (inventoryError) {
      this.logger.error(`Error getting inventory for refund: ${inventoryError.message}`);
      throw new Error(inventoryError.message);
    }

    // Update inventory
    const { error: updateError } = await this.supabaseService.getClient()
      .from('inventory')
      .update({
        available_quantity: inventory.available_quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventory.id);

    if (updateError) {
      this.logger.error(`Error updating inventory for refund: ${updateError.message}`);
      throw new Error(updateError.message);
    }

    // Log the inventory change
    await this.supabaseService.getClient()
      .from('inventory_logs')
      .insert({
        variant_id: variantId,
        change_type: 'refund',
        change_quantity: quantity,
        new_quantity: inventory.available_quantity + quantity,
        reason: 'Order refund',
        created_by: 'system', // In a real implementation, this would be the user ID
      });
  }
}