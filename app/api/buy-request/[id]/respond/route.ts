import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { adminDb } from '@/backend/lib/firebase-admin/config'
import { errorHandler } from '@/backend/middleware/error-handler'
import * as admin from 'firebase-admin'

/**
 * POST /api/buy-request/:id/respond
 *
 * A seller responds to a buy request — creates a chat room between
 * the responder (seller) and the buy-request owner (buyer).
 */
async function handler(
  req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: { uid: string } }
) {
  try {
    const { id: buyRequestId } = await params
    const { message } = await req.json()

    // Load the buy request
    const reqDoc = await adminDb.collection('buyRequests').doc(buyRequestId).get()
    if (!reqDoc.exists) {
      return NextResponse.json({ success: false, error: 'Buy request not found' }, { status: 404 })
    }

    const buyRequest = reqDoc.data()!

    // Can't respond to your own request
    if (buyRequest.userId === user.uid) {
      return NextResponse.json(
        { success: false, error: 'You cannot respond to your own request' },
        { status: 400 }
      )
    }

    // Check if a chat already exists for this pair + buy request
    const existingChat = await adminDb
      .collection('chats')
      .where('buyRequestId', '==', buyRequestId)
      .where('sellerId', '==', user.uid)
      .get()

    let chatId: string

    if (!existingChat.empty) {
      chatId = existingChat.docs[0].id
    } else {
      // Create new chat
      const chatRef = adminDb.collection('chats').doc()
      const now = admin.firestore.FieldValue.serverTimestamp()

      await chatRef.set({
        id:           chatRef.id,
        buyRequestId,
        buyerId:      buyRequest.userId,   // the requester is the buyer
        sellerId:     user.uid,             // the responder is the seller
        lastMessage:  message ?? `I have what you're looking for: ${buyRequest.title}`,
        lastMessageAt: now,
        unreadCount:  1,
        createdAt:    now,
        updatedAt:    now,
      })
      chatId = chatRef.id

      // Send initial message
      const msgRef = adminDb.collection('messages').doc()
      await msgRef.set({
        id:        msgRef.id,
        chatId,
        senderId:  user.uid,
        message:   message ?? `Hi! I have what you're looking for: "${buyRequest.title}". Let's chat!`,
        type:      'text',
        read:      false,
        createdAt: now,
      })

      // Increment buy request responseCount
      await adminDb.collection('buyRequests').doc(buyRequestId).update({
        responseCount: admin.firestore.FieldValue.increment(1),
      })
    }

    return NextResponse.json({ success: true, data: { chatId } })
  } catch (error) {
    return errorHandler(error)
  }
}

export const POST = requireAuth(handler)
