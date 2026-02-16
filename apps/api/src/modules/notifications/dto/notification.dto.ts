import { IsString, IsEmail, IsEnum, IsOptional, IsArray, ValidateNested, IsBoolean, IsISO8601, IsNumber, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @IsEnum(['email', 'sms', 'whatsapp', 'push', 'in-app'])
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';

  @IsEnum(['order', 'payment', 'shipping', 'inventory', 'promotion', 'system', 'alert'])
  category: 'order' | 'payment' | 'shipping' | 'inventory' | 'promotion' | 'system' | 'alert';

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @IsEnum(['customer', 'dealer', 'distributor', 'admin', 'all'])
  recipientType: 'customer' | 'dealer' | 'distributor' | 'admin' | 'all';

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsObject()
  templateData?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateNotificationTemplateDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsEnum(['email', 'sms', 'whatsapp', 'push', 'in-app'])
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';

  @IsEnum(['order', 'payment', 'shipping', 'inventory', 'promotion', 'system', 'alert'])
  category: 'order' | 'payment' | 'shipping' | 'inventory' | 'promotion' | 'system' | 'alert';

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  body: string;

  @IsArray()
  @IsString({ each: true })
  variables: string[];

  @IsBoolean()
  isActive: boolean;

  @IsString()
  language: string;
}

export class UpdateNotificationTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['email', 'sms', 'whatsapp', 'push', 'in-app'])
  type?: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';

  @IsOptional()
  @IsEnum(['order', 'payment', 'shipping', 'inventory', 'promotion', 'system', 'alert'])
  category?: 'order' | 'payment' | 'shipping' | 'inventory' | 'promotion' | 'system' | 'alert';

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  language?: string;
}

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  orderNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  shippingNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  promotionalNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  inventoryAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  systemNotifications?: boolean;
}

export class CreateNotificationCampaignDto {
  @IsString()
  name: string;

  @IsEnum(['email', 'sms', 'whatsapp', 'push'])
  type: 'email' | 'sms' | 'whatsapp' | 'push';

  @IsString()
  templateId: string;

  @IsEnum(['all', 'customers', 'dealers', 'distributors', 'custom'])
  audience: 'all' | 'customers' | 'dealers' | 'distributors' | 'custom';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customAudience?: string[];

  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;

  @IsBoolean()
  isActive: boolean;
}

export class SendBulkNotificationDto {
  @IsEnum(['email', 'sms', 'whatsapp', 'push', 'in-app'])
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';

  @IsEnum(['order', 'payment', 'shipping', 'inventory', 'promotion', 'system', 'alert'])
  category: 'order' | 'payment' | 'shipping' | 'inventory' | 'promotion' | 'system' | 'alert';

  @IsString()
  templateId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDataDto)
  recipients: RecipientDataDto[];

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class RecipientDataDto {
  @IsString()
  recipientId: string;

  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsObject()
  templateData?: Record<string, any>;
}

export class MarkNotificationAsReadDto {
  @IsArray()
  @IsString({ each: true })
  notificationIds: string[];
}

export class GetNotificationsDto {
  @IsOptional()
  @IsEnum(['email', 'sms', 'whatsapp', 'push', 'in-app'])
  type?: 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';

  @IsOptional()
  @IsEnum(['order', 'payment', 'shipping', 'inventory', 'promotion', 'system', 'alert'])
  category?: 'order' | 'payment' | 'shipping' | 'inventory' | 'promotion' | 'system' | 'alert';

  @IsOptional()
  @IsEnum(['pending', 'queued', 'sent', 'delivered', 'failed', 'bounced'])
  status?: 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}