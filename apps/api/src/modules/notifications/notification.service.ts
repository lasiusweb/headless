import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationWsProvider } from './providers/notification-ws.provider';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private supabaseService: SupabaseService,
    private notificationWsProvider: NotificationWsProvider
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('notifications')
      .insert([
        {
          user_id: createNotificationDto.userId,
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          type: createNotificationDto.type,
          priority: createNotificationDto.priority || 'medium',
          is_read: false,
          channel_preferences: createNotificationDto.channelPreferences || ['in_app'], // Default to in-app only
          data: createNotificationDto.data || {},
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Send the notification through all requested channels
    await this.sendMultiChannelNotification(data);

    return data;
  }

  async findAll(userId: string, filters?: {
    type?: string;
    isRead?: boolean;
    priority?: string;
    limit?: number;
    offset?: number
  }) {
    let query = this.supabaseService.getClient()
      .from('notifications')
      .select(`
        *,
        user:profiles(first_name, last_name, email)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.isRead !== undefined) {
      query = query.eq('is_read', filters.isRead);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string, userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('notifications')
      .select(`
        *,
        user:profiles(first_name, last_name, email)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('notifications')
      .update({
        ...updateNotificationDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async markAsRead(id: string, userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async markAllAsRead(userId: string, type?: string) {
    let query = this.supabaseService.getClient()
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Notifications marked as read successfully' };
  }

  async remove(id: string, userId: string) {
    const { error } = await this.supabaseService.getClient()
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: string) {
    const { count, error } = await this.supabaseService.getClient()
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(error.message);
    }

    return { unreadCount: count };
  }

  /**
   * Send notification through multiple channels (in-app, email, SMS, push)
   */
  async sendMultiChannelNotification(notification: any) {
    const { data: user, error: userError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('email, phone, notification_preferences')
      .eq('id', notification.user_id)
      .single();

    if (userError) {
      this.logger.error(`Error getting user for notification: ${userError.message}`);
      // Still send in-app notification even if user details couldn't be retrieved
      return;
    }

    // Send in-app notification (always sent)
    await this.notificationWsProvider.sendNotificationToUser(notification.user_id, notification);

    // Send email if enabled in preferences
    if (user.notification_preferences?.email) {
      await this.sendEmailNotification(notification, user.email);
    }

    // Send SMS if enabled in preferences and phone number exists
    if (user.notification_preferences?.sms && user.phone) {
      await this.sendSmsNotification(notification, user.phone);
    }

    // Send push notification if enabled in preferences
    if (user.notification_preferences?.push) {
      await this.sendPushNotification(notification, notification.user_id);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: any, recipientEmail: string) {
    // In a real implementation, this would use an email service like SendGrid, Mailgun, etc.
    // For now, we'll log the email that would be sent
    this.logger.log(`Would send email notification to ${recipientEmail}: ${notification.title} - ${notification.message}`);
    
    // In a real implementation:
    // await this.emailService.send({
    //   to: recipientEmail,
    //   subject: notification.title,
    //   template: 'notification-template',
    //   data: { ...notification, user_email: recipientEmail }
    // });
  }

  /**
   * Send SMS notification
   */
  private async sendSmsNotification(notification: any, phoneNumber: string) {
    // In a real implementation, this would use an SMS service like Twilio, MSG91, etc.
    // For now, we'll log the SMS that would be sent
    this.logger.log(`Would send SMS notification to ${phoneNumber}: ${notification.message}`);
    
    // In a real implementation:
    // await this.smsService.send({
    //   to: phoneNumber,
    //   message: `${notification.title}: ${notification.message}`
    // });
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: any, userId: string) {
    // In a real implementation, this would use Firebase Cloud Messaging or similar
    // For now, we'll log the push notification that would be sent
    this.logger.log(`Would send push notification to user ${userId}: ${notification.title}`);
    
    // In a real implementation:
    // const { data: devices, error } = await this.supabaseService.getClient()
    //   .from('user_devices')
    //   .select('device_token')
    //   .eq('user_id', userId);
    // 
    // if (!error && devices) {
    //   for (const device of devices) {
    //     await this.pushService.sendToDevice(device.device_token, {
    //       title: notification.title,
    //       body: notification.message,
    //       data: notification.data
    //     });
    //   }
    // }
  }

  /**
   * System notification methods
   */

  async sendOrderStatusUpdate(orderId: string, newStatus: string, userId: string) {
    const { data: order, error: orderError } = await this.supabaseService.getClient()
      .from('orders')
      .select(`
        order_number,
        total_amount,
        user:profiles(notification_preferences)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error(`Order not found: ${orderError.message}`);
    }

    // Determine notification message based on status
    let message = '';
    switch (newStatus) {
      case 'confirmed':
        message = `Your order #${order.order_number} has been confirmed and is being processed.`;
        break;
      case 'processing':
        message = `Your order #${order.order_number} is being prepared for shipment.`;
        break;
      case 'shipped':
        message = `Your order #${order.order_number} has been shipped.`;
        break;
      case 'delivered':
        message = `Your order #${order.order_number} has been delivered.`;
        break;
      case 'cancelled':
        message = `Your order #${order.order_number} has been cancelled.`;
        break;
      default:
        message = `Your order #${order.order_number} has been updated to ${newStatus}.`;
    }

    return this.create({
      userId,
      title: 'Order Status Update',
      message: message,
      type: 'order_update',
      priority: newStatus === 'delivered' || newStatus === 'cancelled' ? 'high' : 'medium',
      channelPreferences: order.user.notification_preferences || ['in_app'],
      data: {
        orderId,
        orderNumber: order.order_number,
        newStatus,
        totalAmount: order.total_amount,
      },
    });
  }

  async sendInventoryAlert(variantId: string, newStockLevel: number) {
    // Get product details
    const { data: variant, error: variantError } = await this.supabaseService.getClient()
      .from('product_variants')
      .select(`
        *,
        product:products(name, slug)
      `)
      .eq('id', variantId)
      .single();

    if (variantError) {
      throw new Error(`Product variant not found: ${variantError.message}`);
    }

    // Get users who should receive inventory alerts
    const { data: users, error: usersError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('id, notification_preferences')
      .in('role', ['admin', 'manager', 'procurement_manager']);

    if (usersError) {
      throw new Error(usersError.message);
    }

    // Send notification to each user
    const notifications = [];
    for (const user of users) {
      const notification = await this.create({
        userId: user.id,
        title: 'Inventory Alert',
        message: `Inventory for ${variant.product.name} (${variant.name}) is now at ${newStockLevel} units.`,
        type: 'inventory_alert',
        priority: newStockLevel <= 5 ? 'high' : 'medium', // Higher priority for very low stock
        channelPreferences: user.notification_preferences || ['in_app'],
        data: {
          variantId,
          productId: variant.product.id,
          productName: variant.product.name,
          variantName: variant.name,
          newStockLevel,
          threshold: 10, // Default threshold
          isCritical: newStockLevel <= 5,
        },
      });
      notifications.push(notification);
    }

    return notifications;
  }

  async sendPaymentConfirmation(paymentId: string, userId: string) {
    const { data: payment, error: paymentError } = await this.supabaseService.getClient()
      .from('payment_transactions')
      .select('amount, status, order:orders(order_number)')
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      throw new Error(`Payment not found: ${paymentError.message}`);
    }

    let message = '';
    if (payment.status === 'completed') {
      message = `Payment of ₹${payment.amount} for order #${payment.order.order_number} was successful.`;
    } else if (payment.status === 'failed') {
      message = `Payment of ₹${payment.amount} for order #${payment.order.order_number} failed. Please try again.`;
    } else {
      message = `Payment status for order #${payment.order.order_number} is now ${payment.status}.`;
    }

    return this.create({
      userId,
      title: payment.status === 'completed' ? 'Payment Successful' : payment.status === 'failed' ? 'Payment Failed' : 'Payment Status Update',
      message: message,
      type: 'payment_confirmation',
      priority: payment.status === 'failed' ? 'high' : 'medium',
      data: {
        paymentId,
        orderId: payment.order.id,
        orderNumber: payment.order.order_number,
        amount: payment.amount,
        status: payment.status,
      },
    });
  }

  async sendShipmentNotification(shipmentId: string, userId: string) {
    const { data: shipment, error: shipmentError } = await this.supabaseService.getClient()
      .from('shipments')
      .select(`
        *,
        order:orders(order_number),
        carrier:shipping_carriers(name)
      `)
      .eq('id', shipmentId)
      .single();

    if (shipmentError) {
      throw new Error(`Shipment not found: ${shipmentError.message}`);
    }

    let message = '';
    switch (shipment.status) {
      case 'shipped':
        message = `Your order #${shipment.order.order_number} has been shipped via ${shipment.carrier.name}. Tracking: ${shipment.tracking_number}`;
        break;
      case 'out_for_delivery':
        message = `Your order #${shipment.order.order_number} is out for delivery.`;
        break;
      case 'delivered':
        message = `Your order #${shipment.order.order_number} has been delivered.`;
        break;
      case 'delayed':
        message = `There is a delay in delivery of your order #${shipment.order.order_number}.`;
        break;
      default:
        message = `Shipment update for order #${shipment.order.order_number}: ${shipment.status}`;
    }

    return this.create({
      userId,
      title: 'Shipment Update',
      message: message,
      type: 'shipment_update',
      priority: shipment.status === 'delivered' || shipment.status === 'delayed' ? 'high' : 'medium',
      data: {
        shipmentId,
        orderId: shipment.order.id,
        orderNumber: shipment.order.order_number,
        carrier: shipment.carrier.name,
        status: shipment.status,
        trackingNumber: shipment.tracking_number,
        estimatedDelivery: shipment.estimated_delivery_date,
      },
    });
  }

  /**
   * Send seasonal reminder notifications for agricultural products
   */
  async sendSeasonalReminderNotification(userId: string, cropType: string, message: string) {
    return this.create({
      userId,
      title: `Seasonal Reminder: ${cropType}`,
      message: message,
      type: 'seasonal_reminder',
      priority: 'medium',
      data: {
        cropType,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send promotional notification
   */
  async sendPromotionalNotification(userId: string, title: string, message: string, promoCode?: string) {
    return this.create({
      userId,
      title,
      message,
      type: 'promotional',
      priority: 'low',
      data: {
        promoCode,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send dealer/distributor onboarding notification
   */
  async sendDealerOnboardingNotification(userId: string, applicationId: string) {
    const { data: application, error: applicationError } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .select(`
        *,
        user:profiles(first_name, last_name, email)
      `)
      .eq('id', applicationId)
      .single();

    if (applicationError) {
      throw new Error(`Dealer application not found: ${applicationError.message}`);
    }

    return this.create({
      userId,
      title: 'Dealer Application Submitted',
      message: `Your dealer application has been submitted successfully. Our team will review it and get back to you soon.`,
      type: 'dealer_notification',
      priority: 'medium',
      data: {
        applicationId,
        applicantName: `${application.user.first_name} ${application.user.last_name}`,
        businessName: application.business_name,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send dealer approval notification
   */
  async sendDealerApprovalNotification(userId: string, applicationId: string, approved: boolean, reason?: string) {
    const { data: application, error: applicationError } = await this.supabaseService.getClient()
      .from('dealer_applications')
      .select(`
        *,
        user:profiles(first_name, last_name, email)
      `)
      .eq('id', applicationId)
      .single();

    if (applicationError) {
      throw new Error(`Dealer application not found: ${applicationError.message}`);
    }

    const title = approved ? 'Dealer Application Approved' : 'Dealer Application Rejected';
    const message = approved 
      ? `Congratulations! Your dealer application has been approved. You can now access dealer pricing and features.`
      : `We regret to inform you that your dealer application has been rejected. Reason: ${reason || 'Not specified'}.`;

    return this.create({
      userId,
      title,
      message,
      type: 'dealer_notification',
      priority: approved ? 'high' : 'medium',
      data: {
        applicationId,
        approved,
        reason,
        businessName: application.business_name,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send inventory replenishment reminder
   */
  async sendInventoryReplenishmentReminder(userId: string, productId: string, productName: string) {
    return this.create({
      userId,
      title: 'Inventory Replenishment Reminder',
      message: `Time to replenish inventory for ${productName}. Consider placing a new order soon.`,
      type: 'inventory_reminder',
      priority: 'medium',
      data: {
        productId,
        productName,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(userIds: string[], notificationData: Omit<CreateNotificationDto, 'userId'>) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const notification = await this.create({
          ...notificationData,
          userId
        });
        results.push({
          userId,
          success: true,
          notificationId: notification.id
        });
      } catch (error) {
        results.push({
          userId,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Send broadcast notification to all users with a specific role
   */
  async sendBroadcastNotification(role: string, notificationData: Omit<CreateNotificationDto, 'userId'>) {
    // Get all users with the specified role
    const { data: users, error: usersError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('id')
      .eq('role', role);

    if (usersError) {
      throw new Error(usersError.message);
    }

    const userIds = users.map(user => user.id);
    return this.sendBulkNotifications(userIds, notificationData);
  }

  /**
   * Get notification preferences for a user
   */
  async getNotificationPreferences(userId: string) {
    const { data: user, error } = await this.supabaseService.getClient()
      .from('profiles')
      .select('notification_preferences')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return user.notification_preferences || {
      email: true,
      sms: false,
      push: true,
      in_app: true
    };
  }

  /**
   * Update notification preferences for a user
   */
  async updateNotificationPreferences(userId: string, preferences: any) {
    const { data, error } = await this.supabaseService.getClient()
      .from('profiles')
      .update({
        notification_preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('notification_preferences')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { preferences: data.notification_preferences };
  }
}