import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { 
  CreateShippingOrderDto, 
  UpdateShippingOrderDto, 
  ShippingRateDto, 
  TrackShipmentDto 
} from './dto/shipping.dto';
import { ShippingOrder, ShippingRate, ShipmentTrackingEvent } from './interfaces/shipping.interface';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('order')
  createShippingOrder(@Body() createShippingOrderDto: CreateShippingOrderDto): Promise<ShippingOrder> {
    return this.shippingService.createShippingOrder(createShippingOrderDto);
  }

  @Put('order/:id')
  updateShippingOrder(
    @Param('id') id: string,
    @Body() updateShippingOrderDto: UpdateShippingOrderDto
  ): Promise<ShippingOrder> {
    return this.shippingService.updateShippingOrder(id, updateShippingOrderDto);
  }

  @Get('order/:id')
  getShippingOrderById(@Param('id') id: string): Promise<ShippingOrder> {
    return this.shippingService.getShippingOrderById(id);
  }

  @Get('order/tracking/:trackingNumber')
  getShippingOrderByTrackingNumber(@Param('trackingNumber') trackingNumber: string): Promise<ShippingOrder> {
    return this.shippingService.getShippingOrderByTrackingNumber(trackingNumber);
  }

  @Get('order/order/:orderId')
  getShippingOrdersByOrder(@Param('orderId') orderId: string): Promise<ShippingOrder[]> {
    return this.shippingService.getShippingOrdersByOrder(orderId);
  }

  @Get('order/customer/:customerId')
  getShippingOrdersByCustomer(@Param('customerId') customerId: string): Promise<ShippingOrder[]> {
    return this.shippingService.getShippingOrdersByCustomer(customerId);
  }

  @Get('order/status/:status')
  getShippingOrdersByStatus(@Param('status') status: string): Promise<ShippingOrder[]> {
    return this.shippingService.getShippingOrdersByStatus(status);
  }

  @Post('track')
  getTrackingHistory(@Body() trackShipmentDto: TrackShipmentDto): Promise<ShipmentTrackingEvent[]> {
    return this.shippingService.getTrackingHistory(trackShipmentDto.trackingNumber);
  }

  @Post('rate')
  createShippingRate(@Body() shippingRateDto: ShippingRateDto): Promise<ShippingRate> {
    return this.shippingService.createShippingRate(shippingRateDto);
  }

  @Get('rate/:carrier/:serviceType/:originPincode/:destPincode/:weight')
  getShippingRate(
    @Param('carrier') carrier: string,
    @Param('serviceType') serviceType: string,
    @Param('originPincode') originPincode: string,
    @Param('destPincode') destPincode: string,
    @Param('weight') weight: number
  ): Promise<ShippingRate | null> {
    return this.shippingService.getShippingRate(carrier, serviceType, originPincode, destPincode, weight);
  }

  @Get('cost/:carrier/:serviceType/:originPincode/:destPincode/:weight')
  calculateShippingCost(
    @Param('carrier') carrier: string,
    @Param('serviceType') serviceType: string,
    @Param('originPincode') originPincode: string,
    @Param('destPincode') destPincode: string,
    @Param('weight') weight: number
  ): Promise<number> {
    return this.shippingService.calculateShippingCost(carrier, serviceType, originPincode, destPincode, weight);
  }
}