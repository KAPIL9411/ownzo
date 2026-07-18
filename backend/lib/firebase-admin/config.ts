import * as admin from 'firebase-admin'

// Singleton pattern for Firebase Admin
let app: admin.app.App

if (!admin.apps.length) {
  // Handle private key formatting for different environments
  let privateKey = process.env.FIREBASE_PRIVATE_KEY
  
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set')
  }
  
  // Handle different private key formats
  // 1. If it's a JSON string, parse it
  if (privateKey && privateKey.startsWith('{')) {
    try {
      const parsed = JSON.parse(privateKey)
      privateKey = parsed.privateKey || parsed.private_key || privateKey
    } catch (e) {
      // Not valid JSON, continue with original value
    }
  }
  
  // 2. Replace escaped newlines with actual newlines
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n')
  }
  
  // 3. If it doesn't start with BEGIN, it might be base64 encoded
  if (privateKey && !privateKey.includes('BEGIN PRIVATE KEY')) {
    try {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf-8')
    } catch (e) {
      // Not base64, use as-is
    }
  }
  
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
    console.log('✅ Firebase Admin initialized successfully')
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error)
    console.error('Private key format:', privateKey.substring(0, 50) + '...')
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
