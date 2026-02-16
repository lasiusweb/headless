import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req
} from '@nestjs/common';
import { InventoryTrackingService } from './inventory-tracking.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { TransferInventoryDto } from './dto/transfer-inventory.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Inventory Tracking')
@Controller('inventory-tracking')
export class InventoryTrackingController {
  constructor(private readonly inventoryTrackingService: InventoryTrackingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('levels')
  @ApiOperation({ summary: 'Get inventory levels (admin only)' })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  @ApiQuery({ name: 'warehouseId', required: false, description: 'Filter by warehouse ID' })
  @ApiResponse({ status: 200, description: 'Inventory levels retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getInventoryLevels(
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string
  ) {
    return this.inventoryTrackingService.getInventoryLevels(productId, warehouseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items (admin only)' })
  @ApiQuery({ name: 'threshold', required: false, description: 'Stock threshold (default: 10)' })
  @ApiResponse({ status: 200, description: 'Low stock items retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getLowStockItems(@Query('threshold') threshold?: string) {
    const thresholdNum = threshold ? parseInt(threshold) : 10;
    return this.inventoryTrackingService.getLowStockItems(thresholdNum);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('out-of-stock')
  @ApiOperation({ summary: 'Get out of stock items (admin only)' })
  @ApiResponse({ status: 200, description: 'Out of stock items retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getOutOfStockItems() {
    return this.inventoryTrackingService.getOutOfStockItems();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('movement/:variantId')
  @ApiOperation({ summary: 'Get inventory movement history for a variant (admin only)' })
  @ApiParam({ name: 'variantId', description: 'Product variant ID' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look back (default: 30)' })
  @ApiResponse({ status: 200, description: 'Inventory movement history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product variant not found' })
  async getInventoryMovement(
    @Param('variantId') variantId: string,
    @Query('days') days?: string
  ) {
    const daysNum = days ? parseInt(days) : 30;
    return this.inventoryTrackingService.getInventoryMovement(variantId, daysNum);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('update')
  @ApiOperation({ summary: 'Update inventory level (admin only)' })
  @ApiResponse({ status: 200, description: 'Inventory level updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateInventory(@Body() updateInventoryDto: UpdateInventoryDto, @Req() req) {
    return this.inventoryTrackingService.updateInventoryLevel(
      updateInventoryDto.variantId,
      updateInventoryDto.warehouseId,
      updateInventoryDto.quantityChange,
      updateInventoryDto.reason,
      req.user.id
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('transfer')
  @ApiOperation({ summary: 'Transfer inventory between warehouses (admin only)' })
  @ApiResponse({ status: 200, description: 'Inventory transferred successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async transferInventory(@Body() transferInventoryDto: TransferInventoryDto, @Req() req) {
    return this.inventoryTrackingService.transferInventory(
      transferInventoryDto.fromWarehouseId,
      transferInventoryDto.toWarehouseId,
      transferInventoryDto.variantId,
      transferInventoryDto.quantity,
      transferInventoryDto.reason,
      req.user.id
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('reserve')
  @ApiOperation({ summary: 'Reserve inventory (admin only)' })
  @ApiResponse({ status: 200, description: 'Inventory reserved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async reserveInventory(
    @Body('variantId') variantId: string,
    @Body('warehouseId') warehouseId: string,
    @Body('quantity') quantity: number
  ) {
    return this.inventoryTrackingService.reserveInventory(variantId, warehouseId, quantity);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('release-reservation')
  @ApiOperation({ summary: 'Release inventory reservation (admin only)' })
  @ApiResponse({ status: 200, description: 'Reservation released successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async releaseReservation(
    @Body('variantId') variantId: string,
    @Body('warehouseId') warehouseId: string,
    @Body('quantity') quantity: number
  ) {
    return this.inventoryTrackingService.releaseReservation(variantId, warehouseId, quantity);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('report')
  @ApiOperation({ summary: 'Get inventory report (admin only)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for report' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for report' })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  @ApiQuery({ name: 'warehouseId', required: false, description: 'Filter by warehouse ID' })
  @ApiResponse({ status: 200, description: 'Inventory report retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getInventoryReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string
  ) {
    return this.inventoryTrackingService.getInventoryReport({
      startDate,
      endDate,
      productId,
      warehouseId
    });
  }
}