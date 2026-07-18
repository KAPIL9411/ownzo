import * as admin from 'firebase-admin'

// Singleton pattern for Firebase Admin
let app: admin.app.App

if (!admin.apps.length) {
  // Handle private key formatting for different environments
  let privateKey = process.env.FIREBASE_PRIVATE_KEY
  
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set')
  }
  
  // Replace escaped newlines with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n')
  
  // Validate required environment variables
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is not set')
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('FIREBASE_CLIENT_EMAIL environment variable is not set')
  }
  
  try {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    })
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
    throw error
  }
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
