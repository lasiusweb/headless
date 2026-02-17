import { Module } from '@nestjs/common';
import { ZohoIntegrationService } from './zoho-integration.service';
import { ZohoIntegrationController } from './zoho-integration.controller';
import { ZohoWebhookController } from './zoho-webhook.controller';
import { ZohoWebhookService } from './zoho-webhook.service';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ZohoIntegrationController, ZohoWebhookController],
  providers: [ZohoIntegrationService, ZohoWebhookService],
  exports: [ZohoIntegrationService, ZohoWebhookService],
})
export class ZohoIntegrationModule {}