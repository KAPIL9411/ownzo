import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/backend/middleware/auth'
import { userRepository } from '@/backend/repositories/user.repository'
import { errorHandler } from '@/backend/middleware/error-handler'

// PATCH /api/admin/users/:id  — ban, unban, verify, set-role, recalculate-trust
async function handler(
  req: NextRequest,
  { params, user: adminUser }: { params: Promise<{ id: string }>; user: any }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, reason, role, verificationType } = body

    switch (action) {
      case 'ban':
        await userRepository.banUser(id, reason ?? 'Violated platform rules')
        break
      case 'unban':
        await userRepository.unbanUser(id)
        break
      case 'verify':
        await userRepository.verifyUser(id, verificationType ?? 'government')
        break
      case 'unverify':
        await userRepository.unverifyUser(id)
        break
      case 'set-role':
        await userRepository.setRole(id, role)
        break
      case 'recalculate-trust':
        await userRepository.updateTrustScore(id)
        break
      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
    }

    const updated = await userRepository.getUserById(id)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return errorHandler(error)
  }
}

export const PATCH = requireAdmin(handler)
