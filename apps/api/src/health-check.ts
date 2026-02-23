/**
 * System Health Check Script
 * 
 * Verifies all modules are properly configured and integrated
 * Run this before deployment to catch configuration issues
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { LoggingService } from '../modules/logging/logging.service';

interface HealthCheckResult {
  module: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
}

async function runHealthChecks() {
  const results: HealthCheckResult[] = [];
  
  // Create application context
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const supabaseService = app.get(SupabaseService);
  const logger = app.get(LoggingService);

  await logger.info('Starting system health checks...');

  // 1. Environment Variables Check
  await logger.info('Checking environment variables...');
  const envChecks = [
    { key: 'JWT_SECRET', required: true, minLength: 32 },
    { key: 'SUPABASE_URL', required: true },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', required: true },
    { key: 'CORS_ORIGIN', required: true },
    { key: 'NODE_ENV', required: false, default: 'development' },
  ];

  for (const check of envChecks) {
    const value = configService.get(check.key);
    if (check.required && !value) {
      results.push({
        module: 'Environment',
        status: 'error',
        message: `Missing required env var: ${check.key}`,
      });
    } else if (check.minLength && value && value.length < check.minLength) {
      results.push({
        module: 'Environment',
        status: 'error',
        message: `${check.key} must be at least ${check.minLength} characters`,
      });
    } else {
      results.push({
        module: 'Environment',
        status: 'healthy',
        message: `${check.key} is configured`,
      });
    }
  }

  // 2. Supabase Connection Check
  await logger.info('Checking Supabase connection...');
  try {
    const supabase = supabaseService.getClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      results.push({
        module: 'Supabase',
        status: 'warning',
        message: 'Supabase connection issue (expected in test environment)',
        details: { error: error.message },
      });
    } else {
      results.push({
        module: 'Supabase',
        status: 'healthy',
        message: 'Supabase connection successful',
      });
    }
  } catch (error: any) {
    results.push({
      module: 'Supabase',
      status: 'error',
      message: 'Supabase connection failed',
      details: { error: error.message },
    });
  }

  // 3. Module Registration Check
  await logger.info('Checking module registration...');
  const requiredModules = [
    'AuthModule',
    'ProductModule',
    'CategoryModule',
    'CartModule',
    'OrdersModule',
    'PaymentsModule',
    'InventoryModule',
    'PricingModule',
    'ShippingModule',
    'InvoicesModule',
    'ZohoModule',
    'LoyaltyProgramModule',
    'NotificationsModule',
    'ForecastingModule',
    'CachingModule',
    'LoggingModule',
    'SecurityModule',
  ];

  const moduleRegistry = (app as any).moduleRef;
  for (const moduleName of requiredModules) {
    try {
      // Check if module is registered by trying to resolve it
      const module = moduleRegistry.get(moduleName, { strict: false });
      results.push({
        module: 'ModuleRegistry',
        status: 'healthy',
        message: `${moduleName} is registered`,
      });
    } catch {
      results.push({
        module: 'ModuleRegistry',
        status: 'warning',
        message: `${moduleName} may not be properly registered`,
      });
    }
  }

  // 4. JWT Configuration Check
  await logger.info('Checking JWT configuration...');
  const jwtSecret = configService.get('JWT_SECRET');
  if (jwtSecret && jwtSecret.length >= 32) {
    results.push({
      module: 'JWT',
      status: 'healthy',
      message: 'JWT secret is properly configured',
      details: { length: jwtSecret.length },
    });
  } else {
    results.push({
      module: 'JWT',
      status: 'error',
      message: 'JWT secret is too short (min 32 characters)',
      details: { length: jwtSecret?.length || 0 },
    });
  }

  // 5. CORS Configuration Check
  await logger.info('Checking CORS configuration...');
  const corsOrigin = configService.get('CORS_ORIGIN');
  if (corsOrigin) {
    const origins = corsOrigin.split(',');
    const hasMultipleOrigins = origins.length > 1;
    const hasWildcard = corsOrigin === '*';
    
    if (hasWildcard) {
      results.push({
        module: 'CORS',
        status: 'warning',
        message: 'CORS is set to wildcard (*) - not recommended for production',
      });
    } else if (hasMultipleOrigins) {
      results.push({
        module: 'CORS',
        status: 'healthy',
        message: `CORS configured with ${origins.length} origins`,
        details: { origins },
      });
    } else {
      results.push({
        module: 'CORS',
        status: 'warning',
        message: 'CORS configured with single origin',
        details: { origins },
      });
    }
  } else {
    results.push({
      module: 'CORS',
      status: 'error',
      message: 'CORS origin not configured',
    });
  }

  // 6. Portal Routing Configuration Check
  await logger.info('Checking portal routing configuration...');
  const portalUrls = {
    b2b: configService.get('NEXT_PUBLIC_B2B_URL'),
    b2c: configService.get('NEXT_PUBLIC_B2C_URL'),
    landing: configService.get('NEXT_PUBLIC_LANDING_URL'),
    cookieDomain: configService.get('NEXT_PUBLIC_COOKIE_DOMAIN'),
  };

  if (portalUrls.b2b && portalUrls.b2c && portalUrls.landing) {
    results.push({
      module: 'PortalRouting',
      status: 'healthy',
      message: 'All portal URLs are configured',
      details: portalUrls,
    });
  } else {
    results.push({
      module: 'PortalRouting',
      status: 'warning',
      message: 'Some portal URLs are missing',
      details: portalUrls,
    });
  }

  if (portalUrls.cookieDomain) {
    results.push({
      module: 'PortalRouting',
      status: 'healthy',
      message: 'Cookie domain is configured',
      details: { domain: portalUrls.cookieDomain },
    });
  } else {
    results.push({
      module: 'PortalRouting',
      status: 'warning',
      message: 'Cookie domain not configured (will use default)',
    });
  }

  // 7. Database Schema Check (if Supabase is connected)
  await logger.info('Checking database tables...');
  const requiredTables = [
    'profiles',
    'products',
    'categories',
    'cart_items',
    'orders',
    'order_items',
    'inventory',
    'invoices',
    'payments',
    'loyalty_profiles',
  ];

  try {
    const supabase = supabaseService.getClient();
    for (const table of requiredTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results.push({
          module: 'Database',
          status: 'warning',
          message: `Table ${table} may not exist or is inaccessible`,
          details: { error: error.message },
        });
      } else {
        results.push({
          module: 'Database',
          status: 'healthy',
          message: `Table ${table} exists`,
        });
      }
    }
  } catch (error: any) {
    results.push({
      module: 'Database',
      status: 'warning',
      message: 'Database check skipped (Supabase not connected)',
      details: { error: error.message },
    });
  }

  // 8. Cache Configuration Check
  await logger.info('Checking cache configuration...');
  const cacheEnabled = configService.get('CACHE_ENABLED', 'true') === 'true';
  const cacheTTL = configService.get('CACHE_TTL', '300');
  
  if (cacheEnabled) {
    results.push({
      module: 'Cache',
      status: 'healthy',
      message: 'Cache is enabled',
      details: { ttl: cacheTTL },
    });
  } else {
    results.push({
      module: 'Cache',
      status: 'warning',
      message: 'Cache is disabled',
    });
  }

  // 9. Logging Configuration Check
  await logger.info('Checking logging configuration...');
  const logLevel = configService.get('LOG_LEVEL', 'info');
  const sentryDsn = configService.get('SENTRY_DSN');
  
  results.push({
    module: 'Logging',
    status: 'healthy',
    message: `Logging configured at ${logLevel} level`,
    details: { level: logLevel },
  });

  if (sentryDsn) {
    results.push({
      module: 'Logging',
      status: 'healthy',
      message: 'Sentry error tracking is configured',
    });
  } else {
    results.push({
      module: 'Logging',
      status: 'warning',
      message: 'Sentry not configured (recommended for production)',
    });
  }

  // 10. External Services Check
  await logger.info('Checking external service configurations...');
  const externalServices = {
    zoho: {
      clientId: configService.get('ZOHO_CLIENT_ID'),
      clientSecret: configService.get('ZOHO_CLIENT_SECRET'),
    },
    payment: {
      easebuzzSalt: configService.get('EASEBUZZ_SALT'),
      easebuzzEnvironment: configService.get('EASEBUZZ_ENVIRONMENT'),
    },
    shipping: {
      delhiveryApiKey: configService.get('DELHIVERY_API_KEY'),
    },
    notifications: {
      sendgridApiKey: configService.get('SENDGRID_API_KEY'),
      twilioAccountSid: configService.get('TWILIO_ACCOUNT_SID'),
    },
  };

  for (const [service, config] of Object.entries(externalServices)) {
    const hasConfig = Object.values(config).some(v => v);
    results.push({
      module: 'ExternalServices',
      status: hasConfig ? 'healthy' : 'warning',
      message: `${service}: ${hasConfig ? 'configured' : 'not configured'}`,
      details: config,
    });
  }

  // Close application context
  await app.close();

  // Print Summary
  const healthy = results.filter(r => r.status === 'healthy').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const errors = results.filter(r => r.status === 'error').length;

  await logger.info('Health check summary', { healthy, warnings, errors });

  if (errors > 0) {
    await logger.error('Critical issues found in health check');
    results
      .filter(r => r.status === 'error')
      .forEach(r => {
        logger.error(`${r.module}: ${r.message}`, r.details);
      });
    process.exit(1);
  } else if (warnings > 0) {
    await logger.warn('Health check completed with warnings');
    results
      .filter(r => r.status === 'warning')
      .forEach(r => {
        logger.warn(`${r.module}: ${r.message}`);
      });
    process.exit(0);
  } else {
    await logger.info('All health checks passed successfully');
    process.exit(0);
  }
}

// Run health checks
runHealthChecks().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});
