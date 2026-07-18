import { ApiService } from './api.service'
import { ApiResponse, Category } from '@/shared/types'

export class CategoryService {
  static async getCategories(): Promise<ApiResponse<Category[]>> {
    return ApiService.get('/categories')
  }
}
