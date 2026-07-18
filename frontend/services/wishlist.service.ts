import { ApiService } from './api.service'
import { ApiResponse, Wishlist } from '@/shared/types'

export class WishlistService {
  static async getWishlist(): Promise<ApiResponse<Wishlist[]>> {
    return ApiService.get('/wishlist')
  }

  static async addToWishlist(listingId: string): Promise<ApiResponse<Wishlist>> {
    return ApiService.post('/wishlist', { listingId })
  }

  static async removeFromWishlist(listingId: string): Promise<ApiResponse> {
    return ApiService.delete(`/wishlist?listingId=${listingId}`)
  }
}
