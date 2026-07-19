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
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      price: data.price,
      negotiable: data.negotiable,
      condition: data.condition,
      city: data.city,
      ...(data.locality && { locality: data.locality }),
      ...(data.communityId && { communityId: data.communityId }),
      images: data.images,
      ...(data.video && { video: data.video }),
      ...(data.categorySpecificData && { categorySpecificData: data.categorySpecificData }),
      status: data.status ?? 'active',
      verificationStatus: data.verificationStatus ?? 'unverified',
      ...(data.trustScore !== undefined && { trustScore: data.trustScore }),
      ...(data.riskScore !== undefined && { riskScore: data.riskScore }),
      views: 0,
      wishlistCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: getListingExpiryDays(new Date()),
    }

    await listingRef.set(listing)
    await userRepository.incrementListingCount(sellerId, 1)
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
    let filteredListings: Listing[] = []
    let hasMore = false
    let currentCursorDoc: any = null
    let lastFetchedDoc: any = null
    
    if (filters.cursor) {
      // Decode cursor (base64 encoded document ID)
      try {
        const cursorData = JSON.parse(Buffer.from(filters.cursor, 'base64').toString('utf-8'))
        currentCursorDoc = await this.db.collection(LISTINGS_COLLECTION).doc(cursorData.id).get()
      } catch (error) {
        console.error('Invalid cursor:', error)
      }
    }

    let maxBatches = 5
    while (filteredListings.length < limit && maxBatches > 0) {
      maxBatches--
      let batchQuery = query
      if (currentCursorDoc && currentCursorDoc.exists) {
        batchQuery = batchQuery.startAfter(currentCursorDoc)
      }

      // Fetch batch Limit + 1 to check hasMore
      const batchLimit = limit - filteredListings.length
      batchQuery = batchQuery.limit(batchLimit + 1)
      
      const snapshot = await batchQuery.get()
      const fetchedDocs = snapshot.docs
      
      hasMore = fetchedDocs.length > batchLimit
      const docsToProcess = hasMore ? fetchedDocs.slice(0, batchLimit) : fetchedDocs
      
      if (docsToProcess.length === 0) {
        break
      }
      
      currentCursorDoc = docsToProcess[docsToProcess.length - 1]
      lastFetchedDoc = currentCursorDoc
      
      const listings = serializeSnapshots<Listing>(docsToProcess)
      
      // Filter by price range in memory
      let batchFiltered = listings
      if (filters.minPrice !== undefined) {
        batchFiltered = batchFiltered.filter((l) => l.price >= filters.minPrice!)
      }
      if (filters.maxPrice !== undefined) {
        batchFiltered = batchFiltered.filter((l) => l.price <= filters.maxPrice!)
      }
      
      filteredListings.push(...batchFiltered)
      
      if (!hasMore) {
        break
      }
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
    if (hasMore && lastFetchedDoc) {
      nextCursor = Buffer.from(
        JSON.stringify({
          id: lastFetchedDoc.id,
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
    const listing = await this.getListingById(id)
    if (listing) {
      await this.db.collection(LISTINGS_COLLECTION).doc(id).update({
        status: 'deleted',
        updatedAt: new Date(),
      })
      await userRepository.incrementListingCount(listing.sellerId, -1)
    }
  }

  async incrementViews(id: string): Promise<void> {
    // 🔒 SECURITY FIX: Validate listing exists before incrementing views
    // Prevents view count manipulation on non-existent/deleted listings
    const listingRef = this.db.collection(LISTINGS_COLLECTION).doc(id)
    
    // Use transaction to check existence and increment atomically
    try {
      await this.db.runTransaction(async (transaction) => {
        const doc = await transaction.get(listingRef)
        
        // 🔒 CRITICAL: Check if listing exists and is active
        if (!doc.exists) {
          throw new Error('Listing not found')
        }

        const listing = doc.data() as Listing
        
        // 🔒 CRITICAL: Only increment views for active listings
        // Prevents view manipulation on deleted/expired listings
        if (listing.status !== 'active') {
          throw new Error(`Cannot increment views: listing is ${listing.status}`)
        }

        // Now safe to increment
        transaction.update(listingRef, {
          views: admin.firestore.FieldValue.increment(1),
        })
      })
    } catch (error) {
      // Silently fail for view count errors (non-critical)
      // Don't expose listing status to potential attackers
      console.warn(`[LISTING] Failed to increment views for ${id}:`, (error as Error).message)
    }
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

  async getListingsByStatus(status: string): Promise<Listing[]> {
    const snapshot = await this.db
      .collection(LISTINGS_COLLECTION)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    const listings = serializeSnapshots<Listing>(snapshot.docs)

    // Batch fetch seller info to prevent N+1 queries
    const sellerIds = listings.map((l) => l.sellerId)
    const sellersMap = await userRepository.getUsersByIds(sellerIds)

    // Enrich listings with seller info
    const enrichedListings = listings.map((listing) => ({
      ...listing,
      seller: sellersMap.get(listing.sellerId) ?? undefined,
    }))

    return enrichedListings
  }
}

export const listingRepository = new ListingRepository()
