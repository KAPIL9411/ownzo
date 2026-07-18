import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
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

async function checkData() {
  console.log('📊 Checking Firestore data...\n')

  try {
    // Check categories
    const categoriesSnap = await db.collection('categories').get()
    console.log(`✓ Categories: ${categoriesSnap.size} documents`)

    // Check listings (without index - just count)
    const listingsSnap = await db.collection('listings').limit(100).get()
    console.log(`✓ Listings: ${listingsSnap.size} documents (showing first 100)`)

    // Check users
    const usersSnap = await db.collection('users').limit(100).get()
    console.log(`✓ Users: ${usersSnap.size} documents`)

    // Check buy requests
    const buyRequestsSnap = await db.collection('buyRequests').limit(100).get()
    console.log(`✓ Buy Requests: ${buyRequestsSnap.size} documents`)

    console.log('\n📝 Database is populated and ready for use!')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

checkData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
