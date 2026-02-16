import { Module } from '@nestjs/common';
import { ShippingLogisticsService } from './shipping-logistics.service';
import { ShippingLogisticsController } from './shipping-logistics.controller';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ShippingLogisticsController],
  providers: [ShippingLogisticsService],
  exports: [ShippingLogisticsService],
})
export class ShippingLogisticsModule {}