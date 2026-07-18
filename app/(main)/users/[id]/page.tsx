'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ReviewService } from '@/frontend/services/review.service'
import { ListingService } from '@/frontend/services/listing.service'
import { ApiService } from '@/frontend/services/api.service'
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar'
import { ListingCard, ListingCardSkeleton } from '@/frontend/components/listings/ListingCard'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { Button } from '@/frontend/components/ui/button'
import { formatRelativeTime } from '@/frontend/lib/utils'
import { Star, MapPin, Package, CheckCircle, ShieldCheck, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/frontend/lib/utils'
import { User } from '@/shared/types'

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => ApiService.get<{ success: boolean; data: User }>(`/users/${userId}`),
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', userId],
    queryFn: () => ReviewService.getSellerReviews(userId),
    enabled: !!userId,
  })

  const { data: listingsData } = useQuery({
    queryKey: ['listings', 'seller', userId],
    queryFn: () => ListingService.getListings({ limit: 24 }),
    enabled: !!userId,
  })

  const seller = userData?.data
  const reviews = reviewsData?.data?.reviews ?? []
  const avgRating = reviewsData?.data?.averageRating ?? 0
  const listings = listingsData?.data?.data?.filter((l) => l.sellerId === userId) ?? []

  if (userLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="rounded-2xl border bg-card p-6 flex gap-5">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </div>
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <EmptyState icon={Package} title="User not found" description="This profile doesn't exist or has been removed." action={{ label: 'Browse listings', href: '/listings' }} />
    )
  }

  const initials = seller.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Seller card */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarImage src={seller.photoURL} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{seller.name}</h1>
              {(seller.verified || seller.isVerified) && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {avgRating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-foreground">{avgRating.toFixed(1)}</span>
                  ({reviews.length} reviews)
                </span>
              )}
              {(seller.city || seller.location?.city) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {seller.city ?? seller.location?.city}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Trust Score: <span className="font-semibold text-foreground">{seller.trustScore ?? 0}</span>
              </span>
            </div>

            {seller.bio && <p className="text-sm text-muted-foreground mt-3 max-w-md">{seller.bio}</p>}
          </div>

          <Button asChild>
            <Link href={`/chat`}>
              <MessageCircle className="h-4 w-4 mr-2" /> Message
            </Link>
          </Button>
        </div>
      </div>

      {/* Listings */}
      <div>
        <h2 className="section-title mb-4">{seller.name}'s Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <EmptyState icon={Package} title="No active listings" description="This seller has no listings right now." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Reviews</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-4 w-4', i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                  ))}
                  <span className="text-xs text-muted-foreground ml-auto">{formatRelativeTime(r.createdAt)}</span>
                </div>
                <p className="text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
