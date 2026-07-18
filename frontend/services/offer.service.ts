import { ApiService } from './api.service'
import { ApiResponse, Offer, CreateOfferInput, OfferStatus } from '@/shared/types'

export class OfferService {
  static async getOffers(type: 'buyer' | 'seller' = 'buyer'): Promise<ApiResponse<Offer[]>> {
    return ApiService.get(`/offers?type=${type}`)
  }

  static async createOffer(data: CreateOfferInput): Promise<ApiResponse<Offer>> {
    return ApiService.post('/offers', data)
  }

  static async updateOfferStatus(
    id: string,
    status: OfferStatus
  ): Promise<ApiResponse<Offer>> {
    return ApiService.patch(`/offers/${id}`, { status })
  }
}
