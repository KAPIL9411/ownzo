import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { notificationRepository } from '@/backend/repositories/notification.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

async function getHandler(req: NextRequest, { user }: any) {
  try {
    const notifications = await notificationRepository.getUserNotifications(user.uid)
    const unreadCount = await notificationRepository.getUnreadCount(user.uid)

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    })
  } catch (error) {
    return errorHandler(error)
  }
}

async function patchHandler(req: NextRequest, { user }: any) {
  try {
    const { notificationId, markAllAsRead } = await req.json()

    if (markAllAsRead) {
      await notificationRepository.markAllAsRead(user.uid)
    } else if (notificationId) {
      await notificationRepository.markAsRead(notificationId)
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAuth(getHandler)
export const PATCH = requireAuth(patchHandler)
