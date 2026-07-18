import { ApiService } from './api.service'
import { ApiResponse, LoginResponse, User, UpdateProfileInput } from '@/shared/types'

export class AuthService {
  static async login(idToken: string): Promise<ApiResponse<LoginResponse>> {
    return ApiService.post('/auth/login', { idToken })
  }

  static async logout(): Promise<ApiResponse> {
    return ApiService.post('/auth/logout')
  }

  static async getProfile(): Promise<ApiResponse<User>> {
    return ApiService.get('/auth/profile')
  }

  static async updateProfile(data: UpdateProfileInput): Promise<ApiResponse<User>> {
    return ApiService.patch('/users/profile', data)
  }
}
