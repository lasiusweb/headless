import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

enum NotificationPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsOptional()
  data?: any;
}