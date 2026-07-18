import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { buyRequestRepository } from '@/backend/repositories/buyrequest.repository'
import { validateRequest, createBuyRequestSchema } from '@/backend/middleware/validators'
import { errorHandler } from '@/backend/middleware/error-handler'

async function getHandler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    
    const filters = {
      categoryId: searchParams.get('categoryId') || undefined,
      city: searchParams.get('city') || undefined,
      communityId: searchParams.get('communityId') || undefined,
      minBudget: searchParams.get('minBudget') ? Number(searchParams.get('minBudget')) : undefined,
      maxBudget: searchParams.get('maxBudget') ? Number(searchParams.get('maxBudget')) : undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    }

    const result = await buyRequestRepository.getBuyRequests(filters)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json()
    const validatedData = validateRequest(createBuyRequestSchema, body)

    const buyRequest = await buyRequestRepository.createBuyRequest(user.uid, validatedData)

    return NextResponse.json(
      {
        success: true,
        data: buyRequest,
      },
      { status: 201 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = getHandler
export const POST = requireAuth(postHandler)
