'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { WishlistService } from '@/frontend/services/wishlist.service'
import { ListingCard, ListingCardSkeleton } from '@/frontend/components/listings/ListingCard'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { Heart } from 'lucide-react'

export default function WishlistPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => WishlistService.getWishlist(),
  })

  const wishlist = data?.data ?? []

  function handleWishlistChange(listingId: string, added: boolean) {
    if (!added) {
      // Optimistically remove from list
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          My Wishlist
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isLoading ? 'Loading…' : `${wishlist.length} saved item${wishlist.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save listings you're interested in by tapping the heart icon"
          action={{ label: 'Browse listings', href: '/listings' }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlist.map((item) =>
            item.listing ? (
              <ListingCard
                key={item.id}
                listing={item.listing}
                isWishlisted={true}
                onWishlistChange={handleWishlistChange}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
