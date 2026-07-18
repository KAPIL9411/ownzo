import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local
const envPath = join(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach((line) => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      envVars[key.trim()] = value
    }
  }
})

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: envVars.FIREBASE_PROJECT_ID,
      clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
      privateKey: envVars.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

let checkCount = 0
const maxChecks = 20 // Check for max 10 minutes (20 * 30 seconds)

async function checkIndexes(): Promise<boolean> {
  try {
    const snapshot = await db
      .collection('listings')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()

    return true // Success!
  } catch (error: any) {
    if (error.code === 9 || error.message?.includes('index')) {
      return false // Still building
    }
    throw error // Unexpected error
  }
}

async function watch() {
  console.log('🔍 Monitoring Firestore index build status...')
  console.log('   This will check every 30 seconds until ready (max 10 minutes)')
  console.log('   Press Ctrl+C to stop\n')

  const interval = setInterval(async () => {
    checkCount++
    process.stdout.write(`\r⏳ Check ${checkCount}/${maxChecks} - Waiting for index...`)

    try {
      const ready = await checkIndexes()
      
      if (ready) {
        clearInterval(interval)
        console.log('\n\n✅ SUCCESS! Firestore indexes are ready!')
        console.log('\n🎉 Your app is fully operational now!')
        console.log('   Refresh your browser at http://localhost:3000\n')
        process.exit(0)
      }

      if (checkCount >= maxChecks) {
        clearInterval(interval)
        console.log('\n\n⏱️  Timeout reached (10 minutes)')
        console.log('   Indexes are taking longer than expected.')
        console.log('   Check Firebase Console: https://console.firebase.google.com/project/ownzo-68cc6/firestore/indexes\n')
        process.exit(1)
      }
    } catch (error) {
      clearInterval(interval)
      console.log('\n\n❌ Unexpected error:', error)
      process.exit(1)
    }
  }, 30000) // Check every 30 seconds

  // Do first check immediately
  try {
    const ready = await checkIndexes()
    if (ready) {
      clearInterval(interval)
      console.log('✅ SUCCESS! Firestore indexes are ready!')
      console.log('\n🎉 Your app is fully operational now!')
      console.log('   Refresh your browser at http://localhost:3000\n')
      process.exit(0)
    }
  } catch (error) {
    clearInterval(interval)
    console.log('\n❌ Unexpected error:', error)
    process.exit(1)
  }
}

watch().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
