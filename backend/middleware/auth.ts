import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/backend/lib/firebase-admin/auth'
import { userRepository } from '@/backend/repositories/user.repository'

export async function authMiddleware(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Missing token' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await verifyIdToken(token)
    return { uid: decodedToken.uid, email: decodedToken.email }
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized - Invalid token' }, { status: 401 })
  }
}

export function requireAuth(handler: Function) {
  return async (req: NextRequest, context?: any) => {
    const authResult = await authMiddleware(req)
    if (authResult instanceof NextResponse) return authResult
    return handler(req, { ...context, user: authResult })
  }
}

export function requireAdmin(handler: Function) {
  return async (req: NextRequest, context?: any) => {
    const authResult = await authMiddleware(req)
    if (authResult instanceof NextResponse) return authResult

    // Check role in Firestore
    const user = await userRepository.getUserById(authResult.uid)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 })
    }

    return handler(req, { ...context, user: { ...authResult, role: user.role } })
  }
}
