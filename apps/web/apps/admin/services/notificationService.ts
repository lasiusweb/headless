// services/notificationService.ts
import { 
  Notification, 
  NotificationTemplate, 
  NotificationPreference, 
  NotificationCampaign,
  NotificationStats
} from '../api/src/modules/notifications/interfaces/notification.interface';
import { 
  CreateNotificationDto, 
  CreateNotificationTemplateDto, 
  UpdateNotificationTemplateDto,
  UpdateNotificationPreferenceDto,
  CreateNotificationCampaignDto,
  SendBulkNotificationDto,
  MarkNotificationAsReadDto,
  GetNotificationsDto
} from '../api/src/modules/notifications/dto/notification.dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Service for interacting with the notification API
 */
export class NotificationService {
  /**
   * Creates a new notification
   */
  static async createNotification(data: CreateNotificationDto): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create notification: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets notifications for a user
   */
  static async getNotifications(userId: string, params?: GetNotificationsDto): Promise<Notification[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Marks notifications as read
   */
  static async markNotificationsAsRead(notificationIds: string[], userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-as-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notificationIds, userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notifications as read: ${response.statusText}`);
    }
  }

  /**
   * Gets notification templates
   */
  static async getNotificationTemplates(type?: string, category?: string): Promise<NotificationTemplate[]> {
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (category) queryParams.append('category', category);

    const response = await fetch(`${API_BASE_URL}/notifications/templates?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch notification templates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a notification template
   */
  static async createNotificationTemplate(data: CreateNotificationTemplateDto): Promise<NotificationTemplate> {
    const response = await fetch(`${API_BASE_URL}/notifications/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create notification template: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates a notification template
   */
  static async updateNotificationTemplate(id: string, data: UpdateNotificationTemplateDto): Promise<NotificationTemplate> {
    const response = await fetch(`${API_BASE_URL}/notifications/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update notification template: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets notification preference for a user
   */
  static async getNotificationPreference(userId: string): Promise<NotificationPreference> {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch notification preference: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Updates notification preference for a user
   */
  static async updateNotificationPreference(userId: string, data: UpdateNotificationPreferenceDto): Promise<NotificationPreference> {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update notification preference: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates a notification campaign
   */
  static async createNotificationCampaign(data: CreateNotificationCampaignDto): Promise<NotificationCampaign> {
    const response = await fetch(`${API_BASE_URL}/notifications/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create notification campaign: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sends bulk notifications
   */
  static async sendBulkNotification(data: SendBulkNotificationDto): Promise<Notification[]> {
    const response = await fetch(`${API_BASE_URL}/notifications/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send bulk notification: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets notification statistics
   */
  static async getNotificationStats(period: string): Promise<NotificationStats> {
    const response = await fetch(`${API_BASE_URL}/notifications/stats/${period}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch notification stats: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sends order confirmation notification
   */
  static async sendOrderConfirmation(data: { orderId: string; customerId: string; customerEmail: string; orderDetails: any }): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/order-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send order confirmation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sends shipping update notification
   */
  static async sendShippingUpdate(data: { orderId: string; customerId: string; customerEmail: string; shippingDetails: any }): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/shipping-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send shipping update: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sends payment confirmation notification
   */
  static async sendPaymentConfirmation(data: { orderId: string; customerId: string; customerEmail: string; paymentDetails: any }): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/payment-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send payment confirmation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sends low stock alert notification
   */
  static async sendLowStockAlert(data: { productId: string; productName: string; sku: string; currentStock: number; reorderLevel: number; adminEmail: string }): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/low-stock-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send low stock alert: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sends expiry alert notification
   */
  static async sendExpiryAlert(data: { productId: string; batchId: string; productName: string; batchNumber: string; expiryDate: string; daysUntilExpiry: number; adminEmail: string }): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/expiry-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send expiry alert: ${response.statusText}`);
    }

    return response.json();
  }
}