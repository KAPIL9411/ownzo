import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

function getClientIdentifier(req: NextRequest): string {
  // Try to get user ID from auth (if authenticated)
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    try {
      // Extract user ID from token if available
      const token = authHeader.replace('Bearer ', '')
      // This is a simple approach - in production, decode JWT properly
      return `user:${token.slice(0, 20)}`
    } catch (e) {
      // Fall through to IP-based limiting
    }
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
      ? options.keyGenerator(req) 
      : `${req.nextUrl.pathname}:${getClientIdentifier(req)}`

    const now = Date.now()
    const record = store[key]

    if (!record || record.resetTime < now) {
      // New window
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs,
      }
      return handler(req, context)
    }

    if (record.count >= options.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000)
      
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
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
          },
        }
      )
    }

    // Increment counter
    record.count++

    // Call handler
    const response = await handler(req, context)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', options.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', (options.maxRequests - record.count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString())

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
