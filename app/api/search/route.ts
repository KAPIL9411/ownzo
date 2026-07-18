import { NextRequest, NextResponse } from 'next/server'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { errorHandler } from '@/backend/middleware/error-handler'
import { searchLimiter } from '@/backend/middleware/rate-limit'

async function handler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters',
      }, { status: 400 })
    }

    const results = await listingRepository.searchListings(query)

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export async function GET(req: NextRequest) {
  return searchLimiter(req, handler, {})
}
