/**
 * Foreign Key Validation Service
 * Ensures referential integrity before writes
 * Validates that referenced entities exist
 */

import { adminDb } from '@/backend/lib/firebase-admin/config'

export class ForeignKeyError extends Error {
  constructor(
    public field: string,
    public entityType: string,
    public entityId: string
  ) {
    super(`${entityType} with id '${entityId}' does not exist (referenced by ${field})`)
    this.name = 'ForeignKeyError'
  }
}

export class ForeignKeyService {
  private db = adminDb

  /**
   * Validate that a user exists
   */
  async validateUserExists(userId: string, fieldName: string = 'userId'): Promise<void> {
    const userDoc = await this.db.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      throw new ForeignKeyError(fieldName, 'User', userId)
    }
  }

  /**
   * Validate that a listing exists and is active
   */
  async validateListingExists(
    listingId: string,
    fieldName: string = 'listingId',
    requireActive: boolean = false
  ): Promise<void> {
    const listingDoc = await this.db.collection('listings').doc(listingId).get()
    
    if (!listingDoc.exists) {
      throw new ForeignKeyError(fieldName, 'Listing', listingId)
    }

    if (requireActive) {
      const listing = listingDoc.data()
      if (listing?.status !== 'active') {
        throw new Error(`Listing ${listingId} is not active (status: ${listing?.status})`)
      }
    }
  }

  /**
   * Validate that a category exists
   */
  async validateCategoryExists(categoryId: string, fieldName: string = 'categoryId'): Promise<void> {
    const categoryDoc = await this.db.collection('categories').doc(categoryId).get()
    
    if (!categoryDoc.exists) {
      throw new ForeignKeyError(fieldName, 'Category', categoryId)
    }
  }

  /**
   * Validate that a community exists
   */
  async validateCommunityExists(communityId: string, fieldName: string = 'communityId'): Promise<void> {
    const communityDoc = await this.db.collection('communities').doc(communityId).get()
    
    if (!communityDoc.exists) {
      throw new ForeignKeyError(fieldName, 'Community', communityId)
    }
  }

  /**
   * Validate that a chat exists
   */
  async validateChatExists(chatId: string, fieldName: string = 'chatId'): Promise<void> {
    const chatDoc = await this.db.collection('chats').doc(chatId).get()
    
    if (!chatDoc.exists) {
      throw new ForeignKeyError(fieldName, 'Chat', chatId)
    }
  }

  /**
   * Validate that an offer exists
   */
  async validateOfferExists(offerId: string, fieldName: string = 'offerId'): Promise<void> {
    const offerDoc = await this.db.collection('offers').doc(offerId).get()
    
    if (!offerDoc.exists) {
      throw new ForeignKeyError(fieldName, 'Offer', offerId)
    }
  }

  /**
   * Validate listing ownership
   */
  async validateListingOwnership(listingId: string, userId: string): Promise<void> {
    const listingDoc = await this.db.collection('listings').doc(listingId).get()
    
    if (!listingDoc.exists) {
      throw new ForeignKeyError('listingId', 'Listing', listingId)
    }

    const listing = listingDoc.data()
    if (listing?.sellerId !== userId) {
      throw new Error('User does not own this listing')
    }
  }

  /**
   * Validate offer ownership or listing ownership (for seller)
   */
  async validateOfferAccess(offerId: string, userId: string): Promise<void> {
    const offerDoc = await this.db.collection('offers').doc(offerId).get()
    
    if (!offerDoc.exists) {
      throw new ForeignKeyError('offerId', 'Offer', offerId)
    }

    const offer = offerDoc.data()
    if (offer?.buyerId !== userId && offer?.sellerId !== userId) {
      throw new Error('User does not have access to this offer')
    }
  }

  /**
   * Validate chat membership
   */
  async validateChatMembership(chatId: string, userId: string): Promise<void> {
    const chatDoc = await this.db.collection('chats').doc(chatId).get()
    
    if (!chatDoc.exists) {
      throw new ForeignKeyError('chatId', 'Chat', chatId)
    }

    const chat = chatDoc.data()
    const participantIds = chat?.participantIds as string[] || []
    
    if (!participantIds.includes(userId)) {
      throw new Error('User is not a member of this chat')
    }
  }

  /**
   * Validate that users exist (batch)
   */
  async validateUsersExist(userIds: string[], fieldName: string = 'userIds'): Promise<void> {
    if (userIds.length === 0) return

    // Firestore getAll supports up to 10 documents at once
    const chunks: string[][] = []
    for (let i = 0; i < userIds.length; i += 10) {
      chunks.push(userIds.slice(i, i + 10))
    }

    for (const chunk of chunks) {
      const refs = chunk.map((id) => this.db.collection('users').doc(id))
      const docs = await this.db.getAll(...refs)
      
      const missingIds = docs
        .filter((doc) => !doc.exists)
        .map((doc) => doc.id)

      if (missingIds.length > 0) {
        throw new ForeignKeyError(fieldName, 'User', missingIds.join(', '))
      }
    }
  }

  /**
   * Comprehensive validation for creating a listing
   */
  async validateListingCreation(data: {
    sellerId: string
    categoryId: string
    communityId?: string
  }): Promise<void> {
    const validations = [
      this.validateUserExists(data.sellerId, 'sellerId'),
      this.validateCategoryExists(data.categoryId, 'categoryId'),
    ]

    if (data.communityId) {
      validations.push(this.validateCommunityExists(data.communityId, 'communityId'))
    }

    await Promise.all(validations)
  }

  /**
   * Comprehensive validation for creating an offer
   */
  async validateOfferCreation(data: {
    buyerId: string
    sellerId: string
    listingId: string
  }): Promise<void> {
    await Promise.all([
      this.validateUserExists(data.buyerId, 'buyerId'),
      this.validateUserExists(data.sellerId, 'sellerId'),
      this.validateListingExists(data.listingId, 'listingId', true), // Require active
    ])
  }

  /**
   * Comprehensive validation for creating a buy request
   */
  async validateBuyRequestCreation(data: {
    userId: string
    categoryId: string
  }): Promise<void> {
    await Promise.all([
      this.validateUserExists(data.userId, 'userId'),
      this.validateCategoryExists(data.categoryId, 'categoryId'),
    ])
  }

  /**
   * Comprehensive validation for creating a review
   */
  async validateReviewCreation(data: {
    userId: string
    sellerId: string
    listingId: string
  }): Promise<void> {
    await Promise.all([
      this.validateUserExists(data.userId, 'userId'),
      this.validateUserExists(data.sellerId, 'sellerId'),
      this.validateListingExists(data.listingId, 'listingId'),
    ])

    // Ensure user is not reviewing themselves
    if (data.userId === data.sellerId) {
      throw new Error('Users cannot review themselves')
    }
  }

  /**
   * Comprehensive validation for creating a chat
   */
  async validateChatCreation(data: {
    participantIds: string[]
  }): Promise<void> {
    if (data.participantIds.length < 2) {
      throw new Error('Chat must have at least 2 participants')
    }

    // Check for duplicates
    const uniqueIds = new Set(data.participantIds)
    if (uniqueIds.size !== data.participantIds.length) {
      throw new Error('Duplicate participant IDs found')
    }

    await this.validateUsersExist(data.participantIds, 'participantIds')
  }

  /**
   * Comprehensive validation for creating a message
   */
  async validateMessageCreation(data: {
    senderId: string
    chatId: string
  }): Promise<void> {
    await Promise.all([
      this.validateUserExists(data.senderId, 'senderId'),
      this.validateChatMembership(data.chatId, data.senderId),
    ])
  }
}

export const foreignKeyService = new ForeignKeyService()
