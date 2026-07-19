import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/backend/middleware/auth'
import { adminDb } from '@/backend/lib/firebase-admin/config'
import { errorHandler } from '@/backend/middleware/error-handler'

async function handler(_req: NextRequest) {
  try {
    const db = adminDb
    const [users, listings, communities, buyRequests, joinRequests] = await Promise.all([
      db.collection('users').get(),
      db.collection('listings').get(),
      db.collection('communities').get(),
      db.collection('buyRequests').get(),
      db.collection('communityJoinRequests').where('status', '==', 'pending').get(),
    ])

    const userDocs = users.docs.map((d) => d.data())
    const listingDocs = listings.docs.map((d) => d.data())

    return NextResponse.json({
      success: true,
      data: {
        totalUsers:           userDocs.length,
        totalListings:        listingDocs.length,
        totalCommunities:     communities.size,
        totalBuyRequests:     buyRequests.size,
        activeListings:       listingDocs.filter((l) => l.status === 'active').length,
        pendingListings:      listingDocs.filter((l) => l.status === 'pending_review').length,
        bannedUsers:          userDocs.filter((u) => u.isBanned).length,
        verifiedUsers:        userDocs.filter((u) => u.isVerified || u.verified).length,
        pendingJoinRequests:  joinRequests.size,
      },
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = requireAdmin(handler)
