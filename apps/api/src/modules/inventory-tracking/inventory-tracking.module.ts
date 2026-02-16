import { Module } from '@nestjs/common';
import { InventoryTrackingService } from './inventory-tracking.service';
import { InventoryTrackingController } from './inventory-tracking.controller';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [InventoryTrackingController],
  providers: [InventoryTrackingService],
  exports: [InventoryTrackingService],
})
export class InventoryTrackingModule {}