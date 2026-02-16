import { Module } from '@nestjs/common';
import { LoyaltyProgramService } from './loyalty-program.service';
import { LoyaltyProgramController } from './loyalty-program.controller';
import { OrdersModule } from '../orders/orders.module';
import { CustomersModule } from '../customers/customers.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    OrdersModule,
    CustomersModule,
    ConfigModule,
  ],
  controllers: [LoyaltyProgramController],
  providers: [LoyaltyProgramService],
  exports: [LoyaltyProgramService],
})
export class LoyaltyProgramModule {}