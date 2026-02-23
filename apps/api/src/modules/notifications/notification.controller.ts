import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req,
  ForbiddenException
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createNotificationDto: CreateNotificationDto, @Req() req) {
    // Only admins can create notifications for other users
    if (req.user.role !== 'admin' && createNotificationDto.userId !== req.user.id) {
      throw new ForbiddenException('You can only create notifications for yourself');
    }

    return this.notificationService.create(createNotificationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get all notifications for authenticated user' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by notification type' })
  @ApiQuery({ name: 'isRead', required: false, description: 'Filter by read status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of notifications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Req() req,
    @Query('type') type?: string,
    @Query('isRead') isRead?: string,
    @Query('priority') priority?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.notificationService.findAll(req.user.id, {
      type,
      isRead: isRead ? isRead === 'true' : undefined,
      priority,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for authenticated user' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadCount(@Req() req) {
    return this.notificationService.getUnreadCount(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification details retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id') id: string, @Req() req) {
    return this.notificationService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req
  ) {
    return this.notificationService.update(id, updateNotificationDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for authenticated user' })
  @ApiQuery({ name: 'type', required: false, description: 'Mark only specific type as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(
    @Req() req,
    @Query('type') type?: string
  ) {
    return this.notificationService.markAllAsRead(req.user.id, type);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async remove(@Param('id') id: string, @Req() req) {
    return this.notificationService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('system/:userId')
  @ApiOperation({ summary: 'Send a system notification to a specific user (admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID to send notification to' })
  @ApiResponse({ status: 201, description: 'System notification sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendSystemNotification(
    @Param('userId') userId: string,
    @Body() createNotificationDto: CreateNotificationDto
  ) {
    // Override the user ID to ensure admin sends to the specified user
    return this.notificationService.create({
      ...createNotificationDto,
      userId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('broadcast/:role')
  @ApiOperation({ summary: 'Send broadcast notification to all users with a specific role (admin only)' })
  @ApiParam({ name: 'role', description: 'Role to broadcast to (admin, dealer, distributor, etc.)' })
  @ApiResponse({ status: 200, description: 'Broadcast notification sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendBroadcastNotification(
    @Param('role') role: string,
    @Body() createNotificationDto: Omit<CreateNotificationDto, 'userId'>
  ) {
    return this.notificationService.sendBroadcastNotification(role, createNotificationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences for authenticated user' })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getNotificationPreferences(@Req() req) {
    return this.notificationService.getNotificationPreferences(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences for authenticated user' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateNotificationPreferences(
    @Req() req,
    @Body('preferences') preferences: any
  ) {
    return this.notificationService.updateNotificationPreferences(req.user.id, preferences);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('history')
  @ApiOperation({ summary: 'Get notification history for authenticated user' })
  @ApiResponse({ status: 200, description: 'Notification history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getNotificationHistory(@Req() req) {
    return this.notificationService.getUserNotificationHistory(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('partial-payment/:orderId')
  @ApiOperation({ summary: 'Process partial payment notification (admin only)' })
  @ApiParam({ name: 'orderId', description: 'Order ID for partial payment' })
  @ApiResponse({ status: 200, description: 'Partial payment notification processed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async processPartialPayment(
    @Param('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('userId') userId: string,
    @Req() req
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can process partial payments');
    }
    
    return this.notificationService.processPartialPayment(orderId, userId, amount);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('dealer-performance')
  @ApiOperation({ summary: 'Get dealer performance notifications (admin only)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiQuery({ name: 'dealerId', required: false, description: 'Filter by dealer ID' })
  @ApiResponse({ status: 200, description: 'Dealer performance notifications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getDealerPerformanceNotifications(
    @Req() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dealerId') dealerId?: string
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access dealer performance reports');
    }

    return this.notificationService.getDealerPerformanceNotifications({
      startDate,
      endDate,
      dealerId
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('distributor-performance')
  @ApiOperation({ summary: 'Get distributor performance notifications (admin only)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiQuery({ name: 'distributorId', required: false, description: 'Filter by distributor ID' })
  @ApiResponse({ status: 200, description: 'Distributor performance notifications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getDistributorPerformanceNotifications(
    @Req() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('distributorId') distributorId?: string
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access distributor performance reports');
    }

    return this.notificationService.getDistributorPerformanceNotifications({
      startDate,
      endDate,
      distributorId
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('seasonal-reminder')
  @ApiOperation({ summary: 'Send seasonal reminder notification (admin only)' })
  @ApiResponse({ status: 200, description: 'Seasonal reminder notification sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendSeasonalReminder(
    @Body('userId') userId: string,
    @Body('cropType') cropType: string,
    @Body('message') message: string
  ) {
    return this.notificationService.sendSeasonalReminderNotification(userId, cropType, message);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('promotional')
  @ApiOperation({ summary: 'Send promotional notification (admin only)' })
  @ApiResponse({ status: 200, description: 'Promotional notification sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendPromotionalNotification(
    @Body('userId') userId: string,
    @Body('title') title: string,
    @Body('message') message: string,
    @Body('promoCode') promoCode?: string
  ) {
    return this.notificationService.sendPromotionalNotification(userId, title, message, promoCode);
  }
}