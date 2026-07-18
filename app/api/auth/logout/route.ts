import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { clearCSRFToken } from '@/backend/middleware/csrf'

async function handler(req: NextRequest, { user }: any) {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can invalidate FCM token here
    // await notificationRepository.deleteFCMToken(user.uid)

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
    
    // Clear CSRF token
    return clearCSRFToken(response)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}

export const POST = requireAuth(handler)
