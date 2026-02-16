import { Module } from '@nestjs/common';
import { PaymentReconciliationService } from './payment-reconciliation.service';
import { PaymentReconciliationController } from './payment-reconciliation.controller';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PaymentReconciliationController],
  providers: [PaymentReconciliationService],
  exports: [PaymentReconciliationService],
})
export class PaymentReconciliationModule {}