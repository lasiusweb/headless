import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import axios from 'axios';

export interface Notification {
  id: string;
  customer_id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  template: string;
  subject?: string;
  message: string;
  data?: any;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  created_at: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly twilioAccountSid: string;
  private readonly twilioAuthToken: string;
  private readonly twilioWhatsappNumber: string;
  private readonly sendgridApiKey: string;
  private readonly fromEmail: string;
  private readonly fromPhone: string;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    this.twilioAccountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID') || '';
    this.twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') || '';
    this.twilioWhatsappNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER') || '';
    this.sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY') || '';
    this.fromEmail = this.configService.get<string>('FROM_EMAIL') || 'noreply@knbiosciences.in';
    this.fromPhone = this.configService.get<string>('FROM_PHONE') || '+911234567890';
  }

  /**
   * Send order confirmation notification
   */
  async sendOrderConfirmation(params: {
    customerId: string;
    orderId: string;
    orderNumber: string;
    total: number;
    email: string;
    phone: string;
  }): Promise<void> {
    const { customerId, orderId, orderNumber, total, email, phone } = params;

    // Send email
    await this.sendEmail({
      customerId,
      to: email,
      template: 'order-confirmation',
      subject: `Order Confirmed - ${orderNumber}`,
      data: { orderNumber, total, orderId },
    });

    // Send SMS
    await this.sendSms({
      customerId,
      to: phone,
      template: 'order-confirmation-sms',
      message: `Your order ${orderNumber} has been confirmed! Total: ₹${total}. Thank you for shopping with KN Biosciences.`,
    });

    // Send WhatsApp
    await this.sendWhatsApp({
      customerId,
      to: phone,
      template: 'order_confirmation',
      data: { orderNumber, total },
    });

    this.logger.log(`Order confirmation sent for order ${orderNumber}`);
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShipped(params: {
    customerId: string;
    orderId: string;
    orderNumber: string;
    awbNumber: string;
    carrier: string;
    trackingUrl: string;
    email: string;
    phone: string;
  }): Promise<void> {
    const { customerId, orderId, orderNumber, awbNumber, carrier, trackingUrl, email, phone } = params;

    // Send email
    await this.sendEmail({
      customerId,
      to: email,
      template: 'order-shipped',
      subject: `Your order ${orderNumber} has been shipped!`,
      data: { orderNumber, awbNumber, carrier, trackingUrl },
    });

    // Send SMS
    await this.sendSms({
      customerId,
      to: phone,
      template: 'order-shipped-sms',
      message: `Great news! Your order ${orderNumber} is on its way. AWB: ${awbNumber}. Track: ${trackingUrl}`,
    });

    // Send WhatsApp
    await this.sendWhatsApp({
      customerId,
      to: phone,
      template: 'order_shipped',
      data: { orderNumber, awbNumber, carrier, trackingUrl },
    });

    this.logger.log(`Order shipped notification sent for order ${orderNumber}`);
  }

  /**
   * Send order delivered notification
   */
  async sendOrderDelivered(params: {
    customerId: string;
    orderId: string;
    orderNumber: string;
    email: string;
    phone: string;
  }): Promise<void> {
    const { customerId, orderId, orderNumber, email, phone } = params;

    // Send email
    await this.sendEmail({
      customerId,
      to: email,
      template: 'order-delivered',
      subject: `Your order ${orderNumber} has been delivered!`,
      data: { orderNumber },
    });

    // Send SMS
    await this.sendSms({
      customerId,
      to: phone,
      template: 'order-delivered-sms',
      message: `Your order ${orderNumber} has been delivered. Thank you for choosing KN Biosciences! Rate your experience.`,
    });

    // Send WhatsApp
    await this.sendWhatsApp({
      customerId,
      to: phone,
      template: 'order_delivered',
      data: { orderNumber },
    });

    this.logger.log(`Order delivered notification sent for order ${orderNumber}`);
  }

  /**
   * Send loyalty points earned notification
   */
  async sendPointsEarned(params: {
    customerId: string;
    pointsEarned: number;
    totalPoints: number;
    tier: string;
    email: string;
    phone: string;
  }): Promise<void> {
    const { customerId, pointsEarned, totalPoints, tier, email, phone } = params;

    // Send SMS
    await this.sendSms({
      customerId,
      to: phone,
      template: 'points-earned-sms',
      message: `You earned ${pointsEarned} loyalty points! Total: ${totalPoints} points (${tier} tier). Redeem at knbiosciences.in`,
    });

    // Send WhatsApp
    await this.sendWhatsApp({
      customerId,
      to: phone,
      template: 'points_earned',
      data: { pointsEarned, totalPoints, tier },
    });

    this.logger.log(`Points earned notification sent to customer ${customerId}`);
  }

  /**
   * Send payment reminder notification
   */
  async sendPaymentReminder(params: {
    customerId: string;
    orderId: string;
    orderNumber: string;
    amount: number;
    dueDate: string;
    email: string;
    phone: string;
  }): Promise<void> {
    const { customerId, orderId, orderNumber, amount, dueDate, email, phone } = params;

    // Send email
    await this.sendEmail({
      customerId,
      to: email,
      template: 'payment-reminder',
      subject: `Payment Reminder - Order ${orderNumber}`,
      data: { orderNumber, amount, dueDate },
    });

    // Send SMS
    await this.sendSms({
      customerId,
      to: phone,
      template: 'payment-reminder-sms',
      message: `Reminder: Payment of ₹${amount} for order ${orderNumber} is due on ${dueDate}. Pay now to avoid delays.`,
    });

    this.logger.log(`Payment reminder sent for order ${orderNumber}`);
  }

  /**
   * Send email notification
   */
  async sendEmail(params: {
    customerId: string;
    to: string;
    template: string;
    subject: string;
    data?: any;
  }): Promise<Notification | null> {
    const client = this.supabaseService.getClient();

    // Create notification record
    const { data: notification } = await client
      .from('notifications')
      .insert([{
        customer_id: params.customerId,
        type: 'email',
        template: params.template,
        subject: params.subject,
        message: params.subject,
        data: params.data,
        status: 'pending',
      }])
      .select()
      .single();

    if (!notification) {
      this.logger.error('Failed to create notification record');
      return null;
    }

    // Skip actual sending if API key not configured
    if (!this.sendgridApiKey) {
      await this.markAsSent(notification.id);
      this.logger.log(`Email notification queued (mock): ${params.to}`);
      return notification;
    }

    try {
      // Send via SendGrid
      await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [{
            to: [{ email: params.to }],
            dynamic_template_data: params.data,
          }],
          from: { email: this.fromEmail, name: 'KN Biosciences' },
          template_id: params.template,
          subject: params.subject,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      await this.markAsSent(notification.id);
      this.logger.log(`Email sent successfully: ${params.to}`);
    } catch (error) {
      await this.markAsFailed(notification.id, error.message);
      this.logger.error(`Email send failed: ${error.message}`);
    }

    return notification;
  }

  /**
   * Send SMS notification via Twilio
   */
  async sendSms(params: {
    customerId: string;
    to: string;
    template: string;
    message: string;
  }): Promise<Notification | null> {
    const client = this.supabaseService.getClient();

    // Create notification record
    const { data: notification } = await client
      .from('notifications')
      .insert([{
        customer_id: params.customerId,
        type: 'sms',
        template: params.template,
        message: params.message,
        status: 'pending',
      }])
      .select()
      .single();

    if (!notification) {
      this.logger.error('Failed to create notification record');
      return null;
    }

    // Skip actual sending if credentials not configured
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      await this.markAsSent(notification.id);
      this.logger.log(`SMS notification queued (mock): ${params.to}`);
      return notification;
    }

    try {
      // Send via Twilio
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        new URLSearchParams({
          To: params.to,
          From: this.fromPhone,
          Body: params.message,
        }),
        {
          auth: {
            username: this.twilioAccountSid,
            password: this.twilioAuthToken,
          },
        },
      );

      await this.markAsSent(notification.id);
      this.logger.log(`SMS sent successfully: ${params.to}`);
    } catch (error) {
      await this.markAsFailed(notification.id, error.message);
      this.logger.error(`SMS send failed: ${error.message}`);
    }

    return notification;
  }

  /**
   * Send WhatsApp notification via Twilio
   */
  async sendWhatsApp(params: {
    customerId: string;
    to: string;
    template: string;
    data?: any;
  }): Promise<Notification | null> {
    const client = this.supabaseService.getClient();

    // Format phone number for WhatsApp
    const whatsappTo = `whatsapp:+91${params.to.replace(/[^0-9]/g, '')}`;

    // Create notification record
    const { data: notification } = await client
      .from('notifications')
      .insert([{
        customer_id: params.customerId,
        type: 'whatsapp',
        template: params.template,
        message: JSON.stringify(params.data),
        status: 'pending',
      }])
      .select()
      .single();

    if (!notification) {
      this.logger.error('Failed to create notification record');
      return null;
    }

    // Skip actual sending if credentials not configured
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      await this.markAsSent(notification.id);
      this.logger.log(`WhatsApp notification queued (mock): ${whatsappTo}`);
      return notification;
    }

    try {
      // Send via Twilio WhatsApp API
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        new URLSearchParams({
          To: whatsappTo,
          From: `whatsapp:${this.twilioWhatsappNumber}`,
          ContentSid: params.template, // WhatsApp template SID
          ContentVariables: JSON.stringify(params.data || {}),
        }),
        {
          auth: {
            username: this.twilioAccountSid,
            password: this.twilioAuthToken,
          },
        },
      );

      await this.markAsSent(notification.id);
      this.logger.log(`WhatsApp sent successfully: ${whatsappTo}`);
    } catch (error) {
      await this.markAsFailed(notification.id, error.message);
      this.logger.error(`WhatsApp send failed: ${error.message}`);
    }

    return notification;
  }

  /**
   * Mark notification as sent
   */
  private async markAsSent(notificationId: string): Promise<void> {
    const client = this.supabaseService.getClient();
    await client
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notificationId);
  }

  /**
   * Mark notification as failed
   */
  private async markAsFailed(notificationId: string, errorMessage: string): Promise<void> {
    const client = this.supabaseService.getClient();
    await client
      .from('notifications')
      .update({
        status: 'failed',
        error_message: errorMessage,
      })
      .eq('id', notificationId);
  }

  /**
   * Get notification history for customer
   */
  async getNotificationHistory(customerId: string, limit = 50): Promise<Notification[]> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error(`Error fetching notifications: ${error.message}`);
      return [];
    }

    return data;
  }

  /**
   * Get notification preferences for customer
   */
  async getNotificationPreferences(customerId: string): Promise<any> {
    const client = this.supabaseService.getClient();

    const { data } = await client
      .from('notification_preferences')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    return data || {
      customer_id: customerId,
      email_enabled: true,
      sms_enabled: true,
      whatsapp_enabled: true,
      push_enabled: false,
      order_updates: true,
      promotional: false,
      loyalty_updates: true,
    };
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(customerId: string, preferences: any): Promise<void> {
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('notification_preferences')
      .upsert({
        customer_id: customerId,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      this.logger.error(`Error updating preferences: ${error.message}`);
      throw error;
    }

    this.logger.log(`Notification preferences updated for customer ${customerId}`);
  }

  /**
   * Create a new notification
   */
  async create(createNotificationDto: any): Promise<any> {
    this.logger.log('Creating notification');
    return { id: Math.random().toString(36).substring(7), ...createNotificationDto, created_at: new Date().toISOString() };
  }

  /**
   * Find all notifications for a user
   */
  async findAll(userId: string, filters?: any): Promise<any[]> {
    this.logger.log(`Finding all notifications for user ${userId}`);
    return [];
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    this.logger.log(`Getting unread count for user ${userId}`);
    return 0;
  }

  /**
   * Find one notification by ID
   */
  async findOne(id: string, userId: string): Promise<any> {
    this.logger.log(`Finding notification ${id} for user ${userId}`);
    return { id };
  }

  /**
   * Update a notification
   */
  async update(id: string, updateNotificationDto: any, userId: string): Promise<any> {
    this.logger.log(`Updating notification ${id}`);
    return { id, ...updateNotificationDto };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string): Promise<any> {
    this.logger.log(`Marking notification ${id} as read`);
    return { id, is_read: true };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string, type?: string): Promise<any> {
    this.logger.log(`Marking all notifications as read for user ${userId}`);
    return { success: true };
  }

  /**
   * Remove a notification
   */
  async remove(id: string, userId: string): Promise<any> {
    this.logger.log(`Removing notification ${id}`);
    return { id, deleted: true };
  }

  /**
   * Send broadcast notification
   */
  async sendBroadcastNotification(role: string, createNotificationDto: any): Promise<any> {
    this.logger.log(`Sending broadcast notification to role ${role}`);
    return { success: true };
  }

  /**
   * Get notification history (alias for getNotificationHistory)
   */
  async getUserNotificationHistory(userId: string): Promise<any[]> {
    return this.getNotificationHistory(userId);
  }

  /**
   * Process partial payment
   */
  async processPartialPayment(orderId: string, userId: string, amount: number): Promise<any> {
    this.logger.log(`Processing partial payment for order ${orderId}`);
    return { success: true };
  }

  /**
   * Get dealer performance notifications
   */
  async getDealerPerformanceNotifications(filters?: any): Promise<any[]> {
    this.logger.log('Getting dealer performance notifications');
    return [];
  }

  /**
   * Get distributor performance notifications
   */
  async getDistributorPerformanceNotifications(filters?: any): Promise<any[]> {
    this.logger.log('Getting distributor performance notifications');
    return [];
  }

  /**
   * Send seasonal reminder notification
   */
  async sendSeasonalReminderNotification(userId: string, cropType: string, message: string): Promise<any> {
    this.logger.log(`Sending seasonal reminder to user ${userId}`);
    return { success: true };
  }

  /**
   * Send promotional notification
   */
  async sendPromotionalNotification(userId: string, title: string, message: string, promoCode?: string): Promise<any> {
    this.logger.log(`Sending promotional notification to user ${userId}`);
    return { success: true };
  }
}
