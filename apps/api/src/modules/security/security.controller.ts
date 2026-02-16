import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req,
  Ip
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Security')
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('events')
  @ApiOperation({ summary: 'Get security events (admin only)' })
  @ApiQuery({ name: 'eventType', required: false, description: 'Filter by event type' })
  @ApiQuery({ name: 'severity', required: false, description: 'Filter by severity (low, medium, high, critical)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'Security events retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSecurityEvents(
    @Query('eventType') eventType?: string,
    @Query('severity') severity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string
  ) {
    // In a real implementation, this would fetch security events from the database
    // For now, returning a placeholder response
    return [];
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('audit-trail')
  @ApiOperation({ summary: 'Get audit trail (admin only)' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'Audit trail retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAuditTrail(
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string
  ) {
    // In a real implementation, this would fetch audit trail from the database
    // For now, returning a placeholder response
    return [];
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('validate-gst')
  @ApiOperation({ summary: 'Validate GST number (admin only)' })
  @ApiResponse({ status: 200, description: 'GST number validation result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async validateGstNumber(@Body('gstNumber') gstNumber: string) {
    const isValid = await this.securityService.validateGstNumber(gstNumber);
    return { gstNumber, isValid };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('user-access/:resourceType/:resourceId/:action')
  @ApiOperation({ summary: 'Check if user has access to a resource (authenticated users)' })
  @ApiParam({ name: 'resourceType', description: 'Type of resource (e.g., order, product)' })
  @ApiParam({ name: 'resourceId', description: 'ID of the resource' })
  @ApiParam({ name: 'action', description: 'Action to perform (e.g., read, update, delete)' })
  @ApiResponse({ status: 200, description: 'Access check result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async checkUserAccess(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @Param('action') action: string,
    @Req() req
  ) {
    const hasAccess = await this.securityService.validateUserAccess(
      req.user.id,
      resourceType,
      resourceId,
      action
    );

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this resource');
    }

    return { hasAccess, userId: req.user.id, resourceType, resourceId, action };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('suspicious-activity')
  @ApiOperation({ summary: 'Get suspicious activity reports (admin only)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'Suspicious activity reports retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSuspiciousActivity(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string
  ) {
    // In a real implementation, this would fetch suspicious activity from the database
    // For now, returning a placeholder response
    return [];
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('log-security-event')
  @ApiOperation({ summary: 'Manually log a security event (admin only)' })
  @ApiResponse({ status: 201, description: 'Security event logged successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async logSecurityEvent(
    @Body('eventType') eventType: string,
    @Body('userId') userId: string,
    @Body('details') details?: Record<string, any>,
    @Ip() ipAddress?: string,
    @Req() req
  ) {
    await this.securityService.logSecurityEvent(
      eventType,
      userId,
      ipAddress || req.ip,
      req.get('User-Agent') || '',
      details
    );

    return { message: 'Security event logged successfully' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('log-audit-trail')
  @ApiOperation({ summary: 'Manually log an audit trail entry (admin only)' })
  @ApiResponse({ status: 201, description: 'Audit trail entry logged successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async logAuditTrail(
    @Body('action') action: string,
    @Body('userId') userId: string,
    @Body('resourceType') resourceType: string,
    @Body('resourceId') resourceId: string,
    @Body('oldValue') oldValue?: any,
    @Body('newValue') newValue?: any,
    @Ip() ipAddress?: string
  ) {
    await this.securityService.logAuditTrail(
      action,
      userId,
      resourceType,
      resourceId,
      oldValue,
      newValue,
      ipAddress
    );

    return { message: 'Audit trail entry logged successfully' };
  }
}