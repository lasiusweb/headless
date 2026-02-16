import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { 
  CreateOrderDto, 
  UpdateOrderDto, 
  ApproveOrderDto, 
  RejectOrderDto, 
  ShipOrderDto 
} from './dto/order.dto';
import { Order } from './interfaces/order.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  findAll(): Promise<Order[]> {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.getOrderById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto): Promise<Order> {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  @Post(':id/approve')
  approveOrder(@Param('id') id: string, @Body() approveOrderDto: ApproveOrderDto): Promise<Order> {
    return this.ordersService.approveOrder(id, approveOrderDto);
  }

  @Post(':id/reject')
  rejectOrder(@Param('id') id: string, @Body() rejectOrderDto: RejectOrderDto): Promise<Order> {
    return this.ordersService.rejectOrder(id, rejectOrderDto);
  }

  @Post(':id/ship')
  shipOrder(@Param('id') id: string, @Body() shipOrderDto: ShipOrderDto): Promise<any> {
    return this.ordersService.shipOrder(id, shipOrderDto);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string): Promise<Order[]> {
    return this.ordersService.getOrdersByCustomer(customerId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string): Promise<Order[]> {
    return this.ordersService.getOrdersByStatus(status);
  }

  @Get('pending-approvals')
  getPendingApprovals(): Promise<Order[]> {
    return this.ordersService.getPendingApprovals();
  }

  @Get('order-number/:orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string): Promise<Order> {
    return this.ordersService.getOrderByOrderNumber(orderNumber);
  }
}