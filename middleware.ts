import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers (additional layer on top of next.config.js)
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  )

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    ]
    
    const origin = request.headers.get('origin')
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      )
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-CSRF-Token'
      )
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
  }

  // Block suspicious patterns in URLs (but allow legitimate dev tools)
  const pathname = request.nextUrl.pathname
  
  // Allow legitimate paths
  const allowedPaths = [
    '/.well-known/', // OAuth, Apple Pay, etc.
    '/sw.js',         // Service worker
    '/manifest.json', // PWA manifest
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ]
  
  const isAllowedPath = allowedPaths.some(allowed => pathname.startsWith(allowed) || pathname === allowed.slice(0, -1))
  
  if (!isAllowedPath) {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /\.\.\//,    // Path traversal
      /\.\.%2f/i,
    ]

    const url = request.url
    if (suspiciousPatterns.some(pattern => pattern.test(url))) {
      console.warn('Blocked suspicious request:', url)
      return new NextResponse('Bad Request', { status: 400 })
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
