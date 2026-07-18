import { ApiService } from './api.service'
import { ApiResponse, Review, CreateReviewInput } from '@/shared/types'

export class ReviewService {
  static async getSellerReviews(
    sellerId: string
  ): Promise<ApiResponse<{ reviews: Review[]; averageRating: number }>> {
    return ApiService.get(`/reviews?sellerId=${sellerId}`)
  }

  static async createReview(data: CreateReviewInput): Promise<ApiResponse<Review>> {
    return ApiService.post('/reviews', data)
  }
}
