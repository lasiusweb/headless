import { Module } from '@nestjs/common';
import { DealersService } from './dealers.service';
import { DealersController } from './dealers.controller';
import { PricingService } from '../pricing/pricing.service';

@Module({
  controllers: [DealersController],
  providers: [DealersService, PricingService],
})
export class DealersModule {}