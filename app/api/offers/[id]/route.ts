import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { offerRepository } from '@/backend/repositories/offer.repository'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { notificationRepository } from '@/backend/repositories/notification.repository'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'
import { OfferStatus } from '@/shared/types'
import { sendEmail } from '@/backend/lib/email/resend'
import { userRepository } from '@/backend/repositories/user.repository'

async function patchHandler(
  req: NextRequest,
  context: { params: { id: string }; user: any }
) {
  try {
    const offerId = context.params.id
    const user = context.user
    const { status } = await req.json()

    const offer = await offerRepository.getOfferById(offerId)

    if (!offer) {
      throw new ApiError(404, 'Offer not found')
    }

    // Only seller can update offer status
    if (offer.sellerId !== user.uid) {
      throw new ApiError(403, 'Not authorized to update this offer')
    }

    const updatedOffer = await offerRepository.updateOfferStatus(offerId, status as OfferStatus)

    // If accepted, mark listing as sold
    if (status === 'accepted') {
      await listingRepository.updateListing(offer.listingId, { status: 'sold' })
    }

    // Send notification + email to buyer
    const notificationMessage =
      status === 'accepted' ? 'Your offer was accepted!' :
      status === 'rejected' ? 'Your offer was declined'  :
      'Seller sent a counter offer'

    await notificationRepository.createNotification(offer.buyerId, 'Offer Update', notificationMessage, 'offer', offer.id)

    const buyer  = await userRepository.getUserById(offer.buyerId)
    const seller = await userRepository.getUserById(offer.sellerId)
    const listingDoc = await listingRepository.getListingById(offer.listingId)

    if (buyer?.email && listingDoc) {
      if (status === 'accepted') {
        await sendEmail({ type: 'offer_accepted', to: buyer.email, sellerName: seller?.name ?? 'Seller', listingTitle: listingDoc.title, offerPrice: offer.offerPrice })
      } else if (status === 'rejected') {
        await sendEmail({ type: 'offer_rejected', to: buyer.email, sellerName: seller?.name ?? 'Seller', listingTitle: listingDoc.title })
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedOffer,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const PATCH = requireAuth(patchHandler)
