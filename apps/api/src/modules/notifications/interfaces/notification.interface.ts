export interface Notification {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';
  category: 'order' | 'payment' | 'shipping' | 'inventory' | 'promotion' | 'system' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipientType: 'customer' | 'dealer' | 'distributor' | 'admin' | 'all';
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject: string;
  message: string;
  templateId?: string;
  templateData?: Record<string, any>;
  status: 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  failedReason?: string;
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';
  category: 'order' | 'payment' | 'shipping' | 'inventory' | 'promotion' | 'system' | 'alert';
  subject?: string; // For email
  body: string;
  variables: string[]; // Template variables like {{customerName}}, {{orderNumber}}
  isActive: boolean;
  language: string; // 'en', 'hi', 'mr', etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  userType: 'customer' | 'dealer' | 'distributor' | 'admin';
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  orderNotifications: boolean;
  paymentNotifications: boolean;
  shippingNotifications: boolean;
  promotionalNotifications: boolean;
  inventoryAlerts: boolean;
  systemNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  templateId: string;
  audience: 'all' | 'customers' | 'dealers' | 'distributors' | 'custom';
  customAudience?: string[]; // User IDs
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationLog {
  id: string;
  notificationId: string;
  eventType: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
  eventData?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}

export interface NotificationStats {
  id: string;
  period: string; // Format: YYYY-MM
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  failureRate: number;
  byType: {
    email: number;
    sms: number;
    whatsapp: number;
    push: number;
    inApp: number;
  };
  byCategory: {
    order: number;
    payment: number;
    shipping: number;
    inventory: number;
    promotion: number;
    system: number;
    alert: number;
  };
  createdAt: Date;
  updatedAt: Date;
}