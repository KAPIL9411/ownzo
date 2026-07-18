import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { buyRequestRepository } from '@/backend/repositories/buyrequest.repository'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'

async function patchHandler(
  req: NextRequest,
  context: { params: { id: string }; user: any }
) {
  try {
    const requestId = context.params.id
    const user = context.user

    const buyRequest = await buyRequestRepository.getBuyRequestById(requestId)

    if (!buyRequest) {
      throw new ApiError(404, 'Buy request not found')
    }

    // Check ownership
    if (buyRequest.userId !== user.uid) {
      throw new ApiError(403, 'Not authorized to update this buy request')
    }

    const body = await req.json()
    const updatedRequest = await buyRequestRepository.updateBuyRequest(requestId, body)

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

async function deleteHandler(
  req: NextRequest,
  context: { params: { id: string }; user: any }
) {
  try {
    const requestId = context.params.id
    const user = context.user

    const buyRequest = await buyRequestRepository.getBuyRequestById(requestId)

    if (!buyRequest) {
      throw new ApiError(404, 'Buy request not found')
    }

    // Check ownership
    if (buyRequest.userId !== user.uid) {
      throw new ApiError(403, 'Not authorized to delete this buy request')
    }

    await buyRequestRepository.deleteBuyRequest(requestId)

    return NextResponse.json({
      success: true,
      message: 'Buy request deleted successfully',
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const PATCH = requireAuth(patchHandler)
export const DELETE = requireAuth(deleteHandler)
