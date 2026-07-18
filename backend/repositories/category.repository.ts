import { adminDb } from '@/backend/lib/firebase-admin/config'
import { Category } from '@/shared/types'
import { serializeDocument, serializeSnapshots } from '@/backend/utils/serialize'

const CATEGORIES_COLLECTION = 'categories'

export class CategoryRepository {
  private db = adminDb

  async getAllCategories(): Promise<Category[]> {
    const snapshot = await this.db
      .collection(CATEGORIES_COLLECTION)
      .orderBy('name', 'asc')
      .get()

    return serializeSnapshots<Category>(snapshot.docs)
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const doc = await this.db.collection(CATEGORIES_COLLECTION).doc(id).get()

    if (!doc.exists) return null

    return serializeDocument<Category>({ id: doc.id, ...doc.data() })
  }

  async seedCategories(): Promise<void> {
    const categories = [
      { name: 'Electronics', icon: 'Smartphone', slug: 'electronics' },
      { name: 'Furniture', icon: 'Sofa', slug: 'furniture' },
      { name: 'Books', icon: 'BookOpen', slug: 'books' },
      { name: 'Clothing', icon: 'Shirt', slug: 'clothing' },
      { name: 'Sports', icon: 'Dumbbell', slug: 'sports' },
      { name: 'Vehicles', icon: 'Car', slug: 'vehicles' },
      { name: 'Home & Garden', icon: 'Home', slug: 'home-garden' },
      { name: 'Music & Instruments', icon: 'Music2', slug: 'music-instruments' },
      { name: 'Art & Crafts', icon: 'Palette', slug: 'art-crafts' },
      { name: 'Kitchen', icon: 'UtensilsCrossed', slug: 'kitchen' },
      { name: 'Others', icon: 'Package', slug: 'others' },
    ]

    const batch = this.db.batch()

    for (const category of categories) {
      const ref = this.db.collection(CATEGORIES_COLLECTION).doc()
      batch.set(ref, category)
    }

    await batch.commit()
  }
}

export const categoryRepository = new CategoryRepository()
