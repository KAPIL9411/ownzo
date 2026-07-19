import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/backend/middleware/auth'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

async function getHandler(req: NextRequest, { user }: any) {
  try {
    console.log('[Admin Listings] User:', user?.uid, 'Role:', user?.role)

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status') || 'pending_review'
    
    console.log('[Admin Listings] Fetching listings with status:', status)

    const listings = await listingRepository.getListingsByStatus(status as any)
    
    console.log('[Admin Listings] Found', listings.length, 'listings')

    return NextResponse.json({
      success: true,
      data: listings,
    })
  } catch (error) {
    console.error('[Admin Listings] Error:', error)
    return errorHandler(error)
  }
}

export const GET = requireAdmin(getHandler)
