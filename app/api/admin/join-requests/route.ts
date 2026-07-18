import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/backend/middleware/auth'
import { communityRepository } from '@/backend/repositories/community.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

// GET /api/admin/join-requests?communityId=xxx
async function getHandler(req: NextRequest) {
  try {
    const communityId = req.nextUrl.searchParams.get('communityId') ?? undefined
    const requests = communityId
      ? await communityRepository.getPendingJoinRequests(communityId)
      : await communityRepository.getAllJoinRequests()
    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAdmin(getHandler)
