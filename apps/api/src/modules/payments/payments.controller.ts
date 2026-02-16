import { Controller, Get, Post, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto, ProcessPaymentWebhookDto, RefundPaymentDto } from './dto/payment.dto';
import { PaymentIntent, RefundRequest } from './interfaces/payment.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto): Promise<PaymentIntent> {
    return this.paymentsService.createPaymentIntent(createPaymentIntentDto);
  }

  @Post('webhook/:gateway')
  @HttpCode(HttpStatus.OK)
  async processWebhook(
    @Param('gateway') gateway: string,
    @Body() payload: ProcessPaymentWebhookDto,
  ): Promise<boolean> {
    return this.paymentsService.processWebhook(payload);
  }

  @Post('refund')
  initiateRefund(@Body() refundPaymentDto: RefundPaymentDto): Promise<RefundRequest> {
    return this.paymentsService.initiateRefund(refundPaymentDto);
  }

  @Get('intent/:id')
  getPaymentIntentById(@Param('id') id: string): Promise<PaymentIntent> {
    return this.paymentsService.getPaymentIntentById(id);
  }

  @Get('intent/order/:orderId')
  getPaymentIntentsByOrder(@Param('orderId') orderId: string): Promise<PaymentIntent[]> {
    return this.paymentsService.getPaymentIntentsByOrder(orderId);
  }

  @Get('refund/:id')
  getRefundRequestById(@Param('id') id: string): Promise<RefundRequest> {
    return this.paymentsService.getRefundRequestById(id);
  }

  @Get('refund/order/:orderId')
  getRefundRequestsByOrder(@Param('orderId') orderId: string): Promise<RefundRequest[]> {
    return this.paymentsService.getRefundRequestsByOrder(orderId);
  }
}