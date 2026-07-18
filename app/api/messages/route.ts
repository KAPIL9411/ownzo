import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { chatRepository } from '@/backend/repositories/chat.repository'
import { notificationRepository } from '@/backend/repositories/notification.repository'
import { validateRequest, sendMessageSchema } from '@/backend/middleware/validators'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'

async function getHandler(req: NextRequest, { user }: any) {
  try {
    const searchParams = req.nextUrl.searchParams
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      throw new ApiError(400, 'Chat ID required')
    }

    const chat = await chatRepository.getChatById(chatId)

    if (!chat) {
      throw new ApiError(404, 'Chat not found')
    }

    // Check if user is participant
    if (chat.buyerId !== user.uid && chat.sellerId !== user.uid) {
      throw new ApiError(403, 'Not authorized to view this chat')
    }

    const messages = await chatRepository.getChatMessages(chatId)

    // Mark messages as read
    await chatRepository.markMessagesAsRead(chatId, user.uid)

    return NextResponse.json({
      success: true,
      data: messages,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json()
    const validatedData = validateRequest(sendMessageSchema, body)

    const chat = await chatRepository.getChatById(validatedData.chatId)

    if (!chat) {
      throw new ApiError(404, 'Chat not found')
    }

    // Check if user is participant
    if (chat.buyerId !== user.uid && chat.sellerId !== user.uid) {
      throw new ApiError(403, 'Not authorized to send messages in this chat')
    }

    const message = await chatRepository.sendMessage(
      validatedData.chatId,
      user.uid,
      validatedData.message,
      validatedData.type,
      validatedData.imageUrl
    )

    // Send notification to other user
    const recipientId = chat.buyerId === user.uid ? chat.sellerId : chat.buyerId
    await notificationRepository.createNotification(
      recipientId,
      'New Message',
      validatedData.message,
      'message',
      chat.id
    )

    return NextResponse.json(
      {
        success: true,
        data: message,
      },
      { status: 201 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAuth(getHandler)
export const POST = requireAuth(postHandler)
