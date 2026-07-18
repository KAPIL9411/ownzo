/**
 * Environment variable validation and configuration
 * Validates required env vars on startup and provides typed access
 */

import { z } from 'zod'

const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Firebase Public
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase messaging sender ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),
  
  // Firebase Admin
  FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase admin project ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().email('Invalid Firebase client email'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'Firebase private key is required'),
  
  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1, 'Cloudinary cloud name is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'Cloudinary API key is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'Cloudinary API secret is required'),
  
  // Security
  CSRF_SECRET: z.string().min(32, 'CSRF secret must be at least 32 characters'),
  
  // API
  API_URL: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: z.enum(['true', 'false']).default('true').transform(val => val === 'true'),
  AUTH_RATE_LIMIT_MAX: z.string().regex(/^\d+$/).transform(Number).default('5'),
  AUTH_RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'),
  UPLOAD_RATE_LIMIT_MAX: z.string().regex(/^\d+$/).transform(Number).default('10'),
  UPLOAD_RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('3600000'),
  
  // Redis (optional)
  REDIS_URL: z.string().optional(),
  REDIS_ENABLED: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),
  
  // Sentry (optional)
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_ENABLED: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_TO_FILE: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),
  LOG_FILE_PATH: z.string().optional(),
  
  // Feature Flags
  ENABLE_EMAIL_NOTIFICATIONS: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),
  ENABLE_PUSH_NOTIFICATIONS: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),
  ENABLE_ANALYTICS: z.enum(['true', 'false']).default('false').transform(val => val === 'true'),
})

export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | null = null

/**
 * Validate and parse environment variables
 * Throws error if validation fails
 */
export function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv
  }

  try {
    cachedEnv = envSchema.parse(process.env)
    return cachedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      )
      
      console.error('❌ Invalid environment variables:')
      missingVars.forEach((msg) => console.error(`  - ${msg}`))
      
      throw new Error(
        `Environment validation failed. Please check your .env file.\n${missingVars.join('\n')}`
      )
    }
    throw error
  }
}

/**
 * Get validated environment configuration
 * Safe to use after calling validateEnv() on startup
 */
export function getEnv(): Env {
  if (!cachedEnv) {
    return validateEnv()
  }
  return cachedEnv
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production'
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development'
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test'
}

// Validate environment on module load (fail fast)
if (typeof window === 'undefined') {
  // Only validate on server-side
  try {
    validateEnv()
    console.log('✅ Environment variables validated successfully')
  } catch (error) {
    // Error is already logged by validateEnv()
    if (!isTest()) {
      process.exit(1)
    }
  }
}
