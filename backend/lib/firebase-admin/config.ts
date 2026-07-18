import * as admin from 'firebase-admin'

// Singleton pattern for Firebase Admin
let app: admin.app.App

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  })
} else {
  app = admin.apps[0] as admin.app.App
}

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()

// Messaging is optional — only available if FCM is enabled for the project
let _adminMessaging: admin.messaging.Messaging | null = null
export function getAdminMessaging(): admin.messaging.Messaging | null {
  if (_adminMessaging) return _adminMessaging
  try {
    _adminMessaging = admin.messaging()
    return _adminMessaging
  } catch {
    return null
  }
}

export default app
