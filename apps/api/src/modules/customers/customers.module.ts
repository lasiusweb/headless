import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
