import { ApiService } from './api.service'
import {
  ApiResponse,
  BuyRequest,
  CreateBuyRequestInput,
  BuyRequestFilters,
  PaginatedResponse,
} from '@/shared/types'

export class BuyRequestService {
  static async getBuyRequests(
    filters?: BuyRequestFilters
  ): Promise<ApiResponse<PaginatedResponse<BuyRequest>>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }

    return ApiService.get(`/buy-request?${params.toString()}`)
  }

  static async createBuyRequest(
    data: CreateBuyRequestInput
  ): Promise<ApiResponse<BuyRequest>> {
    return ApiService.post('/buy-request', data)
  }

  static async updateBuyRequest(
    id: string,
    data: Partial<CreateBuyRequestInput>
  ): Promise<ApiResponse<BuyRequest>> {
    return ApiService.patch(`/buy-request/${id}`, data)
  }

  static async deleteBuyRequest(id: string): Promise<ApiResponse> {
    return ApiService.delete(`/buy-request/${id}`)
  }
}
