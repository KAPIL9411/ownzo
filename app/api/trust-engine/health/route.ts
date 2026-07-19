/**
 * Trust Engine Health Check
 * GET /api/trust-engine/health
 * 
 * Simple endpoint to test if Trust Engine is working (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Check if Trust Engine is enabled
    const isEnabled = process.env.TRUST_ENGINE_ENABLED === 'true'
    
    // Check configuration
    const config = {
      enabled: isEnabled,
      minPhotos: process.env.TRUST_ENGINE_MIN_PHOTOS_GENERAL || '3',
      highValueThreshold: process.env.TRUST_ENGINE_HIGH_VALUE_THRESHOLD || '10000',
      autoPublishThreshold: process.env.TRUST_ENGINE_AUTO_PUBLISH_THRESHOLD || '80',
      aiContentAnalysis: process.env.TRUST_ENGINE_ENABLE_AI_CONTENT_ANALYSIS === 'true',
      aiPhotoAnalysis: process.env.TRUST_ENGINE_ENABLE_AI_PHOTO_ANALYSIS === 'true',
      reverseImageSearch: process.env.TRUST_ENGINE_ENABLE_REVERSE_IMAGE_SEARCH === 'true',
    }
    
    // Check if AI services have keys
    const aiServices = {
      groq: !!process.env.GROQ_API_KEY,
      huggingFace: !!process.env.HUGGINGFACE_API_KEY,
      serpApi: !!process.env.SERPAPI_API_KEY,
    }
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      config,
      aiServices,
      message: isEnabled 
        ? '✅ Trust Engine is running' 
        : '⚠️ Trust Engine is disabled',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
