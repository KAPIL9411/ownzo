import { adminDb } from '@/backend/lib/firebase-admin/config'
import { Review } from '@/shared/types'
import { serializeDocument, serializeSnapshots } from '@/backend/utils/serialize'

const REVIEWS_COLLECTION = 'reviews'

export class ReviewRepository {
  private db = adminDb

  async createReview(
    listingId: string,
    buyerId: string,
    sellerId: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    // Check if review already exists
    const existing = await this.getReviewByBuyerAndListing(buyerId, listingId)
    if (existing) {
      throw new Error('Review already exists for this listing')
    }

    const reviewRef = this.db.collection(REVIEWS_COLLECTION).doc()

    const review: Review = {
      id: reviewRef.id,
      listingId,
      buyerId,
      sellerId,
      rating,
      comment,
      createdAt: new Date(),
    }

    await reviewRef.set(review)
    return review
  }

  async getReviewById(id: string): Promise<Review | null> {
    const doc = await this.db.collection(REVIEWS_COLLECTION).doc(id).get()

    if (!doc.exists) return null

    return serializeDocument<Review>({ id: doc.id, ...doc.data() })
  }

  async getSellerReviews(sellerId: string): Promise<Review[]> {
    const snapshot = await this.db
      .collection(REVIEWS_COLLECTION)
      .where('sellerId', '==', sellerId)
      .orderBy('createdAt', 'desc')
      .get()

    return serializeSnapshots<Review>(snapshot.docs)
  }

  async getListingReviews(listingId: string): Promise<Review[]> {
    const snapshot = await this.db
      .collection(REVIEWS_COLLECTION)
      .where('listingId', '==', listingId)
      .get()

    return serializeSnapshots<Review>(snapshot.docs)
  }

  async getReviewByBuyerAndListing(
    buyerId: string,
    listingId: string
  ): Promise<Review | null> {
    const snapshot = await this.db
      .collection(REVIEWS_COLLECTION)
      .where('buyerId', '==', buyerId)
      .where('listingId', '==', listingId)
      .limit(1)
      .get()

    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return serializeDocument<Review>({ id: doc.id, ...doc.data() })
  }

  async getAverageRating(sellerId: string): Promise<number> {
    const reviews = await this.getSellerReviews(sellerId)
    
    if (reviews.length === 0) return 0

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }
}

export const reviewRepository = new ReviewRepository()
