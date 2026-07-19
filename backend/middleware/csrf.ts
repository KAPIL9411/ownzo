import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHmac, timingSafeEqual } from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_COOKIE_NAME = 'csrf-token'
const TOKEN_VALIDITY_MS = 24 * 60 * 60 * 1000 // 24 hours

// Log CSRF configuration on startup (don't log the actual secret)
console.log('[CSRF] Configuration:', {
  secretConfigured: !!process.env.CSRF_SECRET,
  secretLength: CSRF_SECRET.length,
  isDefaultSecret: CSRF_SECRET === 'default-csrf-secret-change-in-production',
  nodeEnv: process.env.NODE_ENV,
})

// 🔒 SECURITY FIX: Removed in-memory Map (doesn't work in serverless)
// Now using stateless signed tokens with embedded timestamp
// This eliminates memory leaks and works across serverless function instances

/**
 * Generate a stateless CSRF token with embedded timestamp
 * Format: {randomBytes}.{timestamp}.{signature}
 */
export function generateCSRFToken(userId: string): string {
  const randomToken = randomBytes(32).toString('hex')
  const timestamp = Date.now().toString()
  
  // Create HMAC signature of token + timestamp + userId
  const hmac = createHmac('sha256', CSRF_SECRET)
  hmac.update(`${randomToken}:${timestamp}:${userId}`)
  const signature = hmac.digest('hex')
  
  // Return stateless token: random.timestamp.signature
  return `${randomToken}.${timestamp}.${signature}`
}

/**
 * Verify a stateless CSRF token
 */
function verifyCSRFTokenInternal(token: string, userId: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const [randomToken, timestamp, signature] = parts
    
    // Check if token has expired
    const tokenTime = parseInt(timestamp, 10)
    if (isNaN(tokenTime)) return false
    
    const now = Date.now()
    if (now - tokenTime > TOKEN_VALIDITY_MS) {
      return false // Token expired
    }
    
    // Verify signature
    const hmac = createHmac('sha256', CSRF_SECRET)
    hmac.update(`${randomToken}:${timestamp}:${userId}`)
    const expectedSignature = hmac.digest('hex')
    
    // Use constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      return false
    }
    
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('[CSRF] Token verification error:', error)
    return false
  }
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(req: NextRequest, userId: string): boolean {
  // Get token from header
  const headerToken = req.headers.get(CSRF_TOKEN_HEADER)
  
  // Enhanced logging for debugging
  console.log('[CSRF] Verification attempt:', {
    userId,
    hasHeaderToken: !!headerToken,
    headerTokenPreview: headerToken ? `${headerToken.substring(0, 20)}...` : 'none',
  })
  
  if (!headerToken) {
    console.warn(`[CSRF] Missing token in header`)
    return false
  }
  
  // Verify the token signature and expiration
  const isValid = verifyCSRFTokenInternal(headerToken, userId)
  if (!isValid) {
    console.warn(`[CSRF] Token validation failed for user ${userId}`)
  } else {
    console.log(`[CSRF] Token validation successful for user ${userId}`)
  }
  return isValid
}

/**
 * Middleware to require CSRF token on state-changing requests
 */
export function requireCSRF(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any): Promise<NextResponse> => {
    // Skip CSRF in development if explicitly disabled
    if (process.env.NODE_ENV === 'development' && process.env.CSRF_ENABLED === 'false') {
      return handler(req, context)
    }
    
    // Only check CSRF for state-changing methods
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return handler(req, context)
    }
    
    // Extract user ID from context (should be set by auth middleware)
    const userId = context.user?.uid || context.user?.id
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required for CSRF protection' 
        },
        { status: 401 }
      )
    }
    
    // Verify CSRF token
    const isValid = verifyCSRFToken(req, userId)
    
    if (!isValid) {
      console.warn(`[CSRF] Invalid token for user ${userId} on ${req.method} ${req.nextUrl.pathname}`)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or missing CSRF token' 
        },
        { status: 403 }
      )
    }
    
    // CSRF token is valid, proceed with request
    return handler(req, context)
  }
}

/**
 * Helper to attach CSRF token to response (for compatibility, but not required for verification)
 */
export function attachCSRFToken(response: NextResponse, userId: string): NextResponse {
  const token = generateCSRFToken(userId)
  
  // Note: Cookie is set for potential future use, but verification only checks header
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  })
  
  console.log('[CSRF] Token generated and cookie set for user:', userId)
  
  return response
}

/**
 * Endpoint to get CSRF token
 */
export function getCSRFTokenHandler(userId: string): NextResponse {
  const token = generateCSRFToken(userId)
  
  const response = NextResponse.json({
    success: true,
    data: { csrfToken: token },
  })
  
  return attachCSRFToken(response, userId)
}

/**
 * Clear CSRF token (e.g., on logout)
 */
export function clearCSRFToken(response: NextResponse): NextResponse {
  response.cookies.delete(CSRF_COOKIE_NAME)
  return response
}
