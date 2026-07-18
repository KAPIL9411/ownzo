import { ApiService } from './api.service'
import { ApiResponse, User, Community, CommunityJoinRequest, AdminStats, CommunityType } from '@/shared/types'

export class AdminService {
  // ── Stats ────────────────────────────────────────────────
  static async getStats(): Promise<ApiResponse<AdminStats>> {
    return ApiService.get('/admin/stats')
  }

  // ── Users ────────────────────────────────────────────────
  static async getUsers(limit = 100): Promise<ApiResponse<User[]>> {
    return ApiService.get(`/admin/users?limit=${limit}`)
  }

  static async userAction(
    userId: string,
    action: 'ban' | 'unban' | 'verify' | 'unverify' | 'set-role' | 'recalculate-trust',
    payload?: Record<string, any>
  ): Promise<ApiResponse<User>> {
    return ApiService.patch(`/admin/users/${userId}`, { action, ...payload })
  }

  // ── Communities ──────────────────────────────────────────
  static async getCommunities(): Promise<ApiResponse<Community[]>> {
    return ApiService.get('/admin/communities')
  }

  static async createCommunity(data: {
    name: string
    type: CommunityType
    city: string
    college?: string
    description?: string
    requiresApproval?: boolean
    verified?: boolean
  }): Promise<ApiResponse<Community>> {
    return ApiService.post('/admin/communities', data)
  }

  static async updateCommunity(id: string, data: Partial<Community>): Promise<ApiResponse<Community>> {
    return ApiService.patch(`/admin/communities/${id}`, data)
  }

  static async communityAction(
    id: string,
    action: 'verify' | 'unverify',
  ): Promise<ApiResponse<Community>> {
    return ApiService.patch(`/admin/communities/${id}`, { action })
  }

  static async deleteCommunity(id: string): Promise<ApiResponse> {
    return ApiService.delete(`/admin/communities/${id}`)
  }

  // ── Join requests ────────────────────────────────────────
  static async getJoinRequests(communityId?: string): Promise<ApiResponse<CommunityJoinRequest[]>> {
    const qs = communityId ? `?communityId=${communityId}` : ''
    return ApiService.get(`/admin/join-requests${qs}`)
  }

  static async reviewJoinRequest(
    requestId: string,
    action: 'approve' | 'reject'
  ): Promise<ApiResponse> {
    return ApiService.patch(`/admin/join-requests/${requestId}`, { action })
  }
}
