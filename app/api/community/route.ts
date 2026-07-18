import { NextRequest, NextResponse } from 'next/server'
import { communityRepository } from '@/backend/repositories/community.repository'
import { errorHandler } from '@/backend/middleware/error-handler'
import { requireAuth } from '@/backend/middleware/auth'

// GET /api/community — list all or filter by city/type
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const city = searchParams.get('city')
    const type = searchParams.get('type')

    let communities

    if (city) {
      communities = await communityRepository.getCommunitiesByCity(city)
    } else if (type) {
      communities = await communityRepository.getCommunitiesByType(type as any)
    } else {
      communities = await communityRepository.getAllCommunities()
    }

    // Seed if empty
    if (communities.length === 0) {
      await communityRepository.seedCommunities()
      communities = await communityRepository.getAllCommunities()
    }

    return NextResponse.json({ success: true, data: communities })
  } catch (error) {
    return errorHandler(error)
  }
}

// POST /api/community — join or leave a community
async function postHandler(req: NextRequest, context: { user: { uid: string } }) {
  try {
    const userId = context.user.uid
    const body = await req.json()
    const { communityId, action } = body // action: 'join' | 'leave'

    if (!communityId || !action) {
      return NextResponse.json(
        { success: false, error: 'communityId and action are required' },
        { status: 400 }
      )
    }

    const community = await communityRepository.getCommunityById(communityId)
    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      )
    }

    if (action === 'join') {
      await communityRepository.joinCommunity(userId, communityId)
      return NextResponse.json({
        success: true,
        message: `Joined ${community.name}`,
        data: { communityId, action: 'joined' },
      })
    }

    if (action === 'leave') {
      await communityRepository.leaveCommunity(userId, communityId)
      return NextResponse.json({
        success: true,
        message: `Left ${community.name}`,
        data: { communityId, action: 'left' },
      })
    }

    return NextResponse.json(
      { success: false, error: 'action must be join or leave' },
      { status: 400 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}

export const POST = requireAuth(postHandler)
