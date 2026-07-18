import { adminDb } from '@/backend/lib/firebase-admin/config'
import * as admin from 'firebase-admin'
import { User, UserRole } from '@/shared/types'
import { calculateTrustScore } from '@/shared/utils/trust-score'
import { serializeDocument, serializeSnapshot } from '@/backend/utils/serialize'

const USERS_COLLECTION = 'users'

export class UserRepository {
  private db = adminDb

  async createUser(uid: string, data: Partial<User>): Promise<User> {
    const userRef = this.db.collection(USERS_COLLECTION).doc(uid)
    const user: User = {
      id: uid,
      email: data.email!,
      name: data.name || 'Anonymous',
      rating: 0,
      reviewCount: 0,
      listingCount: 0,
      trustScore: 0,
      verified: false,
      isVerified: false,
      role: 'user',
      isBanned: false,
      reportCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    if (data.photoURL !== undefined) user.photoURL = data.photoURL
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber
    if (data.bio !== undefined) user.bio = data.bio
    if (data.city !== undefined) user.city = data.city
    if (data.communityId !== undefined) user.communityId = data.communityId
    await userRef.set(user)
    return user
  }

  async getUserById(id: string): Promise<User | null> {
    const doc = await this.db.collection(USERS_COLLECTION).doc(id).get()
    if (!doc.exists) return null
    return serializeDocument<User>({ id: doc.id, ...doc.data() })
  }

  async getUsersByIds(ids: string[]): Promise<Map<string, User>> {
    if (ids.length === 0) return new Map()
    const uniqueIds = [...new Set(ids)]
    const userMap = new Map<string, User>()
    const BATCH_SIZE = 10
    const chunks: string[][] = []
    for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
      chunks.push(uniqueIds.slice(i, i + BATCH_SIZE))
    }
    await Promise.all(chunks.map(async (chunk) => {
      const refs = chunk.map((id) => this.db.collection(USERS_COLLECTION).doc(id))
      const docs = await this.db.getAll(...refs)
      docs.forEach((doc) => {
        if (doc.exists) {
          userMap.set(doc.id, serializeDocument<User>({ id: doc.id, ...doc.data() }))
        }
      })
    }))
    return userMap
  }

  // ── Admin: list all users ────────────────────────────────
  async getAllUsers(limit = 50): Promise<User[]> {
    const snapshot = await this.db
      .collection(USERS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()
    const users: User[] = []
    snapshot.forEach((doc) => {
      users.push(serializeDocument<User>({ id: doc.id, ...doc.data() }))
    })
    return users
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const userRef = this.db.collection(USERS_COLLECTION).doc(id)
    await userRef.update({ ...data, updatedAt: new Date() })
    const updated = await userRef.get()
    return { id: updated.id, ...updated.data() } as User
  }

  // ── Admin: set role ──────────────────────────────────────
  async setRole(userId: string, role: UserRole): Promise<void> {
    await this.db.collection(USERS_COLLECTION).doc(userId).update({
      role,
      updatedAt: new Date(),
    })
  }

  // ── Admin: ban / unban ───────────────────────────────────
  async banUser(userId: string, reason: string): Promise<void> {
    await this.db.collection(USERS_COLLECTION).doc(userId).update({
      isBanned: true,
      banReason: reason,
      updatedAt: new Date(),
    })
    // Recalculate trust score (ban tanks it)
    await this.updateTrustScore(userId)
  }

  async unbanUser(userId: string): Promise<void> {
    await this.db.collection(USERS_COLLECTION).doc(userId).update({
      isBanned: false,
      banReason: admin.firestore.FieldValue.delete(),
      updatedAt: new Date(),
    })
    await this.updateTrustScore(userId)
  }

  // ── Admin: verify user ───────────────────────────────────
  async verifyUser(
    userId: string,
    verificationType: User['verificationType'] = 'government'
  ): Promise<void> {
    await this.db.collection(USERS_COLLECTION).doc(userId).update({
      isVerified: true,
      verified: true,
      verificationType,
      updatedAt: new Date(),
    })
    await this.updateTrustScore(userId)
  }

  async unverifyUser(userId: string): Promise<void> {
    await this.db.collection(USERS_COLLECTION).doc(userId).update({
      isVerified: false,
      verified: false,
      verificationType: admin.firestore.FieldValue.delete(),
      updatedAt: new Date(),
    })
    await this.updateTrustScore(userId)
  }

  // ── Trust score ──────────────────────────────────────────
  async updateTrustScore(userId: string): Promise<number> {
    const user = await this.getUserById(userId)
    if (!user) return 0

    const trustScore = calculateTrustScore({
      verified: user.isVerified ?? user.verified ?? false,
      completedSales: user.listingCount ?? 0,
      positiveReviews: user.reviewCount ?? 0,
      negativeReviews: 0,
      profileComplete: !!(user.bio && user.photoURL),
      reported: user.reportCount ?? 0,
    })

    await this.db.collection(USERS_COLLECTION).doc(userId).update({
      trustScore,
      updatedAt: new Date(),
    })
    return trustScore
  }

  // ── Increment helpers ────────────────────────────────────
  async incrementListingCount(userId: string, delta = 1): Promise<void> {
    await this.db.collection(USERS_COLLECTION).doc(userId).update({
      listingCount: admin.firestore.FieldValue.increment(delta),
      updatedAt: new Date(),
    })
  }

  async incrementReportCount(userId: string): Promise<void> {
    await this.db.collection(USERS_COLLECTION).doc(userId).update({
      reportCount: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date(),
    })
    await this.updateTrustScore(userId)
  }

  async updateRating(userId: string, newRating: number, isFirstReview: boolean): Promise<void> {
    const userRef = this.db.collection(USERS_COLLECTION).doc(userId)
    if (isFirstReview) {
      await userRef.update({ rating: newRating, reviewCount: 1, updatedAt: new Date() })
    } else {
      const user = await this.getUserById(userId)
      if (!user) return
      const totalReviews = (user.reviewCount ?? 0) + 1
      const newAverage = ((user.rating ?? 0) * (user.reviewCount ?? 0) + newRating) / totalReviews
      await userRef.update({ rating: newAverage, reviewCount: totalReviews, updatedAt: new Date() })
    }
    await this.updateTrustScore(userId)
  }
}

export const userRepository = new UserRepository()
