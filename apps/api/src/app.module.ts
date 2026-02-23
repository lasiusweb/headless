import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { HealthModule } from './modules/health/health.module';
import { ProductModule } from './modules/products/product.module';
import { CategoryModule } from './modules/categories/category.module';
import { SegmentModule } from './modules/segments/segment.module';
import { CropModule } from './modules/crops/crop.module';
import { ProblemModule } from './modules/problems/problem.module';
import { ProductVariantModule } from './modules/product-variants/product-variant.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AddressModule } from './modules/addresses/address.module';
import { DealerApplicationModule } from './modules/dealer-applications/dealer-application.module';
import { DealersModule } from './modules/dealers/dealers.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { AdminModule } from './modules/admin/admin.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ZohoModule } from './modules/zoho/zoho.module';
import { ShippingLogisticsModule } from './modules/shipping-logistics/shipping-logistics.module';
import { InventoryTrackingModule } from './modules/inventory-tracking/inventory-tracking.module';
import { ZohoIntegrationModule } from './modules/zoho-integration/zoho-integration.module';
import { GstComplianceModule } from './modules/gst-compliance/gst-compliance.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { LoyaltyProgramModule } from './modules/loyalty-program/loyalty-program.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { ForecastingModule } from './modules/forecasting/forecasting.module';
import { PaymentReconciliationModule } from './modules/payment-reconciliation/payment-reconciliation.module';
import { CrmModule } from './modules/crm/crm.module';
import { SupplierModule } from './modules/supplier-management/supplier.module';
import { LoggingModule } from './modules/logging/logging.module';
import { PosModule } from './modules/pos/pos.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { SecurityModule } from './modules/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    HealthModule,
    AuthModule,
    ProductModule,
    CategoryModule,
    SegmentModule,
    CropModule,
    ProblemModule,
    ProductVariantModule,
    CartModule,
    OrdersModule,
    AddressModule,
    DealerApplicationModule,
    DealersModule,
    PricingModule,
    AdminModule,
    InventoryModule,
    PosModule,
    ShippingModule,
    PaymentsModule,
    InvoicesModule,
    ZohoModule,
    ShippingLogisticsModule,
    InventoryTrackingModule,
    ZohoIntegrationModule,
    GstComplianceModule,
    UserManagementModule,
    LoyaltyProgramModule,
    AnalyticsModule,
    NotificationModule,
    ForecastingModule,
    PaymentReconciliationModule,
    CrmModule,
    SupplierModule,
    LoggingModule,
    ReturnsModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
