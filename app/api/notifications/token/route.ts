import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { adminDb } from '@/backend/lib/firebase-admin/config'
import { errorHandler } from '@/backend/middleware/error-handler'
import * as admin from 'firebase-admin'

/**
 * POST /api/notifications/token
 * Saves or updates the FCM push token for the authenticated user.
 * Called by usePushNotifications hook after permission is granted.
 */
async function handler(req: NextRequest, { user }: { user: { uid: string } }) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'token is required' },
        { status: 400 }
      )
    }

    // Upsert the FCM token for this user
    await adminDb
      .collection('fcmTokens')
      .doc(user.uid)
      .set(
        {
          userId:    user.uid,
          token,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    return errorHandler(error)
  }
}

export const POST = requireAuth(handler)
