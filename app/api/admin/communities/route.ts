import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/backend/middleware/auth'
import { communityRepository } from '@/backend/repositories/community.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

// GET /api/admin/communities
async function getHandler(_req: NextRequest) {
  try {
    const communities = await communityRepository.getAllCommunities()
    return NextResponse.json({ success: true, data: communities })
  } catch (error) {
    return errorHandler(error)
  }
}

// POST /api/admin/communities — create
async function postHandler(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, city, college, description, requiresApproval, verified } = body

    if (!name || !type || !city) {
      return NextResponse.json({ success: false, error: 'name, type, and city are required' }, { status: 400 })
    }

    const community = await communityRepository.adminCreateCommunity({
      name, type, city, college, description, requiresApproval, verified,
    })
    return NextResponse.json({ success: true, data: community }, { status: 201 })
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET  = requireAdmin(getHandler)
export const POST = requireAdmin(postHandler)
