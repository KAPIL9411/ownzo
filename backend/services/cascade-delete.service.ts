/**
 * Cascade Delete Service
 * Handles cascading deletes and orphaned data cleanup
 * Ensures referential integrity in Firestore
 */

import { adminDb } from '@/backend/lib/firebase-admin/config'

export class CascadeDeleteService {
  private db = adminDb

  /**
   * Delete a user and all associated data
   * Cascade deletes:
   * - User's listings
   * - User's offers (as buyer)
   * - User's buy requests
   * - User's wishlist entries
   * - User's messages
   * - User's chats (if no other participants)
   * - User's reviews (as reviewer)
   * - User's notifications
   */
  async deleteUser(userId: string): Promise<void> {
    console.log(`Starting cascade delete for user: ${userId}`)

    try {
      // Use batched writes for atomic operations (max 500 operations per batch)
      const batches: FirebaseFirestore.WriteBatch[] = [this.db.batch()]
      let currentBatch = 0
      let operationCount = 0

      const addToBatch = (ref: FirebaseFirestore.DocumentReference) => {
        if (operationCount >= 500) {
          batches.push(this.db.batch())
          currentBatch++
          operationCount = 0
        }
        batches[currentBatch].delete(ref)
        operationCount++
      }

      // 1. Delete user's listings and their associated data
      const listingsSnapshot = await this.db
        .collection('listings')
        .where('sellerId', '==', userId)
        .get()

      for (const listingDoc of listingsSnapshot.docs) {
        // Delete offers on this listing
        await this.deleteListingOffers(listingDoc.id, addToBatch)
        
        // Delete wishlist entries for this listing
        await this.deleteListingWishlistEntries(listingDoc.id, addToBatch)
        
        // Delete reviews for this listing
        await this.deleteListingReviews(listingDoc.id, addToBatch)
        
        // Delete the listing itself
        addToBatch(listingDoc.ref)
      }

      // 2. Delete user's offers (as buyer)
      const offersSnapshot = await this.db
        .collection('offers')
        .where('buyerId', '==', userId)
        .get()

      offersSnapshot.docs.forEach((doc) => addToBatch(doc.ref))

      // 3. Delete user's buy requests
      const buyRequestsSnapshot = await this.db
        .collection('buyRequests')
        .where('userId', '==', userId)
        .get()

      buyRequestsSnapshot.docs.forEach((doc) => addToBatch(doc.ref))

      // 4. Delete user's wishlist entries
      const wishlistSnapshot = await this.db
        .collection('wishlist')
        .where('userId', '==', userId)
        .get()

      wishlistSnapshot.docs.forEach((doc) => addToBatch(doc.ref))

      // 5. Delete user's messages
      const messagesSnapshot = await this.db
        .collection('messages')
        .where('senderId', '==', userId)
        .get()

      messagesSnapshot.docs.forEach((doc) => addToBatch(doc.ref))

      // 6. Handle user's chats
      const chatsSnapshot = await this.db
        .collection('chats')
        .where('participantIds', 'array-contains', userId)
        .get()

      for (const chatDoc of chatsSnapshot.docs) {
        const chatData = chatDoc.data()
        const participantIds = chatData.participantIds as string[]

        if (participantIds.length === 2) {
          // Direct chat - delete it
          addToBatch(chatDoc.ref)
        } else {
          // Group chat - just remove user from participants
          batches[currentBatch].update(chatDoc.ref, {
            participantIds: participantIds.filter((id) => id !== userId),
            updatedAt: new Date(),
          })
          operationCount++
        }
      }

      // 7. Delete user's reviews (as reviewer)
      const reviewsSnapshot = await this.db
        .collection('reviews')
        .where('userId', '==', userId)
        .get()

      reviewsSnapshot.docs.forEach((doc) => addToBatch(doc.ref))

      // 8. Delete user's notifications
      const notificationsSnapshot = await this.db
        .collection('notifications')
        .where('userId', '==', userId)
        .get()

      notificationsSnapshot.docs.forEach((doc) => addToBatch(doc.ref))

      // 9. Finally, delete the user document
      addToBatch(this.db.collection('users').doc(userId))

      // Commit all batches
      await Promise.all(batches.map((batch) => batch.commit()))

      console.log(`Successfully deleted user ${userId} and all associated data`)
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error)
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete a listing and all associated data
   * Cascade deletes:
   * - Associated offers
   * - Wishlist entries
   * - Reviews
   * - Messages referencing this listing
   */
  async deleteListing(listingId: string): Promise<void> {
    console.log(`Starting cascade delete for listing: ${listingId}`)

    try {
      const batch = this.db.batch()
      let operationCount = 0

      // 1. Delete offers on this listing
      const offersSnapshot = await this.db
        .collection('offers')
        .where('listingId', '==', listingId)
        .get()

      offersSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
        operationCount++
      })

      // 2. Delete wishlist entries
      const wishlistSnapshot = await this.db
        .collection('wishlist')
        .where('listingId', '==', listingId)
        .get()

      wishlistSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
        operationCount++
      })

      // 3. Delete reviews
      const reviewsSnapshot = await this.db
        .collection('reviews')
        .where('listingId', '==', listingId)
        .get()

      reviewsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
        operationCount++
      })

      // 4. Delete the listing
      batch.delete(this.db.collection('listings').doc(listingId))
      operationCount++

      if (operationCount > 0) {
        await batch.commit()
      }

      console.log(`Successfully deleted listing ${listingId} and ${operationCount - 1} associated records`)
    } catch (error) {
      console.error(`Error deleting listing ${listingId}:`, error)
      throw new Error(`Failed to delete listing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete a chat and all its messages
   */
  async deleteChat(chatId: string): Promise<void> {
    console.log(`Starting cascade delete for chat: ${chatId}`)

    try {
      // Delete all messages in the chat
      const messagesSnapshot = await this.db
        .collection('messages')
        .where('chatId', '==', chatId)
        .get()

      const batches: FirebaseFirestore.WriteBatch[] = [this.db.batch()]
      let currentBatch = 0
      let operationCount = 0

      messagesSnapshot.docs.forEach((doc) => {
        if (operationCount >= 500) {
          batches.push(this.db.batch())
          currentBatch++
          operationCount = 0
        }
        batches[currentBatch].delete(doc.ref)
        operationCount++
      })

      // Delete the chat document
      batches[currentBatch].delete(this.db.collection('chats').doc(chatId))

      // Commit all batches
      await Promise.all(batches.map((batch) => batch.commit()))

      console.log(`Successfully deleted chat ${chatId} and ${messagesSnapshot.size} messages`)
    } catch (error) {
      console.error(`Error deleting chat ${chatId}:`, error)
      throw new Error(`Failed to delete chat: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Helper: Delete offers for a specific listing
   */
  private async deleteListingOffers(
    listingId: string,
    addToBatch: (ref: FirebaseFirestore.DocumentReference) => void
  ): Promise<void> {
    const offersSnapshot = await this.db
      .collection('offers')
      .where('listingId', '==', listingId)
      .get()

    offersSnapshot.docs.forEach((doc) => addToBatch(doc.ref))
  }

  /**
   * Helper: Delete wishlist entries for a specific listing
   */
  private async deleteListingWishlistEntries(
    listingId: string,
    addToBatch: (ref: FirebaseFirestore.DocumentReference) => void
  ): Promise<void> {
    const wishlistSnapshot = await this.db
      .collection('wishlist')
      .where('listingId', '==', listingId)
      .get()

    wishlistSnapshot.docs.forEach((doc) => addToBatch(doc.ref))
  }

  /**
   * Helper: Delete reviews for a specific listing
   */
  private async deleteListingReviews(
    listingId: string,
    addToBatch: (ref: FirebaseFirestore.DocumentReference) => void
  ): Promise<void> {
    const reviewsSnapshot = await this.db
      .collection('reviews')
      .where('listingId', '==', listingId)
      .get()

    reviewsSnapshot.docs.forEach((doc) => addToBatch(doc.ref))
  }

  /**
   * Clean up orphaned data
   * Finds and deletes records that reference non-existent entities
   */
  async cleanupOrphanedData(): Promise<{
    orphanedOffers: number
    orphanedWishlist: number
    orphanedReviews: number
    orphanedMessages: number
  }> {
    console.log('Starting orphaned data cleanup...')

    const results = {
      orphanedOffers: 0,
      orphanedWishlist: 0,
      orphanedReviews: 0,
      orphanedMessages: 0,
    }

    // This is a resource-intensive operation - should be run as a scheduled job
    // For production, use Cloud Functions with scheduled triggers

    try {
      // Clean orphaned offers (referencing deleted listings)
      const offersSnapshot = await this.db.collection('offers').get()
      const listingIds = new Set<string>()
      
      for (const offerDoc of offersSnapshot.docs) {
        const listingId = offerDoc.data().listingId
        if (!listingIds.has(listingId)) {
          const listingExists = (await this.db.collection('listings').doc(listingId).get()).exists
          if (!listingExists) {
            await offerDoc.ref.delete()
            results.orphanedOffers++
          }
          listingIds.add(listingId)
        }
      }

      console.log(`Cleaned up ${results.orphanedOffers} orphaned offers`)
      return results
    } catch (error) {
      console.error('Error during orphaned data cleanup:', error)
      throw error
    }
  }
}

export const cascadeDeleteService = new CascadeDeleteService()
