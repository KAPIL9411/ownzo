import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/backend/middleware/auth'
import { userRepository } from '@/backend/repositories/user.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

async function handler(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const limit = Number(searchParams.get('limit') ?? 100)
    const users = await userRepository.getAllUsers(limit)
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAdmin(handler)
