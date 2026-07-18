import { ApiService } from './api.service'
import { ApiResponse, Chat, Message } from '@/shared/types'

export class ChatService {
  static async getChats(): Promise<ApiResponse<Chat[]>> {
    return ApiService.get('/chat')
  }

  static async createChat(listingId: string): Promise<ApiResponse<Chat>> {
    return ApiService.post('/chat', { listingId })
  }

  static async getMessages(chatId: string): Promise<ApiResponse<Message[]>> {
    return ApiService.get(`/messages?chatId=${chatId}`)
  }

  static async sendMessage(
    chatId: string,
    message: string,
    type: 'text' | 'image' | 'offer' = 'text',
    imageUrl?: string
  ): Promise<ApiResponse<Message>> {
    return ApiService.post('/messages', { chatId, message, type, imageUrl })
  }
}
