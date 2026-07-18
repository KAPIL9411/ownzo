import * as admin from 'firebase-admin'

// Singleton pattern for Firebase Admin
let app: admin.app.App

if (!admin.apps.length) {
  // Validate required environment variables first
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is not set')
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('FIREBASE_CLIENT_EMAIL environment variable is not set')
  }
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set')
  }

  // Handle private key formatting for different environments
  let privateKey: string = process.env.FIREBASE_PRIVATE_KEY
  
  // Track which format was detected (for safe logging)
  let keyFormat: 'json' | 'escaped' | 'base64' | 'raw' = 'raw'
  
  // Handle different private key formats
  // 1. If it's a JSON string, parse it
  if (privateKey.startsWith('{')) {
    try {
      const parsed = JSON.parse(privateKey)
      privateKey = parsed.privateKey || parsed.private_key || privateKey
      keyFormat = 'json'
    } catch (e) {
      // Not valid JSON, continue with original value
    }
  }
  
  // 2. Replace escaped newlines with actual newlines
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n')
    keyFormat = 'escaped'
  }
  
  // 3. If it doesn't start with BEGIN, it might be base64 encoded
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    try {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf-8')
      keyFormat = 'base64'
    } catch (e) {
      // Not base64, use as-is
    }
  }
  
  // 🔒 SECURITY FIX: Validate key format without exposing content
  const isValidKeyFormat = privateKey.includes('BEGIN PRIVATE KEY') && 
                           privateKey.includes('END PRIVATE KEY')
  
  if (!isValidKeyFormat) {
    console.error('❌ Firebase Admin initialization error: Invalid private key format')
    console.error('Expected PEM format with BEGIN/END markers')
    console.error(`Detected format: ${keyFormat}`)
    console.error(`Key length: ${privateKey.length} characters`)
    // 🔒 SECURITY: Never log actual key content
    throw new Error('Invalid Firebase private key format. Expected PEM format.')
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
    console.log(`   Project ID: ${process.env.FIREBASE_PROJECT_ID}`)
    console.log(`   Key format: ${keyFormat}`)
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', (error as Error).message)
    console.error(`   Project ID: ${process.env.FIREBASE_PROJECT_ID}`)
    console.error(`   Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`)
    console.error(`   Key format detected: ${keyFormat}`)
    console.error(`   Key length: ${privateKey.length} characters`)
    // 🔒 SECURITY: Never log private key content, even on error
    throw new Error('Failed to initialize Firebase Admin. Check environment variables.')
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
