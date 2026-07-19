import { adminDb } from '@/backend/lib/firebase-admin/config'
import { Chat, Message } from '@/shared/types'
import { serializeDocument, serializeSnapshots } from '@/backend/utils/serialize'

const CHATS_COLLECTION = 'chats'
const MESSAGES_COLLECTION = 'messages'

export class ChatRepository {
  private db = adminDb

  async createChat(
    listingId: string,
    buyerId: string,
    sellerId: string
  ): Promise<Chat> {
    // Check if chat already exists
    const existingChat = await this.getChatByParticipants(
      listingId,
      buyerId,
      sellerId
    )
    if (existingChat) return existingChat

    const chatRef = this.db.collection(CHATS_COLLECTION).doc()

    const chat: Partial<Chat> = {
      id: chatRef.id,
      listingId,
      buyerId,
      sellerId,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Remove undefined values
    const cleanChat = Object.fromEntries(
      Object.entries(chat).filter(([_, v]) => v !== undefined)
    )

    await chatRef.set(cleanChat)
    return chat as Chat
  }

  async getChatById(id: string): Promise<Chat | null> {
    const doc = await this.db.collection(CHATS_COLLECTION).doc(id).get()

    if (!doc.exists) return null

    return serializeDocument<Chat>({ id: doc.id, ...doc.data() })
  }

  async getChatByParticipants(
    listingId: string,
    buyerId: string,
    sellerId: string
  ): Promise<Chat | null> {
    const snapshot = await this.db
      .collection(CHATS_COLLECTION)
      .where('listingId', '==', listingId)
      .where('buyerId', '==', buyerId)
      .where('sellerId', '==', sellerId)
      .limit(1)
      .get()

    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return serializeDocument<Chat>({ id: doc.id, ...doc.data() })
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    // Get chats where user is either buyer or seller
    const buyerSnapshot = await this.db
      .collection(CHATS_COLLECTION)
      .where('buyerId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get()

    const sellerSnapshot = await this.db
      .collection(CHATS_COLLECTION)
      .where('sellerId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get()

    const chats = new Map<string, Chat>()

    serializeSnapshots<Chat>(buyerSnapshot.docs).forEach((chat) => {
      chats.set(chat.id, chat)
    })

    serializeSnapshots<Chat>(sellerSnapshot.docs).forEach((chat) => {
      if (!chats.has(chat.id)) {
        chats.set(chat.id, chat)
      }
    })

    return Array.from(chats.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    message: string,
    type: 'text' | 'image' | 'offer' = 'text',
    imageUrl?: string
  ): Promise<Message> {
    const messageRef = this.db.collection(MESSAGES_COLLECTION).doc()

    // Build message data, excluding undefined values
    const messageData: Message = {
      id: messageRef.id,
      chatId,
      senderId,
      message,
      type,
      read: false,
      createdAt: new Date(),
      ...(imageUrl && { imageUrl }), // Only include if defined
    } as Message

    await messageRef.set(messageData)

    // Update chat with last message
    await this.db.collection(CHATS_COLLECTION).doc(chatId).update({
      lastMessage: message,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })

    return messageData
  }

  async getChatMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    const snapshot = await this.db
      .collection(MESSAGES_COLLECTION)
      .where('chatId', '==', chatId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    return serializeSnapshots<Message>(snapshot.docs).reverse()
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const snapshot = await this.db
      .collection(MESSAGES_COLLECTION)
      .where('chatId', '==', chatId)
      .where('senderId', '!=', userId)
      .where('read', '==', false)
      .get()

    const batch = this.db.batch()
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true })
    })

    await batch.commit()
  }
}

export const chatRepository = new ChatRepository()
