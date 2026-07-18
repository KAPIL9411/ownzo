import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { wishlistRepository } from '@/backend/repositories/wishlist.repository'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'

async function getHandler(req: NextRequest, { user }: any) {
  try {
    const wishlist = await wishlistRepository.getUserWishlist(user.uid)

    return NextResponse.json({
      success: true,
      data: wishlist,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const { listingId } = await req.json()

    if (!listingId) {
      throw new ApiError(400, 'Listing ID required')
    }

    const wishlist = await wishlistRepository.addToWishlist(user.uid, listingId)

    return NextResponse.json(
      {
        success: true,
        data: wishlist,
      },
      { status: 201 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}

async function deleteHandler(req: NextRequest, { user }: any) {
  try {
    const searchParams = req.nextUrl.searchParams
    const listingId = searchParams.get('listingId')

    if (!listingId) {
      throw new ApiError(400, 'Listing ID required')
    }

    await wishlistRepository.removeFromWishlist(user.uid, listingId)

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist',
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAuth(getHandler)
export const POST = requireAuth(postHandler)
export const DELETE = requireAuth(deleteHandler)
