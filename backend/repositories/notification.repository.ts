import { adminDb, getAdminMessaging } from '@/backend/lib/firebase-admin/config'
import { Notification, NotificationType } from '@/shared/types'
import { serializeSnapshots } from '@/backend/utils/serialize'

const NOTIFICATIONS_COLLECTION = 'notifications'
const FCM_TOKENS_COLLECTION = 'fcmTokens'

export class NotificationRepository {
  private db = adminDb

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    referenceId?: string,
    imageUrl?: string
  ): Promise<Notification> {
    const notificationRef = this.db.collection(NOTIFICATIONS_COLLECTION).doc()

    const notification: Notification = {
      id: notificationRef.id,
      userId,
      title,
      message,
      type,
      referenceId,
      imageUrl,
      read: false,
      createdAt: new Date(),
    }

    await notificationRef.set(notification)

    // Send push notification
    await this.sendPushNotification(userId, title, message, referenceId)

    return notification
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    const snapshot = await this.db
      .collection(NOTIFICATIONS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    return serializeSnapshots<Notification>(snapshot.docs)
  }

  async markAsRead(id: string): Promise<void> {
    await this.db.collection(NOTIFICATIONS_COLLECTION).doc(id).update({
      read: true,
    })
  }

  async markAllAsRead(userId: string): Promise<void> {
    const snapshot = await this.db
      .collection(NOTIFICATIONS_COLLECTION)
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get()

    const batch = this.db.batch()
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true })
    })

    await batch.commit()
  }

  async getUnreadCount(userId: string): Promise<number> {
    const snapshot = await this.db
      .collection(NOTIFICATIONS_COLLECTION)
      .where('userId', '==', userId)
      .where('read', '==', false)
      .count()
      .get()

    return snapshot.data().count
  }

  async saveFCMToken(userId: string, token: string): Promise<void> {
    await this.db.collection(FCM_TOKENS_COLLECTION).doc(userId).set({
      token,
      updatedAt: new Date(),
    })
  }

  async getFCMToken(userId: string): Promise<string | null> {
    const doc = await this.db.collection(FCM_TOKENS_COLLECTION).doc(userId).get()

    if (!doc.exists) return null

    return doc.data()?.token || null
  }

  private async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    referenceId?: string
  ): Promise<void> {
    try {
      const messaging = getAdminMessaging()
      if (!messaging) return   // FCM not configured — skip silently

      const token = await this.getFCMToken(userId)
      if (!token) return

      await messaging.send({
        token,
        notification: { title, body },
        data: {
          referenceId: referenceId || '',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      })
    } catch (error) {
      console.error('Failed to send push notification:', error)
    }
  }
}

export const notificationRepository = new NotificationRepository()
