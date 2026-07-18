import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { cascadeDeleteService } from '@/backend/services/cascade-delete.service'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/users/[id]/delete
 * Delete a user and all associated data (cascade delete)
 * Only the user themselves can delete their account
 */
async function handler(
  req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: { uid: string } }
) {
  try {
    const { id: targetUserId } = await params
    const userId = user.uid

    // Users can only delete their own account
    if (userId !== targetUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only delete your own account',
        },
        { status: 403 }
      )
    }

    // Perform cascade delete
    await cascadeDeleteService.deleteUser(targetUserId)

    return NextResponse.json(
      {
        success: true,
        message: 'Account and all associated data deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete account',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export const DELETE = requireAuth(handler)
