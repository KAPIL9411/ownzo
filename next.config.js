/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled for Leaflet map compatibility

  // ─── Image optimization ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ─── Performance ───────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Tree-shake large libraries so only used icons/functions are bundled.
  // lucide-react alone can save 200-400 kB uncompressed.
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'firebase/messaging',
      '@tanstack/react-query',
    ],
  },

  // ─── Security headers + static asset caching ──────────────────────────────
  async headers() {
    return [
      {
        // Long-term caching for Next.js static chunks (hashed filenames)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Images and fonts cached for 7 days
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
      {
        // API routes - CORS headers
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NODE_ENV === 'production' ? 'https://www.ownzo.in' : '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control',       value: 'on' },
          { key: 'Strict-Transport-Security',     value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options',               value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',        value: 'nosniff' },
          { key: 'X-XSS-Protection',              value: '1; mode=block' },
          { key: 'Referrer-Policy',               value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',            value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
    ]
  },

  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY:              process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:           process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:       process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID:               process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:         process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_APP_URL:                       process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Strip console.log in production for a smaller, faster bundle
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: { exclude: ['error', 'warn'] },
    },
  }),
}

module.exports = nextConfig
