'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { ListingService } from '@/frontend/services/listing.service'
import { CategoryService } from '@/frontend/services/category.service'
import { CommunityService } from '@/frontend/services/community.service'
import { ListingCard, ListingCardSkeleton } from '@/frontend/components/listings/ListingCard'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { Button } from '@/frontend/components/ui/button'
import { ProductCondition, ListingFilters } from '@/shared/types'
import {
  SlidersHorizontal, Search, X, ChevronDown, ShoppingBag,
  Smartphone, Sofa, BookOpen, Shirt, Dumbbell, Car, Home, Music2, Palette, UtensilsCrossed, Package,
} from 'lucide-react'
import { cn } from '@/frontend/lib/utils'
import { formatPrice } from '@/frontend/lib/utils'

const CONDITIONS: { value: ProductCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
]

// Map icon names to Lucide components
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Sofa,
  BookOpen,
  Shirt,
  Dumbbell,
  Car,
  Home,
  Music2,
  Palette,
  UtensilsCrossed,
  Package,
}

function getCategoryIcon(iconName: string) {
  const Icon = CATEGORY_ICONS[iconName]
  return Icon || Package // fallback to Package icon
}

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') ?? '')
  const [communityId, setCommunityId] = useState(searchParams.get('communityId') ?? '')
  const [condition, setCondition] = useState<ProductCondition | ''>(
    (searchParams.get('condition') as ProductCondition) ?? ''
  )
  const [sortBy, setSortBy] = useState<ListingFilters['sortBy']>(
    (searchParams.get('sortBy') as ListingFilters['sortBy']) ?? 'recent'
  )
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
  const [page, setPage] = useState(1)

  const filters: ListingFilters = {
    search: search || undefined,
    categoryId: categoryId || undefined,
    communityId: communityId || undefined,
    condition: (condition as ProductCondition) || undefined,
    sortBy: sortBy || 'recent',
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page,
    limit: 24,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => ListingService.getListings(filters),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryService.getCategories(),
  })

  const { data: communitiesData } = useQuery({
    queryKey: ['communities'],
    queryFn: () => CommunityService.getCommunities(),
  })

  const listings = data?.data?.data ?? []
  const total = data?.data?.total ?? 0
  const hasMore = data?.data?.hasMore ?? false
  const categories = categoriesData?.data ?? []
  const communities = communitiesData?.data ?? []

  function clearFilters() {
    setSearch('')
    setCategoryId('')
    setCommunityId('')
    setCondition('')
    setSortBy('recent')
    setMinPrice('')
    setMaxPrice('')
    setPage(1)
  }

  const hasActiveFilters = !!(search || categoryId || communityId || condition || minPrice || maxPrice)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="section-title">All Listings</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading…' : `${total.toLocaleString()} items found`}
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(showFilters && 'border-primary text-primary bg-accent')}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                !
              </span>
            )}
          </Button>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as ListingFilters['sortBy']); setPage(1) }}
            className="h-8 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search listings by title, description…"
          className="input-field pl-10 h-11"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="rounded-xl border bg-card p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}
                className="input-field h-10"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Community */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Community
              </label>
              <select
                value={communityId}
                onChange={(e) => { setCommunityId(e.target.value); setPage(1) }}
                className="input-field h-10"
              >
                <option value="">All Communities</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => { setCondition(e.target.value as ProductCondition); setPage(1) }}
                className="input-field h-10"
              >
                <option value="">Any Condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Min Price (₹)
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1) }}
                placeholder="0"
                className="input-field h-10"
              />
            </div>
          </div>

          {/* Second row: Max price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Max Price */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Max Price (₹)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }}
                placeholder="Any"
                className="input-field h-10"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                <X className="h-4 w-4 mr-1" /> Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Category pills */}
      {categories.length > 0 && !showFilters && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => { setCategoryId(''); setPage(1) }}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
              !categoryId ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent border-border'
            )}
          >
            All
          </button>
          {categories.map((c) => {
            const Icon = getCategoryIcon(c.icon)
            return (
              <button
                key={c.id}
                onClick={() => { setCategoryId(c.id); setPage(1) }}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap flex items-center gap-1.5',
                  categoryId === c.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent border-border'
                )}
              >
                <Icon className="h-4 w-4" />
                {c.name}
              </button>
            )
          })}
        </div>
      )}

      {/* Results grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No listings found"
          description={hasActiveFilters ? 'Try adjusting your filters' : 'No listings available right now'}
          action={hasActiveFilters ? { label: 'Clear filters', onClick: clearFilters } : { label: 'Be the first to sell!', href: '/listings/create' }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {(hasMore || page > 1) && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                disabled={page === 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">Page {page}</span>
              <Button
                variant="outline"
                disabled={!hasMore || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
