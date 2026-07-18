import { adminDb } from '@/backend/lib/firebase-admin/config'
import { BuyRequest, CreateBuyRequestInput, BuyRequestFilters, PaginatedResponse } from '@/shared/types'
import { serializeDocument, serializeSnapshots } from '@/backend/utils/serialize'

const BUY_REQUESTS_COLLECTION = 'buyRequests'

export class BuyRequestRepository {
  private db = adminDb

  async createBuyRequest(
    userId: string,
    data: CreateBuyRequestInput
  ): Promise<BuyRequest> {
    const requestRef = this.db.collection(BUY_REQUESTS_COLLECTION).doc()

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiry

    const buyRequest: BuyRequest = {
      id: requestRef.id,
      userId,
      ...data,
      status: 'active',
      responseCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt,
    }

    await requestRef.set(buyRequest)
    return buyRequest
  }

  async getBuyRequestById(id: string): Promise<BuyRequest | null> {
    const doc = await this.db.collection(BUY_REQUESTS_COLLECTION).doc(id).get()

    if (!doc.exists) return null

    return serializeDocument<BuyRequest>({ id: doc.id, ...doc.data() })
  }

  async getBuyRequests(
    filters: BuyRequestFilters
  ): Promise<PaginatedResponse<BuyRequest>> {
    let query: any = this.db.collection(BUY_REQUESTS_COLLECTION)

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

    query = query.orderBy('createdAt', 'desc')

    const page = filters.page || 1
    const limit = filters.limit || 20
    const offset = (page - 1) * limit

    query = query.limit(limit).offset(offset)

    const snapshot = await query.get()
    const buyRequests = serializeSnapshots<BuyRequest>(snapshot.docs)

    let countQuery: any = this.db.collection(BUY_REQUESTS_COLLECTION).where('status', '==', 'active')
    if (filters.categoryId) {
      countQuery = countQuery.where('categoryId', '==', filters.categoryId)
    }
    if (filters.city) {
      countQuery = countQuery.where('city', '==', filters.city)
    }
    if (filters.communityId) {
      countQuery = countQuery.where('communityId', '==', filters.communityId)
    }
    const countSnapshot = await countQuery.count().get()
    const total = countSnapshot.data().count

    return {
      data: buyRequests,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    }
  }

  async getUserBuyRequests(userId: string): Promise<BuyRequest[]> {
    const snapshot = await this.db
      .collection(BUY_REQUESTS_COLLECTION)
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'fulfilled'])
      .orderBy('createdAt', 'desc')
      .get()

    return serializeSnapshots<BuyRequest>(snapshot.docs)
  }

  async updateBuyRequest(
    id: string,
    data: Partial<CreateBuyRequestInput> & { status?: string }
  ): Promise<BuyRequest> {
    const requestRef = this.db.collection(BUY_REQUESTS_COLLECTION).doc(id)

    await requestRef.update({
      ...data,
      updatedAt: new Date(),
    })

    const updated = await requestRef.get()
    return serializeDocument<BuyRequest>({ id: updated.id, ...updated.data() })
  }

  async deleteBuyRequest(id: string): Promise<void> {
    await this.db.collection(BUY_REQUESTS_COLLECTION).doc(id).update({
      status: 'deleted',
      updatedAt: new Date(),
    })
  }
}

export const buyRequestRepository = new BuyRequestRepository()
