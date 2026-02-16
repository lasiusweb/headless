import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
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
import { 
  Notification, 
  NotificationTemplate, 
  NotificationPreference, 
  NotificationCampaign,
  NotificationStats
} from './interfaces/notification.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  createNotification(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  @Get('user/:userId')
  getNotifications(
    @Param('userId') userId: string,
    @Query() getNotificationsDto: GetNotificationsDto
  ): Promise<Notification[]> {
    return this.notificationsService.getNotifications(userId, getNotificationsDto);
  }

  @Post('mark-as-read')
  markNotificationsAsRead(@Body() markNotificationAsReadDto: MarkNotificationAsReadDto & { userId: string }): Promise<void> {
    return this.notificationsService.markNotificationsAsRead(
      markNotificationAsReadDto.notificationIds, 
      markNotificationAsReadDto.userId
    );
  }

  @Get('templates')
  getNotificationTemplates(
    @Query('type') type?: string,
    @Query('category') category?: string
  ): Promise<NotificationTemplate[]> {
    return this.notificationsService.getNotificationTemplates(type, category);
  }

  @Post('templates')
  createNotificationTemplate(@Body() createNotificationTemplateDto: CreateNotificationTemplateDto): Promise<NotificationTemplate> {
    return this.notificationsService.createNotificationTemplate(createNotificationTemplateDto);
  }

  @Put('templates/:id')
  updateNotificationTemplate(
    @Param('id') id: string,
    @Body() updateNotificationTemplateDto: UpdateNotificationTemplateDto
  ): Promise<NotificationTemplate> {
    return this.notificationsService.updateNotificationTemplate(id, updateNotificationTemplateDto);
  }

  @Get('preferences/:userId')
  getNotificationPreference(@Param('userId') userId: string): Promise<NotificationPreference> {
    return this.notificationsService.getNotificationPreference(userId);
  }

  @Put('preferences/:userId')
  updateNotificationPreference(
    @Param('userId') userId: string,
    @Body() updateNotificationPreferenceDto: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreference> {
    return this.notificationsService.updateNotificationPreference(userId, updateNotificationPreferenceDto);
  }

  @Post('campaigns')
  createNotificationCampaign(@Body() createNotificationCampaignDto: CreateNotificationCampaignDto): Promise<NotificationCampaign> {
    return this.notificationsService.createNotificationCampaign(createNotificationCampaignDto);
  }

  @Post('bulk')
  sendBulkNotification(@Body() sendBulkNotificationDto: SendBulkNotificationDto): Promise<Notification[]> {
    return this.notificationsService.sendBulkNotification(sendBulkNotificationDto);
  }

  @Get('stats/:period')
  getNotificationStats(@Param('period') period: string): Promise<NotificationStats> {
    return this.notificationsService.getNotificationStats(period);
  }

  // Helper endpoints for specific notification types
  @Post('order-confirmation')
  sendOrderConfirmation(
    @Body() data: { orderId: string; customerId: string; customerEmail: string; orderDetails: any }
  ): Promise<Notification> {
    return this.notificationsService.sendOrderConfirmation(
      data.orderId, 
      data.customerId, 
      data.customerEmail, 
      data.orderDetails
    );
  }

  @Post('shipping-update')
  sendShippingUpdate(
    @Body() data: { orderId: string; customerId: string; customerEmail: string; shippingDetails: any }
  ): Promise<Notification> {
    return this.notificationsService.sendShippingUpdate(
      data.orderId, 
      data.customerId, 
      data.customerEmail, 
      data.shippingDetails
    );
  }

  @Post('payment-confirmation')
  sendPaymentConfirmation(
    @Body() data: { orderId: string; customerId: string; customerEmail: string; paymentDetails: any }
  ): Promise<Notification> {
    return this.notificationsService.sendPaymentConfirmation(
      data.orderId, 
      data.customerId, 
      data.customerEmail, 
      data.paymentDetails
    );
  }

  @Post('low-stock-alert')
  sendLowStockAlert(
    @Body() data: { productId: string; productName: string; sku: string; currentStock: number; reorderLevel: number; adminEmail: string }
  ): Promise<Notification> {
    return this.notificationsService.sendLowStockAlert(
      data.productId,
      data.productName,
      data.sku,
      data.currentStock,
      data.reorderLevel,
      data.adminEmail
    );
  }

  @Post('expiry-alert')
  sendExpiryAlert(
    @Body() data: { productId: string; batchId: string; productName: string; batchNumber: string; expiryDate: string; daysUntilExpiry: number; adminEmail: string }
  ): Promise<Notification> {
    return this.notificationsService.sendExpiryAlert(
      data.productId,
      data.batchId,
      data.productName,
      data.batchNumber,
      new Date(data.expiryDate),
      data.daysUntilExpiry,
      data.adminEmail
    );
  }
}