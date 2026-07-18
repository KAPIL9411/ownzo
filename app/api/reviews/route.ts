import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { reviewRepository } from '@/backend/repositories/review.repository'
import { userRepository } from '@/backend/repositories/user.repository'
import { validateRequest, createReviewSchema } from '@/backend/middleware/validators'
import { errorHandler } from '@/backend/middleware/error-handler'

async function getHandler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const sellerId = searchParams.get('sellerId')

    if (!sellerId) {
      return NextResponse.json(
        { success: false, error: 'Seller ID required' },
        { status: 400 }
      )
    }

    const reviews = await reviewRepository.getSellerReviews(sellerId)
    const averageRating = await reviewRepository.getAverageRating(sellerId)

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        averageRating,
      },
    })
  } catch (error) {
    return errorHandler(error)
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json()
    const validatedData = validateRequest(createReviewSchema, body)

    const review = await reviewRepository.createReview(
      validatedData.listingId,
      user.uid,
      validatedData.sellerId,
      validatedData.rating,
      validatedData.comment
    )

    // Update seller's trust score
    await userRepository.updateTrustScore(validatedData.sellerId)

    return NextResponse.json(
      {
        success: true,
        data: review,
      },
      { status: 201 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = getHandler
export const POST = requireAuth(postHandler)
