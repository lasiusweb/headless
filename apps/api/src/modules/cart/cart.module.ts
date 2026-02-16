import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [SupabaseModule, PricingModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}