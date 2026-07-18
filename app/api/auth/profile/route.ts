import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { userRepository } from '@/backend/repositories/user.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

async function handler(req: NextRequest, { user }: any) {
  try {
    const userData = await userRepository.getUserById(user.uid)

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: userData,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAuth(handler)
