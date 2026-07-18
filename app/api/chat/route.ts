import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { chatRepository } from '@/backend/repositories/chat.repository'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { notificationRepository } from '@/backend/repositories/notification.repository'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'

async function getHandler(req: NextRequest, { user }: any) {
  try {
    const chats = await chatRepository.getUserChats(user.uid)

    return NextResponse.json({
      success: true,
      data: chats,
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

    const listing = await listingRepository.getListingById(listingId)

    if (!listing) {
      throw new ApiError(404, 'Listing not found')
    }

    if (listing.sellerId === user.uid) {
      throw new ApiError(400, 'Cannot chat with yourself')
    }

    const chat = await chatRepository.createChat(
      listingId,
      user.uid,
      listing.sellerId
    )

    // Send notification to seller
    await notificationRepository.createNotification(
      listing.sellerId,
      'New Chat',
      `Someone is interested in your listing: ${listing.title}`,
      'message',
      chat.id
    )

    return NextResponse.json(
      {
        success: true,
        data: chat,
      },
      { status: 201 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAuth(getHandler)
export const POST = requireAuth(postHandler)
