import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { adminDb } from '@/backend/lib/firebase-admin/config'
import { userRepository } from '@/backend/repositories/user.repository'
import { errorHandler } from '@/backend/middleware/error-handler'
import * as admin from 'firebase-admin'

// POST /api/report — report a listing or user
async function handler(req: NextRequest, { user }: { user: { uid: string } }) {
  try {
    const body = await req.json()
    const { type, targetId, reason, description } = body

    if (!type || !targetId || !reason) {
      return NextResponse.json(
        { success: false, error: 'type, targetId and reason are required' },
        { status: 400 }
      )
    }

    if (!['listing', 'user'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'type must be listing or user' },
        { status: 400 }
      )
    }

    // Prevent self-report
    if (type === 'user' && targetId === user.uid) {
      return NextResponse.json(
        { success: false, error: 'You cannot report yourself' },
        { status: 400 }
      )
    }

    // Check for duplicate report from same user
    const existing = await adminDb
      .collection('reports')
      .where('reporterId', '==', user.uid)
      .where('targetId', '==', targetId)
      .where('type', '==', type)
      .get()

    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: 'You have already reported this' },
        { status: 409 }
      )
    }

    // Save report
    const reportRef = adminDb.collection('reports').doc()
    await reportRef.set({
      id: reportRef.id,
      type,
      targetId,
      reporterId: user.uid,
      reason,
      description: description ?? '',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // If reporting a user, increment their reportCount (tanks trust score)
    if (type === 'user') {
      await userRepository.incrementReportCount(targetId)
    }

    // If reporting a listing, flag it for admin review
    if (type === 'listing') {
      await adminDb.collection('listings').doc(targetId).update({
        flagged: true,
        flagCount: admin.firestore.FieldValue.increment(1),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted. Our team will review it shortly.',
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const POST = requireAuth(handler)
