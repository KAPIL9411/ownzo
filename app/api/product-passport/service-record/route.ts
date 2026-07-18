import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { adminDb } from '@/backend/lib/firebase-admin/config'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'
import * as admin from 'firebase-admin'

// POST /api/product-passport/service-record — append a service record
async function handler(req: NextRequest, { user }: { user: { uid: string } }) {
  try {
    const { passportId, date, description, cost, serviceProvider } = await req.json()

    if (!passportId || !description) {
      return NextResponse.json({ success: false, error: 'passportId and description required' }, { status: 400 })
    }

    const passportDoc = await adminDb.collection('productPassports').doc(passportId).get()
    if (!passportDoc.exists) throw new ApiError(404, 'Passport not found')

    // Verify ownership via the linked listing
    const listingId = passportDoc.data()?.listingId
    if (listingId) {
      const listing = await adminDb.collection('listings').doc(listingId).get()
      if (listing.data()?.sellerId !== user.uid) throw new ApiError(403, 'Not your listing')
    }

    const newRecord = {
      date:            date            ? admin.firestore.Timestamp.fromDate(new Date(date)) : admin.firestore.Timestamp.now(),
      description,
      cost:            cost            ?? null,
      serviceProvider: serviceProvider ?? null,
    }

    await adminDb.collection('productPassports').doc(passportId).update({
      serviceHistory: admin.firestore.FieldValue.arrayUnion(newRecord),
      updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ success: true, data: newRecord })
  } catch (error) {
    return errorHandler(error)
  }
}

export const POST = requireAuth(handler)
