import { Module } from '@nestjs/common';
import { ZohoIntegrationService } from './zoho-integration.service';
import { ZohoIntegrationController } from './zoho-integration.controller';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ZohoIntegrationController],
  providers: [ZohoIntegrationService],
  exports: [ZohoIntegrationService],
})
export class ZohoIntegrationModule {}