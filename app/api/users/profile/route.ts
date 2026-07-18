import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { userRepository } from '@/backend/repositories/user.repository'
import { validateRequest, updateProfileSchema } from '@/backend/middleware/validators'
import { errorHandler } from '@/backend/middleware/error-handler'

async function getHandler(req: NextRequest, { user }: any) {
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

async function patchHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json()
    const validatedData = validateRequest(updateProfileSchema, body)

    const updatedUser = await userRepository.updateUser(user.uid, validatedData)

    // Recalculate trust score if profile is updated
    await userRepository.updateTrustScore(user.uid)

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAuth(getHandler)
export const PATCH = requireAuth(patchHandler)
