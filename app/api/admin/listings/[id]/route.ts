import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/backend/middleware/auth'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { errorHandler } from '@/backend/middleware/error-handler'
import { notificationRepository } from '@/backend/repositories/notification.repository'

async function patchHandler(req: NextRequest, { params, user }: any) {
  try {
    const { id } = params
    const body = await req.json()
    const { action, reason } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    const listing = await listingRepository.getListingById(id)
    
    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.status !== 'pending_review') {
      return NextResponse.json(
        { success: false, error: 'Listing is not pending review' },
        { status: 400 }
      )
    }

    let updatedListing

    if (action === 'approve') {
      updatedListing = await listingRepository.updateListing(id, {
        status: 'active',
        verificationStatus: 'verified',
      })

      // Send notification to seller
      await notificationRepository.createNotification(
        listing.sellerId,
        '✅ Listing Approved',
        `Your listing "${listing.title}" has been approved and is now live!`,
        'listing',
        id,
        listing.images?.[0]
      )
    } else {
      updatedListing = await listingRepository.updateListing(id, {
        status: 'rejected',
        verificationStatus: 'rejected',
      })

      // Send notification to seller
      await notificationRepository.createNotification(
        listing.sellerId,
        '❌ Listing Rejected',
        `Your listing "${listing.title}" was rejected. ${reason ? `Reason: ${reason}` : 'Please review and resubmit.'}`,
        'listing',
        id,
        listing.images?.[0]
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedListing,
      message: `Listing ${action}d successfully`,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const PATCH = requireAdmin(patchHandler)
