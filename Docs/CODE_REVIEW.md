# Frontend Code Review - Ownzo

## 🔴 Critical Issues

### 1. **Import Path Inconsistency (High Priority)**
**Location:** Throughout frontend  
**Problem:** Mixed import paths creating confusion and potential runtime errors

```typescript
// ❌ INCONSISTENT - Found in same files
import { Card } from '@/components/ui/card'         // ❌ Old path
import { Card } from '@/frontend/components/ui/card' // ✅ New path
import { useAuth } from '@/hooks/useAuth'            // ❌ Old path
import { useAuth } from '@/frontend/hooks/useAuth'   // ✅ New path
```

**Files affected:**
- `app/(main)/page.tsx` - Lines 5-7
- `app/(main)/listings/[id]/page.tsx` - Lines 3-5
- `app/(main)/listings/create/page.tsx` - Lines 7-10
- All other pages

**Fix:**
```typescript
// ✅ CORRECT - Use consistent paths
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent } from '@/frontend/components/ui/card'
import { useAuth } from '@/frontend/hooks/useAuth'
import { ListingService } from '@/frontend/services/listing.service'
```

**Impact:** Can cause build failures and confusion when imports fail to resolve

---

## 🟠 Reusability Issues

### 2. **Duplicated ListingCard Component**
**Location:** `app/(main)/page.tsx`, `app/(main)/wishlist/page.tsx`, `app/(main)/profile/page.tsx`  
**Problem:** Same listing card JSX repeated 3+ times

```typescript
// ❌ DUPLICATED - Found in multiple files
<Card className="hover:shadow-lg transition-shadow overflow-hidden group">
  <div className="aspect-square relative overflow-hidden bg-gray-100">
    {listing.images[0] ? (
      <img src={listing.images[0]} alt={listing.title} className="..." />
    ) : (
      <div className="flex items-center justify-center h-full">No Image</div>
    )}
    <button className="absolute top-2 right-2 p-2 bg-white rounded-full">
      <Heart className="h-4 w-4" />
    </button>
  </div>
  <CardContent className="p-4">
    <h3 className="font-semibold mb-1 truncate">{listing.title}</h3>
    <p className="text-2xl font-bold text-primary">{formatPrice(listing.price)}</p>
    <div className="flex items-center text-sm">
      <MapPin className="h-3 w-3 mr-1" />
      {listing.city}
    </div>
    <p className="text-xs text-muted-foreground">
      {formatRelativeTime(listing.createdAt)}
    </p>
  </CardContent>
</Card>
```

**Solution:** Extract to reusable component

```typescript
// ✅ Create: frontend/components/listings/ListingCard.tsx
interface ListingCardProps {
  listing: Listing
  showWishlist?: boolean
  variant?: 'default' | 'compact'
}

export function ListingCard({ listing, showWishlist = true, variant = 'default' }: ListingCardProps) {
  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="hover:shadow-lg transition-shadow overflow-hidden group">
        {/* ... */}
      </Card>
    </Link>
  )
}
```

**Usage:**
```typescript
// ✅ CLEAN
<ListingCard listing={listing} />
```

**Lines saved:** ~30 lines per usage = 90+ lines total

---

### 3. **Duplicated Loading Skeleton**
**Location:** `app/(main)/page.tsx` (line 70-79)  
**Problem:** Loading skeleton not reusable

```typescript
// ❌ DUPLICATED
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {[...Array(8)].map((_, i) => (
    <Card key={i} className="animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <CardContent className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </CardContent>
    </Card>
  ))}
</div>
```

**Solution:**
```typescript
// ✅ Create: frontend/components/ui/skeleton.tsx
export function ListingCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <CardContent className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </CardContent>
    </Card>
  )
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => <ListingCardSkeleton key={i} />)}
    </div>
  )
}
```

---

### 4. **Duplicated Form Field Pattern**
**Location:** `app/(main)/listings/create/page.tsx`  
**Problem:** Repeated label + input + error pattern

```typescript
// ❌ DUPLICATED 6+ times
<div>
  <label className="block text-sm font-medium mb-2">Title *</label>
  <Input {...register('title')} placeholder="e.g., iPhone 13 Pro" />
  {errors.title && (
    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
  )}
</div>
```

**Solution:**
```typescript
// ✅ Create: frontend/components/forms/FormField.tsx
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label} {required && '*'}
      </label>
      {children}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
```

**Usage:**
```typescript
// ✅ CLEAN
<FormField label="Title" error={errors.title?.message} required>
  <Input {...register('title')} placeholder="e.g., iPhone 13 Pro" />
</FormField>
```

---

### 5. **Hardcoded Grid Layouts**
**Problem:** Same grid pattern repeated everywhere

```typescript
// ❌ DUPLICATED
className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
```

**Solution:**
```typescript
// ✅ Create: frontend/lib/styles.ts
export const gridLayouts = {
  listings: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6',
  categories: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4',
  profile: 'grid grid-cols-1 md:grid-cols-3 gap-4',
}

// Usage
<div className={gridLayouts.listings}>
```

---

## 🟡 Component Coupling Issues

### 6. **Direct Store Access in ApiService**
**Location:** `frontend/services/api.service.ts` (lines 12, 27)  
**Problem:** Tight coupling between service and store

```typescript
// ❌ TIGHT COUPLING
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token  // ❌ Direct access
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Solution:**
```typescript
// ✅ DECOUPLED - Use dependency injection
export function createApiClient(getToken: () => string | null) {
  const client = axios.create({ baseURL: API_URL })
  
  client.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
  
  return client
}

// Initialize in provider
const apiClient = createApiClient(() => useAuthStore.getState().token)
```

**Benefit:** ApiService can be tested without Zustand

---

### 7. **Browser-Specific Code in Service**
**Location:** `frontend/services/api.service.ts` (line 28)  
**Problem:** Hard redirect breaks SSR and testability

```typescript
// ❌ BREAKS SSR
if (error.response?.status === 401) {
  useAuthStore.getState().logout()
  window.location.href = '/login'  // ❌ Direct window access
}
```

**Solution:**
```typescript
// ✅ CALLBACK PATTERN
interface ApiClientOptions {
  onUnauthorized?: () => void
}

export function createApiClient(options: ApiClientOptions) {
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        options.onUnauthorized?.()
      }
      return Promise.reject(error)
    }
  )
}

// Usage in provider
createApiClient({
  onUnauthorized: () => {
    useAuthStore.getState().logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
})
```

---

### 8. **Component Knows Too Much About Routing**
**Location:** `app/(main)/listings/[id]/page.tsx` (line 28)  
**Problem:** Component builds URLs manually

```typescript
// ❌ HARD-CODED ROUTING
const handleChat = () => {
  router.push(`/chat?listingId=${listingId}`)
}
```

**Solution:**
```typescript
// ✅ Create: frontend/lib/routes.ts
export const routes = {
  chat: (listingId: string) => `/chat?listingId=${listingId}`,
  listing: (id: string) => `/listings/${id}`,
  editListing: (id: string) => `/listings/${id}/edit`,
}

// Usage
const handleChat = () => router.push(routes.chat(listingId))
```

---

## ⚡ Performance Issues

### 9. **Unnecessary Re-renders**
**Location:** `app/(main)/listings/[id]/page.tsx`  
**Problem:** Anonymous functions recreated on every render

```typescript
// ❌ RECREATED EVERY RENDER
<button onClick={() => setSelectedImage(index)}>
```

**Solution:**
```typescript
// ✅ MEMOIZED
const handleImageSelect = useCallback((index: number) => {
  setSelectedImage(index)
}, [])

<button onClick={() => handleImageSelect(index)}>
```

---

### 10. **Unoptimized Images**
**Location:** All pages with images  
**Problem:** Using `<img>` instead of Next.js `<Image>`

```typescript
// ❌ NO OPTIMIZATION
<img
  src={listing.images[0]}
  alt={listing.title}
  className="object-cover w-full h-full"
/>
```

**Solution:**
```typescript
// ✅ OPTIMIZED
import Image from 'next/image'

<Image
  src={listing.images[0]}
  alt={listing.title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Impact:** Faster loading, automatic WebP, lazy loading

---

### 11. **Missing React Query Optimizations**
**Location:** All pages with queries  
**Problem:** No stale time configuration

```typescript
// ❌ REFETCHES TOO OFTEN
const { data } = useQuery({
  queryKey: ['listings'],
  queryFn: () => ListingService.getListings(),
})
```

**Solution:**
```typescript
// ✅ OPTIMIZED
const { data } = useQuery({
  queryKey: ['listings'],
  queryFn: () => ListingService.getListings(),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
})
```

---

### 12. **Array.from Inefficiency**
**Location:** `app/(main)/listings/create/page.tsx` (line 75)  
**Problem:** Creating unnecessary array

```typescript
// ❌ INEFFICIENT
const uploadPromises = Array.from(files).map((file) =>
  ApiService.uploadFile(file, 'image')
)
```

**Solution:**
```typescript
// ✅ DIRECT
const uploadPromises = [...files].map((file) =>
  ApiService.uploadFile(file, 'image')
)
```

---

## 🔵 Naming Issues

### 13. **Inconsistent Service Naming**
**Problem:** Some use camelCase, some use PascalCase

```typescript
// ❌ INCONSISTENT
ListingService.getListings()    // PascalCase
CategoryService.getCategories() // PascalCase
// vs
listingService.getListings()    // camelCase (if exported as instance)
```

**Standardize:**
```typescript
// ✅ All PascalCase for class-based services
export class ListingService { }
export class CategoryService { }
```

---

### 14. **Generic Variable Names**
**Location:** Multiple files  
**Problem:** `data`, `result`, `res` used everywhere

```typescript
// ❌ UNCLEAR
const { data } = useQuery(...)
const data = await someFunction()
```

**Solution:**
```typescript
// ✅ DESCRIPTIVE
const { data: listingsData } = useQuery(...)
const { data: categoriesData } = useQuery(...)
```

---

### 15. **Boolean Prop Naming**
**Location:** Component props  
**Problem:** Not prefixed with `is`, `has`, `should`

```typescript
// ❌ UNCLEAR
<Component loading={true} />
```

**Solution:**
```typescript
// ✅ CLEAR
<Component isLoading={true} />
<Component hasError={false} />
<Component shouldRender={true} />
```

---

## 📚 Technical Debt

### 16. **No Error Boundaries**
**Problem:** Unhandled errors crash entire app

**Solution:**
```typescript
// ✅ Add: frontend/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component {
  state = { hasError: false }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

---

### 17. **Missing Loading States**
**Location:** `app/(main)/listings/[id]/page.tsx`  
**Problem:** Simple "Loading..." text

```typescript
// ❌ POOR UX
if (isLoading) return <div>Loading...</div>
```

**Solution:**
```typescript
// ✅ PROPER SKELETON
if (isLoading) return <ListingDetailSkeleton />
```

---

### 18. **No Error Handling in Mutations**
**Location:** `app/(main)/listings/[id]/page.tsx` (line 22)  
**Problem:** Silent failures

```typescript
// ❌ SILENT FAILURE
const handleWishlist = async () => {
  try {
    await WishlistService.addToWishlist(listingId)
  } catch (error) {
    console.error('Wishlist error:', error) // ❌ Only logs
  }
}
```

**Solution:**
```typescript
// ✅ USER FEEDBACK
import { toast } from 'sonner'

const addToWishlistMutation = useMutation({
  mutationFn: WishlistService.addToWishlist,
  onSuccess: () => toast.success('Added to wishlist'),
  onError: () => toast.error('Failed to add to wishlist'),
})
```

---

### 19. **Inline Validation Schemas**
**Location:** `app/(main)/listings/create/page.tsx` (lines 15-24)  
**Problem:** Schema defined in component

```typescript
// ❌ NOT REUSABLE
const createListingSchema = z.object({ ... })
```

**Solution:**
```typescript
// ✅ CENTRALIZED
// Create: frontend/lib/validations/listing.schema.ts
export const createListingSchema = z.object({ ... })
export const updateListingSchema = createListingSchema.partial()
```

---

### 20. **Magic Numbers**
**Location:** Throughout  
**Problem:** Hardcoded values

```typescript
// ❌ MAGIC NUMBERS
staleTime: 5 * 60 * 1000
limit: 12
maxImages: 10
```

**Solution:**
```typescript
// ✅ CONSTANTS
// Create: frontend/lib/constants.ts
export const QUERY_STALE_TIME = 5 * 60 * 1000
export const LISTINGS_PER_PAGE = 12
export const MAX_LISTING_IMAGES = 10
```

---

## 📊 Priority Summary

| Priority | Issue | Files Affected | Lines Impact |
|----------|-------|----------------|--------------|
| 🔴 P0 | Import path inconsistency | 10+ | All imports |
| 🔴 P0 | Duplicated ListingCard | 3 | ~90 lines |
| 🟠 P1 | Direct store in ApiService | 1 | Testing blocked |
| 🟠 P1 | No error boundaries | All | App crashes |
| 🟡 P2 | Unoptimized images | 10+ | Performance |
| 🟡 P2 | Missing loading states | 5+ | UX |
| 🔵 P3 | Naming inconsistencies | Many | Readability |

---

## 🎯 Recommended Action Plan

### Phase 1: Critical (This Week)
1. ✅ Fix all import paths to use `/frontend/` prefix
2. ✅ Extract `ListingCard` component
3. ✅ Add error boundaries
4. ✅ Decouple ApiService from store

### Phase 2: Important (Next Week)
5. ✅ Create reusable form components
6. ✅ Add loading skeletons
7. ✅ Optimize images with Next/Image
8. ✅ Add toast notifications

### Phase 3: Improvements (Ongoing)
9. ✅ Extract validation schemas
10. ✅ Create route constants
11. ✅ Standardize naming conventions
12. ✅ Add performance monitoring

---

## 💡 Quick Wins (< 1 hour each)

1. **Fix import paths** - Find/replace in IDE
2. **Extract ListingCard** - Copy/paste + refactor
3. **Add constants file** - Move magic numbers
4. **Create route helpers** - Centralize URLs

---

## 🚀 Long-term Improvements

1. **Component library** - Storybook for UI components
2. **E2E tests** - Playwright for critical flows
3. **Performance monitoring** - Web Vitals tracking
4. **Accessibility audit** - WCAG compliance
5. **Bundle analysis** - Optimize chunk sizes

---

**Status:** 20 issues identified  
**Code Quality:** B+ (Good with room for improvement)  
**Maintainability:** B (Needs component extraction)  
**Performance:** B+ (Good, could be optimized)  
**Type Safety:** A (Excellent TypeScript usage)
