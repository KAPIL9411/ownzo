import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
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
      // Remove quotes if present
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

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    description: 'Phones, laptops, tablets, and other electronic devices',
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    icon: '🛋️',
    description: 'Home and office furniture',
  },
  {
    name: 'Books',
    slug: 'books',
    icon: '📚',
    description: 'Books, magazines, and educational materials',
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    icon: '👕',
    description: 'Clothes, shoes, and accessories',
  },
  {
    name: 'Sports',
    slug: 'sports',
    icon: '⚽',
    description: 'Sports equipment and fitness gear',
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    icon: '🏡',
    description: 'Home decor, gardening tools, and appliances',
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    icon: '🎮',
    description: 'Toys, board games, and video games',
  },
  {
    name: 'Vehicles',
    slug: 'vehicles',
    icon: '🚗',
    description: 'Cars, bikes, and vehicle accessories',
  },
]

async function seedCategories() {
  console.log('🌱 Seeding categories...')

  try {
    // Check if categories already exist
    const existingCategories = await db.collection('categories').get()
    
    if (!existingCategories.empty) {
      console.log(`⚠️  Found ${existingCategories.size} existing categories. Skipping seed.`)
      console.log('   To reseed, delete the categories collection first.')
      return
    }

    // Add categories
    const batch = db.batch()
    const now = Timestamp.now()

    for (const category of categories) {
      const docRef = db.collection('categories').doc()
      batch.set(docRef, {
        ...category,
        createdAt: now,
        updatedAt: now,
      })
      console.log(`  ✓ Adding category: ${category.name}`)
    }

    await batch.commit()
    console.log(`✅ Successfully added ${categories.length} categories!`)

    // Fetch and display created categories
    const createdCategories = await db.collection('categories').get()
    console.log('\n📋 Categories in database:')
    createdCategories.forEach((doc) => {
      const data = doc.data()
      console.log(`  ${data.icon} ${data.name} (${doc.id})`)
    })
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    process.exit(1)
  }
}

seedCategories()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
