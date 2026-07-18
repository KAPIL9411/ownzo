import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/backend/middleware/auth'
import { communityRepository } from '@/backend/repositories/community.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

type Ctx = { params: Promise<{ id: string }>; user: any }

// PATCH /api/admin/communities/:id — update / verify / toggle-approval
async function patchHandler(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    const body = await req.json()

    if (body.action === 'verify') {
      await communityRepository.verifyCommunity(id, true)
    } else if (body.action === 'unverify') {
      await communityRepository.verifyCommunity(id, false)
    } else {
      await communityRepository.adminUpdateCommunity(id, body)
    }

    const updated = await communityRepository.getCommunityById(id)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return errorHandler(error)
  }
}

// DELETE /api/admin/communities/:id
async function deleteHandler(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params
    await communityRepository.adminDeleteCommunity(id)
    return NextResponse.json({ success: true, message: 'Community deleted' })
  } catch (error) {
    return errorHandler(error)
  }
}

export const PATCH  = requireAdmin(patchHandler)
export const DELETE = requireAdmin(deleteHandler)
