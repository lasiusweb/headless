import { Controller, Post, Body, Headers, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZohoWebhookService } from './zoho-webhook.service';

@ApiTags('Zoho Webhooks')
@Controller('webhooks/zoho')
export class ZohoWebhookController {
  private readonly logger = new Logger(ZohoWebhookController.name);

  constructor(private readonly webhookService: ZohoWebhookService) {}

  @Post('books')
  @ApiOperation({ summary: 'Handle Zoho Books webhook notifications' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleBooksWebhook(
    @Body() payload: any,
    @Headers('x-zoho-signature') signature: string,
  ) {
    this.logger.log('Received Zoho Books webhook', JSON.stringify(payload));

    // Verify webhook signature
    const isValid = await this.webhookService.verifyWebhookSignature(payload, signature, 'books');
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process the webhook
    const result = await this.webhookService.processBooksWebhook(payload);

    return {
      success: true,
      message: 'Webhook processed successfully',
      ...result,
    };
  }

  @Post('crm')
  @ApiOperation({ summary: 'Handle Zoho CRM webhook notifications' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleCrmWebhook(
    @Body() payload: any,
    @Headers('x-zoho-signature') signature: string,
  ) {
    this.logger.log('Received Zoho CRM webhook', JSON.stringify(payload));

    // Verify webhook signature
    const isValid = await this.webhookService.verifyWebhookSignature(payload, signature, 'crm');
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process the webhook
    const result = await this.webhookService.processCrmWebhook(payload);

    return {
      success: true,
      message: 'Webhook processed successfully',
      ...result,
    };
  }
}
