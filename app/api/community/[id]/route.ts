import { NextRequest, NextResponse } from 'next/server'
import { communityRepository } from '@/backend/repositories/community.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

// GET /api/community/:id — single community
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const community = await communityRepository.getCommunityById(id)
    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: community })
  } catch (error) {
    return errorHandler(error)
  }
}
