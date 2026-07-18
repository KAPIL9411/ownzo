import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/backend/lib/firebase-admin/config'
import * as admin from 'firebase-admin'

/**
 * GET /api/cron/expire-listings
 *
 * Marks all active listings whose expiresAt < now as 'expired'.
 * Call this from a cron job (Vercel Cron, GitHub Actions, etc.) daily.
 *
 * Protected by a simple CRON_SECRET env variable.
 */
export async function GET(req: NextRequest) {
  try {
    // Validate cron secret to prevent unauthorised calls
    const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const now = admin.firestore.Timestamp.now()

    // Find all active listings that have passed their expiry date
    const snapshot = await adminDb
      .collection('listings')
      .where('status', '==', 'active')
      .where('expiresAt', '<=', now)
      .get()

    if (snapshot.empty) {
      return NextResponse.json({ success: true, expired: 0, message: 'No listings to expire' })
    }

    // Batch update in chunks of 500 (Firestore limit)
    const CHUNK = 500
    let count = 0
    const docs = snapshot.docs

    for (let i = 0; i < docs.length; i += CHUNK) {
      const batch = adminDb.batch()
      docs.slice(i, i + CHUNK).forEach((doc) => {
        batch.update(doc.ref, {
          status: 'expired',
          updatedAt: new Date(),
        })
        count++
      })
      await batch.commit()
    }

    console.log(`[cron] Expired ${count} listings`)

    return NextResponse.json({
      success: true,
      expired: count,
      message: `Expired ${count} listing${count !== 1 ? 's' : ''}`,
    })
  } catch (error: any) {
    console.error('[cron] expire-listings error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
