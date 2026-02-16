import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  Notification, 
  NotificationTemplate, 
  NotificationPreference, 
  NotificationCampaign,
  NotificationLog,
  NotificationStats
} from './interfaces/notification.interface';
import { 
  CreateNotificationDto, 
  CreateNotificationTemplateDto, 
  UpdateNotificationTemplateDto,
  UpdateNotificationPreferenceDto,
  CreateNotificationCampaignDto,
  SendBulkNotificationDto,
  MarkNotificationAsReadDto,
  GetNotificationsDto
} from './dto/notification.dto';
import { OrdersService } from '../orders/orders.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private notifications: Notification[] = [];
  private notificationTemplates: NotificationTemplate[] = [];
  private notificationPreferences: NotificationPreference[] = [];
  private notificationCampaigns: NotificationCampaign[] = [];
  private notificationLogs: NotificationLog[] = [];
  private notificationStats: NotificationStats[] = [];

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private customersService: CustomersService,
  ) {
    // Initialize default notification templates
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    this.notificationTemplates = [
      {
        id: 'tpl-order-confirmed',
        name: 'Order Confirmation',
        type: 'email',
        category: 'order',
        subject: 'Order Confirmation - {{orderNumber}}',
        body: 'Dear {{customerName}},\n\nYour order {{orderNumber}} has been confirmed.\n\nOrder Total: ₹{{orderTotal}}\n\nThank you for shopping with KN Biosciences!',
        variables: ['customerName', 'orderNumber', 'orderTotal'],
        isActive: true,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tpl-order-shipped',
        name: 'Order Shipped',
        type: 'email',
        category: 'shipping',
        subject: 'Your Order {{orderNumber}} Has Been Shipped',
        body: 'Dear {{customerName}},\n\nGreat news! Your order {{orderNumber}} has been shipped.\n\nTracking Number: {{trackingNumber}}\n\nExpected Delivery: {{expectedDelivery}}',
        variables: ['customerName', 'orderNumber', 'trackingNumber', 'expectedDelivery'],
        isActive: true,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tpl-payment-received',
        name: 'Payment Received',
        type: 'email',
        category: 'payment',
        subject: 'Payment Received - {{orderNumber}}',
        body: 'Dear {{customerName}},\n\nWe have received your payment of ₹{{paymentAmount}} for order {{orderNumber}}.\n\nThank you for your business!',
        variables: ['customerName', 'orderNumber', 'paymentAmount'],
        isActive: true,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tpl-low-stock-alert',
        name: 'Low Stock Alert',
        type: 'email',
        category: 'inventory',
        subject: 'Low Stock Alert - {{productName}}',
        body: 'Alert: {{productName}} (SKU: {{sku}}) has fallen below reorder level.\n\nCurrent Stock: {{currentStock}}\nReorder Level: {{reorderLevel}}\n\nPlease restock soon.',
        variables: ['productName', 'sku', 'currentStock', 'reorderLevel'],
        isActive: true,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tpl-expiry-alert',
        name: 'Expiry Alert',
        type: 'email',
        category: 'alert',
        subject: 'Expiry Alert - {{productName}} (Batch: {{batchNumber}})',
        body: 'Alert: {{productName}} (Batch: {{batchNumber}}) is expiring soon.\n\nExpiry Date: {{expiryDate}}\nDays Until Expiry: {{daysUntilExpiry}}\n\nPlease take appropriate action.',
        variables: ['productName', 'batchNumber', 'expiryDate', 'daysUntilExpiry'],
        isActive: true,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification: Notification = {
      id: Math.random().toString(36).substring(7),
      ...createNotificationDto,
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.notifications.push(notification);

    // Add to queue for processing
    await this.queueNotification(notification);

    this.logger.log(`Notification created: ${notification.id} - Type: ${notification.type}`);

    return notification;
  }

  private async queueNotification(notification: Notification): Promise<void> {
    // Update status to queued
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index !== -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        status: 'queued',
        updatedAt: new Date(),
      };
    }

    // Add log entry
    await this.addNotificationLog(notification.id, 'queued');

    // In a real implementation, this would add to a message queue (e.g., Redis, RabbitMQ)
    // For now, we'll simulate immediate processing
    await this.processNotification(notification);
  }

  private async processNotification(notification: Notification): Promise<void> {
    try {
      // Update status to sent
      const index = this.notifications.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        this.notifications[index] = {
          ...this.notifications[index],
          status: 'sent',
          sentAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Add log entry
      await this.addNotificationLog(notification.id, 'sent');

      // Simulate delivery based on notification type
      await this.deliverNotification(notification);

      this.logger.log(`Notification sent: ${notification.id}`);
    } catch (error) {
      // Handle failure and retry
      await this.handleNotificationFailure(notification, error);
    }
  }

  private async deliverNotification(notification: Notification): Promise<void> {
    // Simulate delivery based on notification type
    // In a real implementation, this would integrate with:
    // - Email: SendGrid, AWS SES, etc.
    // - SMS: Twilio, MSG91, etc.
    // - WhatsApp: Twilio WhatsApp API, etc.
    // - Push: Firebase Cloud Messaging, etc.

    // Simulate successful delivery
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index !== -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        status: 'delivered',
        deliveredAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Add log entry
    await this.addNotificationLog(notification.id, 'delivered');

    this.logger.log(`Notification delivered: ${notification.id}`);
  }

  private async handleNotificationFailure(notification: Notification, error: any): Promise<void> {
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index === -1) return;

    const currentNotification = this.notifications[index];
    const newRetryCount = currentNotification.retryCount + 1;

    if (newRetryCount >= currentNotification.maxRetries) {
      // Max retries reached, mark as failed
      this.notifications[index] = {
        ...currentNotification,
        status: 'failed',
        failedReason: error.message,
        retryCount: newRetryCount,
        updatedAt: new Date(),
      };

      await this.addNotificationLog(notification.id, 'failed', { error: error.message });
      this.logger.error(`Notification failed after ${newRetryCount} retries: ${notification.id}`);
    } else {
      // Retry
      this.notifications[index] = {
        ...currentNotification,
        retryCount: newRetryCount,
        updatedAt: new Date(),
      };

      // Retry after delay (exponential backoff)
      const delay = Math.pow(2, newRetryCount) * 1000; // 2s, 4s, 8s...
      setTimeout(() => this.processNotification(notification), delay);

      this.logger.warn(`Notification retry ${newRetryCount}/${currentNotification.maxRetries}: ${notification.id}`);
    }
  }

  private async addNotificationLog(
    notificationId: string, 
    eventType: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced',
    eventData?: Record<string, any>
  ): Promise<void> {
    const log: NotificationLog = {
      id: Math.random().toString(36).substring(7),
      notificationId,
      eventType,
      eventData,
      timestamp: new Date(),
      createdAt: new Date(),
    };

    this.notificationLogs.push(log);
  }

  async createNotificationTemplate(createNotificationTemplateDto: CreateNotificationTemplateDto): Promise<NotificationTemplate> {
    const template: NotificationTemplate = {
      id: Math.random().toString(36).substring(7),
      ...createNotificationTemplateDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.notificationTemplates.push(template);

    this.logger.log(`Notification template created: ${template.id} - ${template.name}`);

    return template;
  }

  async updateNotificationTemplate(id: string, updateNotificationTemplateDto: UpdateNotificationTemplateDto): Promise<NotificationTemplate> {
    const index = this.notificationTemplates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Notification template with ID ${id} not found`);
    }

    this.notificationTemplates[index] = {
      ...this.notificationTemplates[index],
      ...updateNotificationTemplateDto,
      updatedAt: new Date(),
    };

    this.logger.log(`Notification template updated: ${id}`);

    return this.notificationTemplates[index];
  }

  async getNotificationTemplates(type?: string, category?: string): Promise<NotificationTemplate[]> {
    let templates = [...this.notificationTemplates];

    if (type) {
      templates = templates.filter(t => t.type === type);
    }

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    return templates.filter(t => t.isActive);
  }

  async getNotificationPreference(userId: string): Promise<NotificationPreference> {
    let preference = this.notificationPreferences.find(p => p.userId === userId);

    if (!preference) {
      // Create default preference
      preference = {
        id: Math.random().toString(36).substring(7),
        userId,
        userType: 'customer', // Default, would be determined from user service
        emailEnabled: true,
        smsEnabled: true,
        whatsappEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
        orderNotifications: true,
        paymentNotifications: true,
        shippingNotifications: true,
        promotionalNotifications: false,
        inventoryAlerts: false,
        systemNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.notificationPreferences.push(preference);
    }

    return preference;
  }

  async updateNotificationPreference(userId: string, updateNotificationPreferenceDto: UpdateNotificationPreferenceDto): Promise<NotificationPreference> {
    let preference = this.notificationPreferences.find(p => p.userId === userId);

    if (!preference) {
      // Create new preference
      preference = {
        id: Math.random().toString(36).substring(7),
        userId,
        userType: 'customer',
        emailEnabled: true,
        smsEnabled: true,
        whatsappEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
        orderNotifications: true,
        paymentNotifications: true,
        shippingNotifications: true,
        promotionalNotifications: false,
        inventoryAlerts: false,
        systemNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.notificationPreferences.push(preference);
    }

    preference = {
      ...preference,
      ...updateNotificationPreferenceDto,
      updatedAt: new Date(),
    };

    const index = this.notificationPreferences.findIndex(p => p.userId === userId);
    this.notificationPreferences[index] = preference;

    this.logger.log(`Notification preference updated for user: ${userId}`);

    return preference;
  }

  async createNotificationCampaign(createNotificationCampaignDto: CreateNotificationCampaignDto): Promise<NotificationCampaign> {
    const campaign: NotificationCampaign = {
      id: Math.random().toString(36).substring(7),
      ...createNotificationCampaignDto,
      scheduledAt: createNotificationCampaignDto.scheduledAt ? new Date(createNotificationCampaignDto.scheduledAt) : undefined,
      status: createNotificationCampaignDto.scheduledAt ? 'scheduled' : 'draft',
      totalRecipients: 0,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      failedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.notificationCampaigns.push(campaign);

    this.logger.log(`Notification campaign created: ${campaign.id} - ${campaign.name}`);

    return campaign;
  }

  async sendBulkNotification(sendBulkNotificationDto: SendBulkNotificationDto): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const recipient of sendBulkNotificationDto.recipients) {
      // Get template
      const template = this.notificationTemplates.find(t => t.id === sendBulkNotificationDto.templateId);
      if (!template) {
        this.logger.warn(`Template not found: ${sendBulkNotificationDto.templateId}`);
        continue;
      }

      // Render template with recipient data
      const { subject, message } = this.renderTemplate(template, recipient.templateData || {});

      // Create notification
      const notification = await this.createNotification({
        type: sendBulkNotificationDto.type,
        category: sendBulkNotificationDto.category,
        priority: sendBulkNotificationDto.priority || 'medium',
        recipientType: 'customer',
        recipientId: recipient.recipientId,
        recipientEmail: recipient.recipientEmail,
        recipientPhone: recipient.recipientPhone,
        subject,
        message,
        templateId: template.id,
        templateData: recipient.templateData,
      });

      notifications.push(notification);
    }

    this.logger.log(`Bulk notification sent to ${notifications.length} recipients`);

    return notifications;
  }

  private renderTemplate(template: NotificationTemplate, data: Record<string, any>): { subject: string; message: string } {
    let subject = template.subject || '';
    let message = template.body;

    // Replace variables
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      if (subject.includes(placeholder)) {
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      }
      if (message.includes(placeholder)) {
        message = message.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }

    return { subject, message };
  }

  async getNotifications(userId: string, getNotificationsDto: GetNotificationsDto): Promise<Notification[]> {
    let notifications = this.notifications.filter(n => n.recipientId === userId);

    if (getNotificationsDto.type) {
      notifications = notifications.filter(n => n.type === getNotificationsDto.type);
    }

    if (getNotificationsDto.category) {
      notifications = notifications.filter(n => n.category === getNotificationsDto.category);
    }

    if (getNotificationsDto.status) {
      notifications = notifications.filter(n => n.status === getNotificationsDto.status);
    }

    if (getNotificationsDto.startDate) {
      notifications = notifications.filter(n => n.createdAt >= new Date(getNotificationsDto.startDate));
    }

    if (getNotificationsDto.endDate) {
      notifications = notifications.filter(n => n.createdAt <= new Date(getNotificationsDto.endDate));
    }

    const limit = getNotificationsDto.limit || 50;
    const offset = getNotificationsDto.offset || 0;

    return notifications.slice(offset, offset + limit);
  }

  async markNotificationsAsRead(notificationIds: string[], userId: string): Promise<void> {
    for (const notificationId of notificationIds) {
      const index = this.notifications.findIndex(n => n.id === notificationId && n.recipientId === userId);
      if (index !== -1) {
        this.notifications[index] = {
          ...this.notifications[index],
          readAt: new Date(),
          updatedAt: new Date(),
        };

        await this.addNotificationLog(notificationId, 'opened');
      }
    }

    this.logger.log(`Marked ${notificationIds.length} notifications as read for user: ${userId}`);
  }

  async getNotificationStats(period: string): Promise<NotificationStats> {
    // Find existing stats or create new
    let stats = this.notificationStats.find(s => s.period === period);

    if (!stats) {
      // Calculate stats from notifications
      const periodNotifications = this.notifications.filter(n => {
        const notificationMonth = `${n.createdAt.getFullYear()}-${String(n.createdAt.getMonth() + 1).padStart(2, '0')}`;
        return notificationMonth === period;
      });

      const totalSent = periodNotifications.length;
      const totalDelivered = periodNotifications.filter(n => n.status === 'delivered').length;
      const totalFailed = periodNotifications.filter(n => n.status === 'failed' || n.status === 'bounced').length;

      stats = {
        id: Math.random().toString(36).substring(7),
        period,
        totalSent,
        totalDelivered,
        totalOpened: periodNotifications.filter(n => n.readAt).length,
        totalClicked: periodNotifications.filter(n => n.clickedAt).length,
        totalFailed,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        openRate: totalDelivered > 0 ? (periodNotifications.filter(n => n.readAt).length / totalDelivered) * 100 : 0,
        clickRate: totalDelivered > 0 ? (periodNotifications.filter(n => n.clickedAt).length / totalDelivered) * 100 : 0,
        failureRate: totalSent > 0 ? (totalFailed / totalSent) * 100 : 0,
        byType: {
          email: periodNotifications.filter(n => n.type === 'email').length,
          sms: periodNotifications.filter(n => n.type === 'sms').length,
          whatsapp: periodNotifications.filter(n => n.type === 'whatsapp').length,
          push: periodNotifications.filter(n => n.type === 'push').length,
          inApp: periodNotifications.filter(n => n.type === 'in-app').length,
        },
        byCategory: {
          order: periodNotifications.filter(n => n.category === 'order').length,
          payment: periodNotifications.filter(n => n.category === 'payment').length,
          shipping: periodNotifications.filter(n => n.category === 'shipping').length,
          inventory: periodNotifications.filter(n => n.category === 'inventory').length,
          promotion: periodNotifications.filter(n => n.category === 'promotion').length,
          system: periodNotifications.filter(n => n.category === 'system').length,
          alert: periodNotifications.filter(n => n.category === 'alert').length,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.notificationStats.push(stats);
    }

    return stats;
  }

  // Helper methods for sending specific notification types
  async sendOrderConfirmation(orderId: string, customerId: string, customerEmail: string, orderDetails: any): Promise<Notification> {
    return this.createNotification({
      type: 'email',
      category: 'order',
      priority: 'high',
      recipientType: 'customer',
      recipientId: customerId,
      recipientEmail: customerEmail,
      subject: `Order Confirmation - ${orderDetails.orderNumber}`,
      message: `Dear ${orderDetails.customerName},\n\nYour order ${orderDetails.orderNumber} has been confirmed.\n\nOrder Total: ₹${orderDetails.total}\n\nThank you for shopping with KN Biosciences!`,
      templateId: 'tpl-order-confirmed',
      templateData: {
        customerName: orderDetails.customerName,
        orderNumber: orderDetails.orderNumber,
        orderTotal: orderDetails.total,
      },
      metadata: { orderId },
    });
  }

  async sendShippingUpdate(orderId: string, customerId: string, customerEmail: string, shippingDetails: any): Promise<Notification> {
    return this.createNotification({
      type: 'email',
      category: 'shipping',
      priority: 'high',
      recipientType: 'customer',
      recipientId: customerId,
      recipientEmail: customerEmail,
      subject: `Your Order ${shippingDetails.orderNumber} Has Been Shipped`,
      message: `Dear ${shippingDetails.customerName},\n\nGreat news! Your order ${shippingDetails.orderNumber} has been shipped.\n\nTracking Number: ${shippingDetails.trackingNumber}\n\nExpected Delivery: ${shippingDetails.expectedDelivery}`,
      templateId: 'tpl-order-shipped',
      templateData: shippingDetails,
      metadata: { orderId },
    });
  }

  async sendPaymentConfirmation(orderId: string, customerId: string, customerEmail: string, paymentDetails: any): Promise<Notification> {
    return this.createNotification({
      type: 'email',
      category: 'payment',
      priority: 'high',
      recipientType: 'customer',
      recipientId: customerId,
      recipientEmail: customerEmail,
      subject: `Payment Received - ${paymentDetails.orderNumber}`,
      message: `Dear ${paymentDetails.customerName},\n\nWe have received your payment of ₹${paymentDetails.amount} for order ${paymentDetails.orderNumber}.\n\nThank you for your business!`,
      templateId: 'tpl-payment-received',
      templateData: paymentDetails,
      metadata: { orderId },
    });
  }

  async sendLowStockAlert(productId: string, productName: string, sku: string, currentStock: number, reorderLevel: number, adminEmail: string): Promise<Notification> {
    return this.createNotification({
      type: 'email',
      category: 'inventory',
      priority: 'urgent',
      recipientType: 'admin',
      recipientEmail: adminEmail,
      subject: `Low Stock Alert - ${productName}`,
      message: `Alert: ${productName} (SKU: ${sku}) has fallen below reorder level.\n\nCurrent Stock: ${currentStock}\nReorder Level: ${reorderLevel}\n\nPlease restock soon.`,
      templateId: 'tpl-low-stock-alert',
      templateData: {
        productName,
        sku,
        currentStock,
        reorderLevel,
      },
      metadata: { productId },
    });
  }

  async sendExpiryAlert(productId: string, batchId: string, productName: string, batchNumber: string, expiryDate: Date, daysUntilExpiry: number, adminEmail: string): Promise<Notification> {
    return this.createNotification({
      type: 'email',
      category: 'alert',
      priority: 'urgent',
      recipientType: 'admin',
      recipientEmail: adminEmail,
      subject: `Expiry Alert - ${productName} (Batch: ${batchNumber})`,
      message: `Alert: ${productName} (Batch: ${batchNumber}) is expiring soon.\n\nExpiry Date: ${expiryDate.toLocaleDateString()}\nDays Until Expiry: ${daysUntilExpiry}\n\nPlease take appropriate action.`,
      templateId: 'tpl-expiry-alert',
      templateData: {
        productName,
        batchNumber,
        expiryDate: expiryDate.toLocaleDateString(),
        daysUntilExpiry,
      },
      metadata: { productId, batchId },
    });
  }
}