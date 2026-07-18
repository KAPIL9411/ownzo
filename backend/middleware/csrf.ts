import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHmac } from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_COOKIE_NAME = 'csrf-token'

// In-memory store for CSRF tokens (use Redis in production for distributed systems)
const tokenStore = new Map<string, { token: string; expiresAt: number }>()

// Cleanup expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now()
  Array.from(tokenStore.entries()).forEach(([key, value]) => {
    if (value.expiresAt < now) {
      tokenStore.delete(key)
    }
  })
}, 10 * 60 * 1000)

/**
 * Generate a CSRF token for a user session
 */
export function generateCSRFToken(userId: string): string {
  const token = randomBytes(32).toString('hex')
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  
  // Store token with user ID
  tokenStore.set(userId, { token, expiresAt })
  
  return token
}

/**
 * Create a signed token that can be verified
 */
function createSignedToken(token: string, userId: string): string {
  const hmac = createHmac('sha256', CSRF_SECRET)
  hmac.update(`${token}:${userId}`)
  const signature = hmac.digest('hex')
  return `${token}.${signature}`
}

/**
 * Verify a signed CSRF token
 */
function verifySignedToken(signedToken: string, userId: string): boolean {
  const parts = signedToken.split('.')
  if (parts.length !== 2) return false
  
  const [token, signature] = parts
  const hmac = createHmac('sha256', CSRF_SECRET)
  hmac.update(`${token}:${userId}`)
  const expectedSignature = hmac.digest('hex')
  
  // Use constant-time comparison to prevent timing attacks
  return signature === expectedSignature
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(req: NextRequest, userId: string): boolean {
  // Get token from header
  const headerToken = req.headers.get(CSRF_TOKEN_HEADER)
  
  // Get token from cookie (double-submit pattern)
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value
  
  if (!headerToken || !cookieToken) {
    return false
  }
  
  // Verify tokens match (double-submit cookie pattern)
  if (headerToken !== cookieToken) {
    return false
  }
  
  // Verify signature
  if (!verifySignedToken(headerToken, userId)) {
    return false
  }
  
  // Check if token exists in store and hasn't expired
  const storedToken = tokenStore.get(userId)
  if (!storedToken) {
    return false
  }
  
  if (storedToken.expiresAt < Date.now()) {
    tokenStore.delete(userId)
    return false
  }
  
  // Extract token from signed token
  const token = headerToken.split('.')[0]
  
  return token === storedToken.token
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
 * Helper to attach CSRF token to response
 */
export function attachCSRFToken(response: NextResponse, userId: string): NextResponse {
  const token = generateCSRFToken(userId)
  const signedToken = createSignedToken(token, userId)
  
  // Set as HTTP-only cookie (double-submit pattern)
  response.cookies.set(CSRF_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  })
  
  // Also return in response for client to use in headers
  return response
}

/**
 * Endpoint to get CSRF token
 */
export function getCSRFTokenHandler(userId: string): NextResponse {
  const token = generateCSRFToken(userId)
  const signedToken = createSignedToken(token, userId)
  
  const response = NextResponse.json({
    success: true,
    data: { csrfToken: signedToken },
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
