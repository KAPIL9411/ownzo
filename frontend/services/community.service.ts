import { ApiService } from './api.service'
import { ApiResponse, Community, CommunityType } from '@/shared/types'

export class CommunityService {
  static async getCommunities(city?: string, type?: CommunityType): Promise<ApiResponse<Community[]>> {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (type) params.set('type', type)
    const qs = params.toString()
    return ApiService.get(`/community${qs ? `?${qs}` : ''}`)
  }

  static async getCommunityById(id: string): Promise<ApiResponse<Community>> {
    return ApiService.get(`/community/${id}`)
  }

  static async joinCommunity(communityId: string): Promise<ApiResponse<{ communityId: string; action: string }>> {
    return ApiService.post('/community', { communityId, action: 'join' })
  }

  static async leaveCommunity(communityId: string): Promise<ApiResponse<{ communityId: string; action: string }>> {
    return ApiService.post('/community', { communityId, action: 'leave' })
  }
}
