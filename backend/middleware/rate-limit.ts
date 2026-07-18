import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'

const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true'
const redis = REDIS_ENABLED && process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Bounded memory store
const store: RateLimitStore = {}
const MAX_MEMORY_KEYS = 5000

// Cleanup old entries every 5 minutes and enforce memory bounds
setInterval(() => {
  const now = Date.now()
  let keyCount = 0
  const keys = Object.keys(store)
  keys.forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    } else {
      keyCount++
    }
  })
  
  if (keyCount > MAX_MEMORY_KEYS) {
    // If we exceed bounds even after cleanup, clear entire store to prevent memory leak attacks
    console.warn('Rate limiter memory store exceeded bounds, clearing store')
    Object.keys(store).forEach(k => delete store[k])
  }
}, 5 * 60 * 1000)

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest, context?: any) => string
}

function getClientIdentifier(req: NextRequest, context?: any): string {
  // Try to get user ID from auth (if authenticated)
  if (context?.user?.uid) {
    return `user:${context.user.uid}`
  }

  // Fall back to IP address
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0].trim() || realIP || 'unknown'
  
  return `ip:${ip}`
}

export function createRateLimiter(options: RateLimitOptions) {
  return async (
    req: NextRequest,
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
    context: any = {}
  ): Promise<NextResponse> => {
    // Check if rate limiting is disabled in environment
    if (process.env.RATE_LIMIT_ENABLED === 'false') {
      return handler(req, context)
    }

    const key = options.keyGenerator 
      ? options.keyGenerator(req, context) 
      : `ratelimit:${req.nextUrl.pathname}:${getClientIdentifier(req, context)}`

    let count = 0
    let resetTime = 0
    const now = Date.now()

    if (redis) {
      try {
        const pipeline = redis.pipeline()
        pipeline.incr(key)
        pipeline.pttl(key)
        const results = await pipeline.exec()
        if (results && results.length === 2) {
          count = results[0][1] as number
          const ttl = results[1][1] as number
          
          if (count === 1 || ttl < 0) {
            // First request or key without TTL, set expiry
            await redis.pexpire(key, options.windowMs)
            resetTime = now + options.windowMs
          } else {
            resetTime = now + ttl
          }
        }
      } catch (e) {
        console.error('Redis rate limit error:', e)
        // Fail open if Redis fails
        return handler(req, context)
      }
    } else {
      // In-memory fallback
      const record = store[key]
      if (!record || record.resetTime < now) {
        // New window
        count = 1
        resetTime = now + options.windowMs
        if (Object.keys(store).length < MAX_MEMORY_KEYS) {
          store[key] = { count, resetTime }
        }
      } else {
        record.count++
        count = record.count
        resetTime = record.resetTime
      }
    }

    if (count > options.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          success: false,
          error: options.message || 'Too many requests, please try again later',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': options.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          },
        }
      )
    }

    // Call handler
    const response = await handler(req, context)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', options.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, options.maxRequests - count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString())

    return response
  }
}

// Predefined rate limiters
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many login attempts, please try again in 15 minutes',
})

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  message: 'Too many requests, please slow down',
})

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Upload limit reached, please try again later',
})

export const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Too many search requests, please slow down',
})

export const viewLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // Allow 100 listing views per minute per user/IP
  message: 'Too many listing views, please slow down',
})

export const publicApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // Stricter for unauthenticated users
  message: 'Rate limit exceeded for public access',
})

// Helper to apply rate limiter to route handler
export function withRateLimit(
  limiter: ReturnType<typeof createRateLimiter>,
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any) => {
    return limiter(req, handler, context)
  }
}
