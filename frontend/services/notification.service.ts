import { ApiService } from './api.service'
import { ApiResponse, Notification } from '@/shared/types'

export class NotificationService {
  static async getNotifications(): Promise<
    ApiResponse<{ notifications: Notification[]; unreadCount: number }>
  > {
    return ApiService.get('/notifications')
  }

  static async markAsRead(notificationId: string): Promise<ApiResponse> {
    return ApiService.patch('/notifications', { notificationId })
  }

  static async markAllAsRead(): Promise<ApiResponse> {
    return ApiService.patch('/notifications', { markAllAsRead: true })
  }
}
