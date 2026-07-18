import { adminDb } from '@/backend/lib/firebase-admin/config'
import * as admin from 'firebase-admin'
import { Wishlist } from '@/shared/types'
import { serializeSnapshots } from '@/backend/utils/serialize'

const WISHLIST_COLLECTION = 'wishlist'

export class WishlistRepository {
  private db = adminDb

  async addToWishlist(userId: string, listingId: string): Promise<Wishlist> {
    // Use transaction to prevent race conditions
    return await this.db.runTransaction(async (transaction) => {
      // Check if already exists (within transaction)
      const existingSnapshot = await transaction.get(
        this.db
          .collection(WISHLIST_COLLECTION)
          .where('userId', '==', userId)
          .where('listingId', '==', listingId)
          .limit(1)
      )

      if (!existingSnapshot.empty) {
        throw new Error('Already in wishlist')
      }

      // Check if listing exists
      const listingRef = this.db.collection('listings').doc(listingId)
      const listingDoc = await transaction.get(listingRef)

      if (!listingDoc.exists) {
        throw new Error('Listing not found')
      }

      // Create wishlist entry
      const wishlistRef = this.db.collection(WISHLIST_COLLECTION).doc()
      const wishlist: Wishlist = {
        id: wishlistRef.id,
        userId,
        listingId,
        createdAt: new Date(),
      }

      transaction.set(wishlistRef, wishlist)

      // Atomically increment wishlist count
      transaction.update(listingRef, {
        wishlistCount: admin.firestore.FieldValue.increment(1),
      })

      return wishlist
    })
  }

  async removeFromWishlist(userId: string, listingId: string): Promise<void> {
    // Use transaction to prevent race conditions
    await this.db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(
        this.db
          .collection(WISHLIST_COLLECTION)
          .where('userId', '==', userId)
          .where('listingId', '==', listingId)
          .limit(1)
      )

      if (!snapshot.empty) {
        const wishlistRef = snapshot.docs[0].ref
        const listingRef = this.db.collection('listings').doc(listingId)

        // Delete wishlist entry
        transaction.delete(wishlistRef)

        // Atomically decrement wishlist count (protect against negative values)
        transaction.update(listingRef, {
          wishlistCount: admin.firestore.FieldValue.increment(-1),
        })
      }
    })
  }

  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    const snapshot = await this.db
      .collection(WISHLIST_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()

    return serializeSnapshots<Wishlist>(snapshot.docs)
  }

  async isInWishlist(userId: string, listingId: string): Promise<boolean> {
    const snapshot = await this.db
      .collection(WISHLIST_COLLECTION)
      .where('userId', '==', userId)
      .where('listingId', '==', listingId)
      .limit(1)
      .get()

    return !snapshot.empty
  }
}

export const wishlistRepository = new WishlistRepository()
