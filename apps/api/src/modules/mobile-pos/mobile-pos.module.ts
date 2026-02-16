import { Module } from '@nestjs/common';
import { MobilePosService } from './mobile-pos.service';
import { MobilePosController } from './mobile-pos.controller';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MobilePosController],
  providers: [MobilePosService],
  exports: [MobilePosService]
})
export class MobilePosModule {}