import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { validateRequest, updateListingSchema } from '@/backend/middleware/validators'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'
import { viewLimiter } from '@/backend/middleware/rate-limit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY FIX: Apply rate limiting to prevent view count abuse
  return viewLimiter(req, async (req: NextRequest) => {
    try {
      const { id: listingId } = await params

      const listing = await listingRepository.getListingById(listingId)

      if (!listing) {
        return NextResponse.json(
          { success: false, error: 'Listing not found' },
          { status: 404 }
        )
      }

      // Increment views (now with existence validation)
      await listingRepository.incrementViews(listingId)

      return NextResponse.json({
        success: true,
        data: listing,
      })
    } catch (error) {
      return errorHandler(error)
    }
  }, {})
}

async function patchHandler(
  req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: { uid: string } }
) {
  try {
    const { id: listingId } = await params

    const listing = await listingRepository.getListingById(listingId)

    if (!listing) {
      throw new ApiError(404, 'Listing not found')
    }

    // Check ownership
    if (listing.sellerId !== user.uid) {
      throw new ApiError(403, 'Not authorized to update this listing')
    }

    const body = await req.json()
    const validatedData = validateRequest(updateListingSchema, body)

    const updatedListing = await listingRepository.updateListing(
      listingId,
      validatedData
    )

    return NextResponse.json({
      success: true,
      data: updatedListing,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

async function deleteHandler(
  req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: { uid: string } }
) {
  try {
    const { id: listingId } = await params

    const listing = await listingRepository.getListingById(listingId)

    if (!listing) {
      throw new ApiError(404, 'Listing not found')
    }

    // Check ownership
    if (listing.sellerId !== user.uid) {
      throw new ApiError(403, 'Not authorized to delete this listing')
    }

    await listingRepository.deleteListing(listingId)

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const PATCH = requireAuth(patchHandler)
export const DELETE = requireAuth(deleteHandler)
