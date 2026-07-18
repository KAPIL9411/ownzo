import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getMessaging, Messaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let messaging: Messaging | null = null

if (typeof window !== 'undefined') {
  app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db   = getFirestore(app)
}

/**
 * Lazily initialise FCM only when the browser supports it.
 * Returns null on SSR or unsupported browsers.
 */
export async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null
  if (messaging) return messaging
  try {
    const supported = await isSupported()
    if (!supported) return null
    if (!app!) app = getApps()[0] ?? initializeApp(firebaseConfig)
    messaging = getMessaging(app)
    return messaging
  } catch {
    return null
  }
}

export { auth, db, messaging }
