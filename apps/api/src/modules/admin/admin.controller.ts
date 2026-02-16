import { 
  Controller, 
  Get, 
  UseGuards,
  Req
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('user-management-stats')
  @ApiOperation({ summary: 'Get user management statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'User management statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUserManagementStats() {
    return this.adminService.getUserManagementStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('order-management-stats')
  @ApiOperation({ summary: 'Get order management statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Order management statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getOrderManagementStats() {
    return this.adminService.getOrderManagementStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('inventory-management-stats')
  @ApiOperation({ summary: 'Get inventory management statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Inventory management statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getInventoryManagementStats() {
    return this.adminService.getInventoryManagementStats();
  }
}