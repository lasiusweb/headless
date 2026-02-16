import { IsString, IsUUID, IsOptional, IsEnum, IsBoolean } from 'class-validator';

enum NotificationType {
  OrderUpdate = 'order_update',
  PaymentConfirmation = 'payment_confirmation',
  ShipmentUpdate = 'shipment_update',
  InventoryAlert = 'inventory_alert',
  LowStock = 'low_stock',
  System = 'system',
  Promotional = 'promotional',
  General = 'general'
}

enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsOptional()
  data?: any;
}