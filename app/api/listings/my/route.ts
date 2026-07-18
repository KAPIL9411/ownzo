import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

async function handler(req: NextRequest, { user }: any) {
  try {
    const listings = await listingRepository.getUserListings(user.uid)

    return NextResponse.json({
      success: true,
      data: listings,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAuth(handler)
