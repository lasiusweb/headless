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
  Req
} from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Payment Gateway')
@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment for an order' })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async initiatePayment(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    return this.paymentGatewayService.initiatePayment(createPaymentDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment with gateway' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async verifyPayment(
    @Body('paymentId') paymentId: string,
    @Body('gateway') gateway: string,
    @Body('gatewayData') gatewayData: any,
    @Req() req
  ) {
    return this.paymentGatewayService.verifyPayment(paymentId, gateway, gatewayData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/refund')
  @ApiOperation({ summary: 'Process a refund for a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refundPayment(
    @Param('id') paymentId: string,
    @Req() req,
    @Body('amount') amount?: number,
    @Body('reason') reason?: string
  ) {
    return this.paymentGatewayService.refundPayment(paymentId, amount, reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-payments')
  @ApiOperation({ summary: 'Get all payments for authenticated user' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserPayments(@Req() req) {
    // In a real implementation, this would fetch payments for the user
    // For now, returning a placeholder response
    return [];
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Get all payments (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all payments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllPayments() {
    // In a real implementation, this would fetch all payments
    // For now, returning a placeholder response
    return [];
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') id: string) {
    // In a real implementation, this would fetch a specific payment
    // For now, returning a placeholder response
    return { id };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment (admin only)' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async updatePayment(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    // In a real implementation, this would update a payment
    // For now, returning a placeholder response
    return { id, ...updatePaymentDto };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a payment (admin only)' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async removePayment(@Param('id') id: string) {
    // In a real implementation, this would delete a payment
    // For now, returning a placeholder response
    return { message: 'Payment deleted successfully' };
  }

  // Webhook endpoints for payment gateways
  @Post('webhook/easebuzz')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Easebuzz payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleEasebuzzWebhook(@Body() payload: any) {
    // Process Easebuzz webhook
    // In a real implementation, this would validate the payload and update payment status
    console.log('Easebuzz webhook received:', payload);
    return { status: 'success' };
  }

  @Post('webhook/payu')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PayU payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handlePayUWebhook(@Body() payload: any) {
    // Process PayU webhook
    // In a real implementation, this would validate the payload and update payment status
    console.log('PayU webhook received:', payload);
    return { status: 'success' };
  }

  @Post('webhook/razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleRazorpayWebhook(@Body() payload: any) {
    // Process Razorpay webhook
    // In a real implementation, this would validate the payload and update payment status
    console.log('Razorpay webhook received:', payload);
    return { status: 'success' };
  }
}