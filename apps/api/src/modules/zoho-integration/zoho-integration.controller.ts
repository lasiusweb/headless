import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
  Req
} from '@nestjs/common';
import { ZohoIntegrationService } from './zoho-integration.service';
import { SyncOrderToZohoDto } from './dto/sync-order-to-zoho.dto';
import { SyncPaymentToZohoDto } from './dto/sync-payment-to-zoho.dto';
import { SyncCustomerToZohoDto } from './dto/sync-customer-to-zoho.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Zoho Integration')
@Controller('zoho-integration')
export class ZohoIntegrationController {
  constructor(private readonly zohoIntegrationService: ZohoIntegrationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('sync-order')
  @ApiOperation({ summary: 'Sync an order to Zoho Books (admin only)' })
  @ApiResponse({ status: 200, description: 'Order synced to Zoho successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async syncOrderToZoho(@Body() syncOrderDto: SyncOrderToZohoDto) {
    return this.zohoIntegrationService.syncOrderToZoho(syncOrderDto.orderId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('sync-payment')
  @ApiOperation({ summary: 'Sync a payment to Zoho Books (admin only)' })
  @ApiResponse({ status: 200, description: 'Payment synced to Zoho successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async syncPaymentToZoho(@Body() syncPaymentDto: SyncPaymentToZohoDto) {
    return this.zohoIntegrationService.syncPaymentToZoho(syncPaymentDto.paymentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('sync-customer')
  @ApiOperation({ summary: 'Sync a customer to Zoho Books (admin only)' })
  @ApiResponse({ status: 200, description: 'Customer synced to Zoho successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async syncCustomerToZoho(@Body() syncCustomerDto: SyncCustomerToZohoDto) {
    return this.zohoIntegrationService.syncCustomerToZoho(syncCustomerDto.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('sync-product')
  @ApiOperation({ summary: 'Sync a product to Zoho Books (admin only)' })
  @ApiResponse({ status: 200, description: 'Product synced to Zoho successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async syncProductToZoho(@Body('productId') productId: string) {
    return this.zohoIntegrationService.syncProductToZoho(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('sync-inventory')
  @ApiOperation({ summary: 'Sync inventory to Zoho Books (admin only)' })
  @ApiResponse({ status: 200, description: 'Inventory synced to Zoho successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  async syncInventoryToZoho(@Body('productId') productId: string) {
    return this.zohoIntegrationService.syncInventoryToZoho(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('sync-shipment')
  @ApiOperation({ summary: 'Sync a shipment to Zoho Books (admin only)' })
  @ApiResponse({ status: 200, description: 'Shipment synced to Zoho successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async syncShipmentToZoho(@Body('shipmentId') shipmentId: string) {
    return this.zohoIntegrationService.syncShipmentToZoho(shipmentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('sync-dealer-application')
  @ApiOperation({ summary: 'Sync a dealer application to Zoho CRM (admin only)' })
  @ApiResponse({ status: 200, description: 'Dealer application synced to Zoho CRM successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Dealer application not found' })
  async syncDealerApplicationToZoho(@Body('applicationId') applicationId: string) {
    return this.zohoIntegrationService.syncDealerApplicationToZoho(applicationId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('sync-status')
  @ApiOperation({ summary: 'Get Zoho sync status (admin only)' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type (order, payment, customer, product, inventory, shipment, dealer_application)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by sync status (success, failed, pending)' })
  @ApiResponse({ status: 200, description: 'Sync status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSyncStatus(
    @Query('entityType') entityType?: string,
    @Query('status') status?: string
  ) {
    return this.zohoIntegrationService.getSyncStatus(entityType, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('resync-failed')
  @ApiOperation({ summary: 'Resync all failed operations (admin only)' })
  @ApiResponse({ status: 200, description: 'Failed operations resynced successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async resyncFailedOperations() {
    return this.zohoIntegrationService.resyncFailedOperations();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('health-check')
  @ApiOperation({ summary: 'Health check for Zoho integration (admin only)' })
  @ApiResponse({ status: 200, description: 'Zoho integration health status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async healthCheck() {
    return this.zohoIntegrationService.healthCheck();
  }
}