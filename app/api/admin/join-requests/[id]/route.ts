import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/backend/middleware/auth'
import { communityRepository } from '@/backend/repositories/community.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

type Ctx = { params: Promise<{ id: string }>; user: { uid: string } }

// PATCH /api/admin/join-requests/:id — approve or reject
async function handler(req: NextRequest, { params, user }: Ctx) {
  try {
    const { id } = await params
    const { action } = await req.json()

    if (action === 'approve') {
      await communityRepository.approveJoinRequest(id, user.uid)
    } else if (action === 'reject') {
      await communityRepository.rejectJoinRequest(id, user.uid)
    } else {
      return NextResponse.json({ success: false, error: 'action must be approve or reject' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `Request ${action}d` })
  } catch (error) {
    return errorHandler(error)
  }
}

export const PATCH = requireAdmin(handler)
