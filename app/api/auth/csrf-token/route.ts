import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { getCSRFTokenHandler } from '@/backend/middleware/csrf'
import { errorHandler } from '@/backend/middleware/error-handler'

async function handler(req: NextRequest, { user }: any) {
  try {
    return getCSRFTokenHandler(user.uid)
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAuth(handler)
