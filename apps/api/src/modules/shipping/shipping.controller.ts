import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShippingService, ShippingRate, Shipment, TrackingEvent } from './shipping.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class GetRatesDto {
  originPincode: string;
  destinationPincode: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
}

class CreateShipmentDto {
  orderId: string;
  carrier: string;
  service: string;
  pickupAddress: any;
  deliveryAddress: any;
  items: any[];
  weight: number;
}

@ApiTags('Shipping')
@Controller('shipping')
@UseGuards(JwtAuthGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('rates')
  @ApiOperation({ summary: 'Get shipping rates from multiple carriers' })
  @ApiResponse({ status: 200, description: 'List of shipping rates' })
  async getRates(@Query() query: GetRatesDto): Promise<ShippingRate[]> {
    return this.shippingService.getShippingRates(query);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create shipment with carrier' })
  @ApiResponse({ status: 201, description: 'Shipment created successfully' })
  async createShipment(@Body() body: CreateShipmentDto): Promise<Shipment> {
    return this.shippingService.createShipment(body);
  }

  @Get('track/:awbNumber')
  @ApiOperation({ summary: 'Track shipment by AWB number' })
  @ApiResponse({ status: 200, description: 'Tracking events' })
  async trackShipment(
    @Param('awbNumber') awbNumber: string,
    @Query('carrier') carrier: string,
  ): Promise<TrackingEvent[]> {
    return this.shippingService.trackShipment(awbNumber, carrier);
  }

  @Post('cancel/:awbNumber')
  @ApiOperation({ summary: 'Cancel shipment' })
  @ApiResponse({ status: 200, description: 'Shipment cancelled' })
  async cancelShipment(
    @Param('awbNumber') awbNumber: string,
    @Query('carrier') carrier: string,
  ): Promise<{ success: boolean }> {
    const result = await this.shippingService.cancelShipment(awbNumber, carrier);
    return { success: result };
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get shipments for an order' })
  @ApiResponse({ status: 200, description: 'List of shipments' })
  async getShipmentsByOrder(@Param('orderId') orderId: string): Promise<any[]> {
    return this.shippingService.getShipmentsByOrderId(orderId);
  }
}
