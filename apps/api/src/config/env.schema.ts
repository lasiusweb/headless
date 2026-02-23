import { z } from 'zod';

// Environment schema definition
const envSchema = z.object({
  // Required Supabase configuration
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),

  // JWT configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  // CORS configuration
  CORS_ORIGIN: z.string().optional().default('*'),

  // Server configuration
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  PORT: z.string().transform(Number).default('3000'),

  // Payment Gateway - Easebuzz (optional)
  EASEBUZZ_SALT: z.string().optional(),
  EASEBUZZ_ENVIRONMENT: z.enum(['test', 'production']).default('test'),

  // Payment Gateway - PayU (optional)
  PAYU_MERCHANT_KEY: z.string().optional(),
  PAYU_MERCHANT_SALT: z.string().optional(),
  PAYU_ENVIRONMENT: z.enum(['test', 'production']).default('test'),

  // Shipping - Delhivery (optional)
  DELHIVERY_API_KEY: z.string().optional(),
  DELHIVERY_ENVIRONMENT: z.enum(['test', 'production']).default('test'),

  // Shipping - VRL (optional)
  VRL_API_KEY: z.string().optional(),

  // Zoho Integration (optional)
  ZOHO_CLIENT_ID: z.string().optional(),
  ZOHO_CLIENT_SECRET: z.string().optional(),
  ZOHO_ACCESS_TOKEN: z.string().optional(),
  ZOHO_REFRESH_TOKEN: z.string().optional(),
  ZOHO_ORGANIZATION_ID: z.string().optional(),
  ZOHO_REDIRECT_URI: z.string().url().optional(),

  // Notifications - SendGrid (optional)
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FROM_NAME: z.string().optional(),

  // Notifications - Twilio (optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),

  // Redis (optional)
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // File Storage - GCP (optional)
  GCP_PROJECT_ID: z.string().optional(),
  GCP_BUCKET_NAME: z.string().optional(),
  GCP_KEY_FILE_PATH: z.string().optional(),

  // Sentry (optional)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  // Rate Limiting (optional)
  RATE_LIMIT_TTL: z.string().transform(Number).default('60'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),

  // File Upload (optional)
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  ALLOWED_FILE_TYPES: z.string().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * @throws {Error} If validation fails
 */
export function validateEnv(): EnvSchema {
  try {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      const errorMessage = [
        '❌ Environment validation failed:',
        ...errors.map((e) => `  - ${e.field}: ${e.message}`),
      ].join('\n');

      throw new Error(errorMessage);
    }

    return result.data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      const errorMessage = [
        '❌ Environment validation failed:',
        ...errors.map((e) => `  - ${e.field}: ${e.message}`),
      ].join('\n');

      throw new Error(errorMessage);
    }

    throw error;
  }
}

/**
 * Get validated environment or throw error
 */
export const env = validateEnv();
