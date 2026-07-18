import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/backend/lib/firebase-admin/auth'
import { userRepository } from '@/backend/repositories/user.repository'
import { errorHandler } from '@/backend/middleware/error-handler'
import { authLimiter } from '@/backend/middleware/rate-limit'
import { attachCSRFToken } from '@/backend/middleware/csrf'

async function handler(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'ID token required' },
        { status: 400 }
      )
    }

    // Verify Firebase token
    const decodedToken = await verifyIdToken(idToken)

    // Get or create user
    let user = await userRepository.getUserById(decodedToken.uid)

    if (!user) {
      // Create new user
      user = await userRepository.createUser(decodedToken.uid, {
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        email: decodedToken.email || '',
        photoURL: decodedToken.picture,
      })
    }

    const response = NextResponse.json({
      success: true,
      data: {
        user,
        token: idToken,
      },
    })
    
    // Attach CSRF token for subsequent requests
    return attachCSRFToken(response, user.id)
  } catch (error) {
    return errorHandler(error)
  }
}

export async function POST(req: NextRequest) {
  return authLimiter(req, handler, {})
}
