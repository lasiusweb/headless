import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { OrdersModule } from '../orders/orders.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [OrdersModule, ConfigModule],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}