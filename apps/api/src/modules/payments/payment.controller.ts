import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Query,
  Headers,
  Param
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment for an order' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async initiatePayment(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    return this.paymentService.initiatePayment(createPaymentDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async verifyPayment(
    @Body('paymentId') paymentId: string,
    @Body('gateway') gateway: string,
    @Body('gatewayData') gatewayData: any
  ) {
    return this.paymentService.verifyPayment(paymentId, gateway, gatewayData);
  }

  @Post('webhook/:gateway')
  @ApiOperation({ summary: 'Handle payment gateway webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async handleWebhook(
    @Param('gateway') gateway: string,
    @Body() payload: any
  ) {
    return this.paymentService.handleWebhook(gateway, payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('refund')
  @ApiOperation({ summary: 'Process a refund for a payment' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async refundPayment(
    @Body('paymentId') paymentId: string,
    @Req() req,
    @Body('amount') amount?: number,
    @Body('reason') reason?: string
  ) {
    return this.paymentService.refundPayment(paymentId, amount, reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-payments')
  @ApiOperation({ summary: 'Get user\'s payment history' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserPayments(@Req() req) {
    return this.paymentService.getUserPaymentHistory(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('partial')
  @ApiOperation({ summary: 'Initiate a partial payment for an order' })
  @ApiResponse({ status: 201, description: 'Partial payment initiated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async processPartialPayment(
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Req() req
  ) {
    return this.paymentService.processPartialPayment(orderId, req.user.id, amount);
  }
}