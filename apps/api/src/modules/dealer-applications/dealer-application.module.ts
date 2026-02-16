import { Module } from '@nestjs/common';
import { DealerApplicationService } from './dealer-application.service';
import { DealerApplicationController } from './dealer-application.controller';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [DealerApplicationController],
  providers: [DealerApplicationService],
  exports: [DealerApplicationService],
})
export class DealerApplicationModule {}