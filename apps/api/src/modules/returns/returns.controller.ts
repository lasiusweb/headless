import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { 
  CreateReturnRequestDto, 
  UpdateReturnRequestDto, 
  CreateRefundDto, 
  UpdateRefundDto, 
  CreateExchangeDto,
  CreateReturnReasonDto,
  UpdateReturnReasonDto,
  CreateReturnPolicyDto,
  UpdateReturnPolicyDto
} from './dto/returns.dto';
import { 
  ReturnRequest, 
  Refund, 
  Exchange, 
  ReturnReason, 
  ReturnPolicy,
  ReturnAnalytics
} from './interfaces/returns.interface';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post('requests')
  createReturnRequest(@Body() createReturnRequestDto: CreateReturnRequestDto): Promise<ReturnRequest> {
    return this.returnsService.createReturnRequest(createReturnRequestDto);
  }

  @Put('requests/:id')
  updateReturnRequest(
    @Param('id') id: string,
    @Body() updateReturnRequestDto: UpdateReturnRequestDto
  ): Promise<ReturnRequest> {
    return this.returnsService.updateReturnRequest(id, updateReturnRequestDto);
  }

  @Get('requests/:id')
  getReturnRequestById(@Param('id') id: string): Promise<ReturnRequest> {
    return this.returnsService.getReturnRequestById(id);
  }

  @Get('requests/order/:orderId')
  getReturnRequestsByOrder(@Param('orderId') orderId: string): Promise<ReturnRequest[]> {
    return this.returnsService.getReturnRequestsByOrder(orderId);
  }

  @Get('requests/customer/:customerId')
  getReturnRequestsByCustomer(@Param('customerId') customerId: string): Promise<ReturnRequest[]> {
    return this.returnsService.getReturnRequestsByCustomer(customerId);
  }

  @Get('requests/status/:status')
  getReturnRequestsByStatus(@Param('status') status: string): Promise<ReturnRequest[]> {
    return this.returnsService.getReturnRequestsByStatus(status);
  }

  @Post('refunds')
  createRefund(@Body() createRefundDto: CreateRefundDto): Promise<Refund> {
    return this.returnsService.createRefund(createRefundDto);
  }

  @Put('refunds/:id')
  updateRefund(
    @Param('id') id: string,
    @Body() updateRefundDto: UpdateRefundDto
  ): Promise<Refund> {
    return this.returnsService.updateRefund(id, updateRefundDto);
  }

  @Post('exchanges')
  createExchange(@Body() createExchangeDto: CreateExchangeDto): Promise<Exchange> {
    return this.returnsService.createExchange(createExchangeDto);
  }

  @Get('reasons')
  getReturnReasons(): Promise<ReturnReason[]> {
    return this.returnsService.getReturnReasons();
  }

  @Post('reasons')
  createReturnReason(@Body() createReturnReasonDto: CreateReturnReasonDto): Promise<ReturnReason> {
    return this.returnsService.createReturnReason(createReturnReasonDto);
  }

  @Get('policies')
  getReturnPolicies(): Promise<ReturnPolicy[]> {
    return this.returnsService.getReturnPolicies();
  }

  @Post('policies')
  createReturnPolicy(@Body() createReturnPolicyDto: CreateReturnPolicyDto): Promise<ReturnPolicy> {
    return this.returnsService.createReturnPolicy(createReturnPolicyDto);
  }

  @Get('analytics/:period')
  getReturnAnalytics(@Param('period') period: string): Promise<ReturnAnalytics> {
    return this.returnsService.getReturnAnalytics(period);
  }
}