'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/frontend/services/listing.service'
import { ListingCard, ListingCardSkeleton } from '@/frontend/components/listings/ListingCard'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { Button } from '@/frontend/components/ui/button'
import { Search, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQ)
  const [submitted, setSubmitted] = useState(initialQ)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSubmitted(query), 400)
    return () => clearTimeout(t)
  }, [query])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', submitted],
    queryFn: () => ListingService.getListings({ search: submitted, limit: 48 }),
    enabled: submitted.trim().length > 1,
  })

  const listings = data?.data?.data ?? []
  const total = data?.data?.total ?? 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(query)
    router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="section-title">Search</h1>
      </div>

      {/* Search input */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for items, brands, categories…"
            className="input-field pl-12 h-14 text-base rounded-2xl"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSubmitted('') }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      {!submitted.trim() ? (
        <div className="py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Start typing to search listings</p>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Popular categories</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Vehicles'].map((cat) => (
                <Button key={cat} variant="outline" size="sm" onClick={() => setQuery(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : isLoading || isFetching ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No results for "${submitted}"`}
          description="Try different keywords or browse all listings"
          action={{ label: 'Browse all listings', href: '/listings' }}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{total.toLocaleString()}</span> results for{' '}
            <span className="font-semibold text-foreground">"{submitted}"</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
