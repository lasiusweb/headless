import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}