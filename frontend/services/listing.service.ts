import { ApiService } from './api.service'
import {
  ApiResponse,
  Listing,
  CreateListingInput,
  UpdateListingInput,
  ListingFilters,
  PaginatedResponse,
} from '@/shared/types'

export class ListingService {
  static async getListings(
    filters?: ListingFilters
  ): Promise<ApiResponse<PaginatedResponse<Listing>>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }

    return ApiService.get(`/listings?${params.toString()}`)
  }

  static async getListingById(id: string): Promise<ApiResponse<Listing>> {
    return ApiService.get(`/listings/${id}`)
  }

  static async createListing(data: CreateListingInput): Promise<ApiResponse<Listing>> {
    return ApiService.post('/listings', data)
  }

  static async updateListing(
    id: string,
    data: UpdateListingInput
  ): Promise<ApiResponse<Listing>> {
    return ApiService.patch(`/listings/${id}`, data)
  }

  static async deleteListing(id: string): Promise<ApiResponse> {
    return ApiService.delete(`/listings/${id}`)
  }

  static async getMyListings(): Promise<ApiResponse<Listing[]>> {
    return ApiService.get('/listings/my')
  }

  static async searchListings(query: string): Promise<ApiResponse<Listing[]>> {
    return ApiService.get(`/search?q=${encodeURIComponent(query)}`)
  }
}
