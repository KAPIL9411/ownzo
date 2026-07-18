import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { offerRepository } from '@/backend/repositories/offer.repository'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { notificationRepository } from '@/backend/repositories/notification.repository'
import { validateRequest, createOfferSchema } from '@/backend/middleware/validators'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'
import { sendEmail } from '@/backend/lib/email/resend'
import { userRepository } from '@/backend/repositories/user.repository'

async function getHandler(req: NextRequest, { user }: any) {
  try {
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type') as 'buyer' | 'seller' || 'buyer'

    const offers = await offerRepository.getUserOffers(user.uid, type)

    return NextResponse.json({
      success: true,
      data: offers,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json()
    const validatedData = validateRequest(createOfferSchema, body)

    const listing = await listingRepository.getListingById(validatedData.listingId)

    if (!listing) {
      throw new ApiError(404, 'Listing not found')
    }

    if (listing.status !== 'active') {
      throw new ApiError(400, 'Listing is not available')
    }

    if (listing.sellerId === user.uid) {
      throw new ApiError(400, 'Cannot make offer on your own listing')
    }

    const offer = await offerRepository.createOffer(
      validatedData.listingId,
      user.uid,
      listing.sellerId,
      validatedData.offerPrice,
      validatedData.message
    )

    // Send notification + email to seller
    await notificationRepository.createNotification(
      listing.sellerId,
      'New Offer',
      `Someone offered ₹${validatedData.offerPrice} for ${listing.title}`,
      'offer',
      offer.id
    )

    const seller = await userRepository.getUserById(listing.sellerId)
    const buyer  = await userRepository.getUserById(user.uid)
    if (seller?.email) {
      await sendEmail({
        type:         'offer_received',
        to:           seller.email,
        buyerName:    buyer?.name ?? 'A buyer',
        offerPrice:   validatedData.offerPrice,
        listingTitle: listing.title,
        offerId:      offer.id,
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: offer,
      },
      { status: 201 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAuth(getHandler)
export const POST = requireAuth(postHandler)
