import { adminDb } from '@/backend/lib/firebase-admin/config'
import * as admin from 'firebase-admin'
import {
  Listing,
  CreateListingInput,
  UpdateListingInput,
  ListingFilters,
  PaginatedResponse,
} from '@/shared/types'
import { getListingExpiryDays } from '@/shared/utils/listing'
import { userRepository } from './user.repository'
import { serializeDocument, serializeSnapshots } from '@/backend/utils/serialize'

const LISTINGS_COLLECTION = 'listings'

export class ListingRepository {
  private db = adminDb

  async createListing(
    sellerId: string,
    data: CreateListingInput
  ): Promise<Listing> {
    const listingRef = this.db.collection(LISTINGS_COLLECTION).doc()

    const listing: Listing = {
      id: listingRef.id,
      sellerId,
      ...data,
      status: 'active',
      views: 0,
      wishlistCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: getListingExpiryDays(new Date()),
    }

    await listingRef.set(listing)
    return listing
  }

  async getListingById(id: string): Promise<Listing | null> {
    const doc = await this.db.collection(LISTINGS_COLLECTION).doc(id).get()

    if (!doc.exists) return null

    return serializeDocument<Listing>({ id: doc.id, ...doc.data() })
  }

  async getListings(
    filters: ListingFilters
  ): Promise<PaginatedResponse<Listing>> {
    let query: any = this.db.collection(LISTINGS_COLLECTION)

    // Apply filters
    query = query.where('status', '==', 'active')

    if (filters.categoryId) {
      query = query.where('categoryId', '==', filters.categoryId)
    }

    if (filters.city) {
      query = query.where('city', '==', filters.city)
    }

    if (filters.communityId) {
      query = query.where('communityId', '==', filters.communityId)
    }

    if (filters.condition) {
      query = query.where('condition', '==', filters.condition)
    }

    // Note: Firestore doesn't support >= and <= on same field + other filters
    // For price range, we'll filter in memory after fetching
    // In production, use Algolia or similar for complex queries

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        query = query.orderBy('price', 'asc')
        break
      case 'price-high':
        query = query.orderBy('price', 'desc')
        break
      case 'popular':
        query = query.orderBy('views', 'desc')
        break
      default:
        query = query.orderBy('createdAt', 'desc')
    }

    // Cursor-based pagination (better for large datasets)
    const limit = filters.limit || 20
    
    if (filters.cursor) {
      // Decode cursor (base64 encoded document ID + timestamp)
      try {
        const cursorData = JSON.parse(
          Buffer.from(filters.cursor, 'base64').toString('utf-8')
        )
        const cursorDoc = await this.db
          .collection(LISTINGS_COLLECTION)
          .doc(cursorData.id)
          .get()
        
        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc)
        }
      } catch (error) {
        console.error('Invalid cursor:', error)
        // Continue without cursor if invalid
      }
    }

    query = query.limit(limit + 1) // Fetch one extra to check hasMore

    const snapshot = await query.get()
    const hasMore = snapshot.docs.length > limit
    
    // Remove the extra doc if exists
    const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs
    
    const listings = serializeSnapshots<Listing>(docs)

    // Filter by price range in memory
    let filteredListings = listings
    if (filters.minPrice !== undefined) {
      filteredListings = filteredListings.filter(
        (l) => l.price >= filters.minPrice!
      )
    }
    if (filters.maxPrice !== undefined) {
      filteredListings = filteredListings.filter(
        (l) => l.price <= filters.maxPrice!
      )
    }

    // Batch fetch seller info to prevent N+1 queries
    const sellerIds = filteredListings.map((l) => l.sellerId)
    const sellersMap = await userRepository.getUsersByIds(sellerIds)

    // Enrich listings with seller info
    const enrichedListings = filteredListings.map((listing) => ({
      ...listing,
      seller: sellersMap.get(listing.sellerId) ?? undefined,
    }))

    // Generate next cursor
    let nextCursor: string | undefined
    if (hasMore && enrichedListings.length > 0) {
      const lastListing = enrichedListings[enrichedListings.length - 1]
      nextCursor = Buffer.from(
        JSON.stringify({
          id: lastListing.id,
          createdAt: lastListing.createdAt,
        })
      ).toString('base64')
    }

    // Count total (approximate) - only if no cursor (first page)
    let total: number | undefined
    if (!filters.cursor) {
      const countQuery = this.db
        .collection(LISTINGS_COLLECTION)
        .where('status', '==', 'active')
      const countSnapshot = await countQuery.count().get()
      total = countSnapshot.data().count
    }

    return {
      data: enrichedListings,
      total: total ?? 0,
      page: filters.cursor ? 0 : (filters.page || 1),
      limit,
      hasMore,
      nextCursor,
    }
  }

  async updateListing(
    id: string,
    data: UpdateListingInput
  ): Promise<Listing> {
    const listingRef = this.db.collection(LISTINGS_COLLECTION).doc(id)

    await listingRef.update({
      ...data,
      updatedAt: new Date(),
    })

    const updated = await listingRef.get()
    return { id: updated.id, ...updated.data() } as Listing
  }

  async deleteListing(id: string): Promise<void> {
    await this.db.collection(LISTINGS_COLLECTION).doc(id).update({
      status: 'deleted',
      updatedAt: new Date(),
    })
  }

  async incrementViews(id: string): Promise<void> {
    const listingRef = this.db.collection(LISTINGS_COLLECTION).doc(id)
    await listingRef.update({
      views: admin.firestore.FieldValue.increment(1),
    })
  }

  async getUserListings(sellerId: string): Promise<Listing[]> {
    const snapshot = await this.db
      .collection(LISTINGS_COLLECTION)
      .where('sellerId', '==', sellerId)
      .where('status', 'in', ['active', 'sold'])
      .orderBy('createdAt', 'desc')
      .get()

    return serializeSnapshots<Listing>(snapshot.docs)
  }

  async searchListings(searchQuery: string): Promise<Listing[]> {
    const qLower = searchQuery.toLowerCase().trim()
    if (!qLower) return []

    // Fetch a broader set and filter in-memory (Firestore limitation without Algolia)
    const snapshot = await this.db
      .collection(LISTINGS_COLLECTION)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get()

    const all = serializeSnapshots<Listing>(snapshot.docs)

    // Score-based ranking: title match > category > description
    const scored = all
      .map(l => {
        const title = l.title.toLowerCase()
        const desc  = (l.description ?? '').toLowerCase()
        let score = 0
        if (title === qLower)            score += 100
        if (title.startsWith(qLower))    score += 50
        if (title.includes(qLower))      score += 30
        qLower.split(' ').forEach(word => {
          if (word.length < 2) return
          if (title.includes(word))      score += 10
          if (desc.includes(word))       score += 3
        })
        return { listing: l, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ listing }) => listing)
      .slice(0, 50)

    return scored
  }
}

export const listingRepository = new ListingRepository()
