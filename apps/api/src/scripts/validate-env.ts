/**
 * Environment Validation Script
 * 
 * Run this script to validate all environment variables before starting the application
 * Usage: npx ts-node src/scripts/validate-env.ts
 */

import { validateEnv } from '../config/env.schema';

console.log('🔍 Validating environment variables...\n');

try {
  const env = validateEnv();

  console.log('✅ Environment validation successful!\n');
  console.log('Configuration Summary:');
  console.log('─'.repeat(50));
  console.log(`NODE_ENV: ${env.NODE_ENV}`);
  console.log(`PORT: ${env.PORT}`);
  console.log(`SUPABASE_URL: ${env.SUPABASE_URL}`);
  console.log(`CORS_ORIGIN: ${env.CORS_ORIGIN}`);
  console.log(`JWT_SECRET: ${env.JWT_SECRET.substring(0, 8)}... (hidden)`);
  console.log('─'.repeat(50));

  // Optional services status
  console.log('\nOptional Services:');
  console.log('─'.repeat(50));
  console.log(`Payment (Easebuzz): ${env.EASEBUZZ_SALT ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Payment (PayU): ${env.PAYU_MERCHANT_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Shipping (Delhivery): ${env.DELHIVERY_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Shipping (VRL): ${env.VRL_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Zoho Integration: ${env.ZOHO_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Email (SendGrid): ${env.SENDGRID_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`SMS/WhatsApp (Twilio): ${env.TWILIO_ACCOUNT_SID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Redis Cache: ${env.REDIS_HOST ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Error Tracking (Sentry): ${env.SENTRY_DSN ? '✅ Configured' : '❌ Not configured'}`);
  console.log('─'.repeat(50));

  console.log('\n✅ All required environment variables are set correctly!\n');
  process.exit(0);
} catch (error: any) {
  console.error('\n❌ Environment validation failed!\n');
  console.error(error.message);
  console.error('\n📝 Please check your .env file and ensure all required variables are set.\n');
  process.exit(1);
}
