import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { SupabaseModule } from '../../supabase/supabase.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [SupabaseModule, CartModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}