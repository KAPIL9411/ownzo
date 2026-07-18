import { adminDb } from '@/backend/lib/firebase-admin/config'
import { Offer, OfferStatus } from '@/shared/types'
import { serializeDocument, serializeSnapshots } from '@/backend/utils/serialize'

const OFFERS_COLLECTION = 'offers'

export class OfferRepository {
  private db = adminDb

  async createOffer(
    listingId: string,
    buyerId: string,
    sellerId: string,
    offerPrice: number,
    message?: string
  ): Promise<Offer> {
    const offerRef = this.db.collection(OFFERS_COLLECTION).doc()

    const offer: Offer = {
      id: offerRef.id,
      listingId,
      buyerId,
      sellerId,
      offerPrice,
      status: 'pending',
      message,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await offerRef.set(offer)
    return offer
  }

  async getOfferById(id: string): Promise<Offer | null> {
    const doc = await this.db.collection(OFFERS_COLLECTION).doc(id).get()

    if (!doc.exists) return null

    return serializeDocument<Offer>({ id: doc.id, ...doc.data() })
  }

  async getListingOffers(listingId: string): Promise<Offer[]> {
    const snapshot = await this.db
      .collection(OFFERS_COLLECTION)
      .where('listingId', '==', listingId)
      .orderBy('createdAt', 'desc')
      .get()

    return serializeSnapshots<Offer>(snapshot.docs)
  }

  async getUserOffers(userId: string, type: 'buyer' | 'seller'): Promise<Offer[]> {
    const field = type === 'buyer' ? 'buyerId' : 'sellerId'
    
    const snapshot = await this.db
      .collection(OFFERS_COLLECTION)
      .where(field, '==', userId)
      .orderBy('createdAt', 'desc')
      .get()

    return serializeSnapshots<Offer>(snapshot.docs)
  }

  async updateOfferStatus(
    id: string,
    status: OfferStatus
  ): Promise<Offer> {
    // Use transaction to prevent race conditions when accepting/rejecting offers
    return await this.db.runTransaction(async (transaction) => {
      const offerRef = this.db.collection(OFFERS_COLLECTION).doc(id)
      const offerDoc = await transaction.get(offerRef)

      if (!offerDoc.exists) {
        throw new Error('Offer not found')
      }

      const currentOffer = offerDoc.data() as Offer

      // Prevent updating already finalized offers
      if (currentOffer.status === 'accepted') {
        throw new Error('Cannot update an already accepted offer')
      }

      // When accepting an offer, reject all other pending offers for the same listing
      if (status === 'accepted') {
        const listingOffersSnapshot = await transaction.get(
          this.db
            .collection(OFFERS_COLLECTION)
            .where('listingId', '==', currentOffer.listingId)
            .where('status', '==', 'pending')
        )

        // Reject all other pending offers
        listingOffersSnapshot.docs.forEach((doc) => {
          if (doc.id !== id) {
            transaction.update(doc.ref, {
              status: 'rejected',
              updatedAt: new Date(),
            })
          }
        })

        // Update listing status to sold
        const listingRef = this.db.collection('listings').doc(currentOffer.listingId)
        transaction.update(listingRef, {
          status: 'sold',
          updatedAt: new Date(),
        })
      }

      // Update the current offer
      transaction.update(offerRef, {
        status,
        updatedAt: new Date(),
      })

      return {
        ...currentOffer,
        id,
        status,
        updatedAt: new Date(),
      }
    })
  }

  async deleteOffer(id: string): Promise<void> {
    await this.db.collection(OFFERS_COLLECTION).doc(id).delete()
  }
}

export const offerRepository = new OfferRepository()
