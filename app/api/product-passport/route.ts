import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { adminDb } from '@/backend/lib/firebase-admin/config'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'
import * as admin from 'firebase-admin'

// GET /api/product-passport?listingId=xxx
async function getHandler(req: NextRequest) {
  try {
    const listingId = req.nextUrl.searchParams.get('listingId')
    if (!listingId) {
      return NextResponse.json({ success: false, error: 'listingId required' }, { status: 400 })
    }
    const snap = await adminDb
      .collection('productPassports')
      .where('listingId', '==', listingId)
      .limit(1)
      .get()

    if (snap.empty) {
      return NextResponse.json({ success: true, data: null })
    }
    const doc = snap.docs[0]
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } })
  } catch (error) {
    return errorHandler(error)
  }
}

// POST /api/product-passport — create or update
async function postHandler(req: NextRequest, { user }: { user: { uid: string } }) {
  try {
    const body = await req.json()
    const { listingId, invoiceURL, warrantyTill, ownershipDuration,
      purchaseDate, originalPrice, serviceHistory } = body

    if (!listingId) {
      return NextResponse.json({ success: false, error: 'listingId required' }, { status: 400 })
    }

    // Verify listing belongs to this user
    const listingDoc = await adminDb.collection('listings').doc(listingId).get()
    if (!listingDoc.exists) throw new ApiError(404, 'Listing not found')
    if (listingDoc.data()?.sellerId !== user.uid) throw new ApiError(403, 'Not your listing')

    // Check existing passport
    const existing = await adminDb
      .collection('productPassports')
      .where('listingId', '==', listingId)
      .limit(1)
      .get()

    const passportData = {
      listingId,
      invoiceURL:        invoiceURL        ?? null,
      warrantyTill:      warrantyTill       ? admin.firestore.Timestamp.fromDate(new Date(warrantyTill)) : null,
      ownershipDuration: ownershipDuration ?? null,
      purchaseDate:      purchaseDate       ? admin.firestore.Timestamp.fromDate(new Date(purchaseDate)) : null,
      originalPrice:     originalPrice      ?? null,
      serviceHistory:    serviceHistory     ?? [],
      updatedAt:         admin.firestore.FieldValue.serverTimestamp(),
    }

    let id: string
    if (!existing.empty) {
      id = existing.docs[0].id
      await adminDb.collection('productPassports').doc(id).update(passportData)
    } else {
      const ref = adminDb.collection('productPassports').doc()
      id = ref.id
      await ref.set({ id, createdAt: admin.firestore.FieldValue.serverTimestamp(), ...passportData })
    }

    return NextResponse.json({ success: true, data: { id, ...passportData } })
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET  = getHandler
export const POST = requireAuth(postHandler)
