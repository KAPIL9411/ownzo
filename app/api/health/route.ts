import { NextResponse } from 'next/server'
import { adminDb } from '@/backend/lib/firebase-admin/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      firebase: false,
      server: true,
    },
  }

  try {
    // Check Firebase connection
    await adminDb.listCollections()
    checks.checks.firebase = true
  } catch (error) {
    console.error('Health check - Firebase error:', error)
    checks.status = 'degraded'
  }

  // Overall health
  const allHealthy = Object.values(checks.checks).every(check => check === true)
  
  return NextResponse.json(
    {
      ...checks,
      status: allHealthy ? 'healthy' : 'degraded',
    },
    { 
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  )
}
