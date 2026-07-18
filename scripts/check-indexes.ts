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

async function checkIndexes() {
  console.log('🔍 Checking if Firestore indexes are ready...\n')

  try {
    // Try the same query that the home page uses
    console.log('Testing: GET /api/listings (status=active, orderBy createdAt desc)')
    const snapshot = await db
      .collection('listings')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()

    if (snapshot.empty) {
      console.log('✅ Index is ready! (No listings found, but query worked)')
      console.log('   Create a listing to see it on the home page.')
    } else {
      console.log(`✅ Index is ready! Found ${snapshot.size} listing(s)`)
    }

    console.log('\n✨ All systems operational! Your app should work now.')
    console.log('   Refresh your browser at http://localhost:3000')
    
  } catch (error: any) {
    if (error.code === 9 || error.message?.includes('index')) {
      console.log('❌ Indexes are still building')
      console.log('   Firebase Error:', error.message?.split('\n')[0])
      console.log('\n⏳ Please wait 1-2 more minutes and run this check again:')
      console.log('   npx tsx scripts/check-indexes.ts')
      console.log('\n   Or check status at:')
      console.log('   https://console.firebase.google.com/project/ownzo-68cc6/firestore/indexes')
      process.exit(1)
    } else {
      console.log('❌ Unexpected error:', error)
      process.exit(1)
    }
  }
}

checkIndexes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
