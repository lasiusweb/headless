import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
  Req
} from '@nestjs/common';
import { ShippingLogisticsService } from './shipping-logistics.service';
import { CreateShippingRequestDto } from './dto/create-shipping-request.dto';
import { UpdateShippingRequestDto } from './dto/update-shipping-request.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Shipping & Logistics')
@Controller('shipping')
export class ShippingLogisticsController {
  constructor(private readonly shippingLogisticsService: ShippingLogisticsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('rates')
  @ApiOperation({ summary: 'Calculate shipping rates for an order' })
  @ApiQuery({ name: 'fromPincode', description: 'Origin pincode' })
  @ApiQuery({ name: 'toPincode', description: 'Destination pincode' })
  @ApiQuery({ name: 'weight', description: 'Package weight in kg' })
  @ApiQuery({ name: 'carrierId', required: false, description: 'Specific carrier ID (optional)' })
  @ApiResponse({ status: 200, description: 'Shipping rates calculated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async calculateRates(
    @Query('fromPincode') fromPincode: string,
    @Query('toPincode') toPincode: string,
    @Query('weight') weight: number,
    @Query('carrierId') carrierId?: string
  ) {
    return this.shippingLogisticsService.calculateShippingRates(
      fromPincode,
      toPincode,
      weight,
      carrierId
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('request')
  @ApiOperation({ summary: 'Create a shipping request for an order' })
  @ApiResponse({ status: 201, description: 'Shipping request created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createShippingRequest(
    @Body() createShippingRequestDto: CreateShippingRequestDto,
    @Req() req
  ) {
    return this.shippingLogisticsService.createShippingRequest(
      createShippingRequestDto,
      req.user.id
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-shipments')
  @ApiOperation({ summary: 'Get all shipments for authenticated user' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'List of shipments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserShipments(
    @Req() req,
    @Query('status') status?: string
  ) {
    return this.shippingLogisticsService.getShipmentsByUser(req.user.id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get shipments for a specific order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'List of shipments for order' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getShipmentsByOrder(
    @Param('orderId') orderId: string,
    @Req() req
  ) {
    return this.shippingLogisticsService.getShipmentsByOrder(orderId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':trackingNumber')
  @ApiOperation({ summary: 'Track a shipment by tracking number' })
  @ApiParam({ name: 'trackingNumber', description: 'Tracking number' })
  @ApiResponse({ status: 200, description: 'Shipment tracking information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return this.shippingLogisticsService.trackShipment(trackingNumber);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update shipment status (admin only)' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Shipment status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async updateShipmentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req,
    @Body('trackingData') trackingData?: any
  ) {
    return this.shippingLogisticsService.updateShipmentStatus(id, status, trackingData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Get all shipments (admin only)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'List of all shipments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllShipments(@Query('status') status?: string) {
    // In a real implementation, this would fetch all shipments
    // For now, returning a placeholder response
    return [];
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id/details')
  @ApiOperation({ summary: 'Get shipment details by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Shipment details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async getShipment(@Param('id') id: string) {
    // In a real implementation, this would fetch a specific shipment
    // For now, returning a placeholder response
    return { id };
  }
}