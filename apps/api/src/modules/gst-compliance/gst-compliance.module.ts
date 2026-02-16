import { Module } from '@nestjs/common';
import { GstComplianceService } from './gst-compliance.service';
import { GstComplianceController } from './gst-compliance.controller';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [GstComplianceController],
  providers: [GstComplianceService],
  exports: [GstComplianceService],
})
export class GstComplianceModule {}