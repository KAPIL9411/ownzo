import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { adminDb } from '@/backend/lib/firebase-admin/config'

export const dynamic = 'force-dynamic'

interface DetailedHealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  system: {
    uptime: number
    memory: NodeJS.MemoryUsage
    cpuUsage: NodeJS.CpuUsage
    nodeVersion: string
    platform: string
  }
  services: {
    api: { status: string; latency: number }
    database: { status: string; latency: number; collections?: number }
    storage: { status: string; latency: number }
  }
  environment: {
    nodeEnv: string
    version?: string
  }
}

async function handler(req: NextRequest, context: any) {
  const startTime = Date.now()
  
  try {
    // Database check with collection count
    const dbStart = Date.now()
    let dbCollectionCount = 0
    let dbStatus: 'ok' | 'error' | 'slow' = 'ok'
    
    try {
      const collections = await adminDb.listCollections()
      dbCollectionCount = collections.length
      const dbLatency = Date.now() - dbStart
      
      if (dbLatency > 1000) {
        dbStatus = 'slow'
      }
    } catch (error) {
      dbStatus = 'error'
    }
    
    const dbLatency = Date.now() - dbStart
    
    // Storage check
    const storageStart = Date.now()
    let storageStatus: 'ok' | 'error' = 'ok'
    
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) throw new Error('Cloudinary not configured')
      
      const response = await fetch(
        `https://res.cloudinary.com/${cloudName}/image/upload/sample.jpg`,
        { method: 'HEAD', signal: AbortSignal.timeout(5000) }
      )
      
      if (!response.ok) storageStatus = 'error'
    } catch (error) {
      storageStatus = 'error'
    }
    
    const storageLatency = Date.now() - storageStart
    
    const result: DetailedHealthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
      services: {
        api: {
          status: 'ok',
          latency: Date.now() - startTime,
        },
        database: {
          status: dbStatus,
          latency: dbLatency,
          collections: dbCollectionCount,
        },
        storage: {
          status: storageStatus,
          latency: storageLatency,
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version,
      },
    }
    
    // Determine overall status
    if (dbStatus === 'error' || storageStatus === 'error') {
      result.status = 'unhealthy'
    } else if (dbStatus === 'slow') {
      result.status = 'degraded'
    }
    
    const statusCode = result.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(result, { status: statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    )
  }
}

// Only authenticated users can see detailed health info
export const GET = requireAuth(handler)
