import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { validateRequest, updateListingSchema } from '@/backend/middleware/validators'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params

    const listing = await listingRepository.getListingById(listingId)

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Increment views
    await listingRepository.incrementViews(listingId)

    return NextResponse.json({
      success: true,
      data: listing,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

async function patchHandler(
  req: NextRequest,
  context: { params: { id: string }; user: any }
) {
  try {
    const listingId = context.params.id
    const user = context.user

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
  context: { params: { id: string }; user: any }
) {
  try {
    const listingId = context.params.id
    const user = context.user

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
