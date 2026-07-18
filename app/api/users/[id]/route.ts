import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/backend/repositories/user.repository'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { reviewRepository } from '@/backend/repositories/review.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    const user = await userRepository.getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's listings
    const listings = await listingRepository.getUserListings(userId)

    // Get user's reviews
    const reviews = await reviewRepository.getSellerReviews(userId)
    const averageRating = await reviewRepository.getAverageRating(userId)

    return NextResponse.json({
      success: true,
      data: {
        user,
        listings,
        reviews,
        averageRating,
      },
    })
  } catch (error) {
    return errorHandler(error)
  }
}
