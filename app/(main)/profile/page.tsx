'use client'

import { useQuery } from '@tanstack/react-query'
import { ListingService } from '@/frontend/services/listing.service'
import { ReviewService } from '@/frontend/services/review.service'
import { OfferService } from '@/frontend/services/offer.service'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar'
import { Button } from '@/frontend/components/ui/button'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { ListingCard } from '@/frontend/components/listings/ListingCard'
import { VerificationBadge, TrustScoreBadge, TrustScoreCard } from '@/frontend/components/verification/VerificationBadge'
import { formatPrice, formatRelativeTime } from '@/frontend/lib/utils'
import Link from 'next/link'
import {
  Star, Package, Edit, LogOut, MapPin,
  TrendingDown, Tag, Clock,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/frontend/lib/utils'

const TABS = ['Listings', 'Reviews', 'Offers'] as const
type Tab = typeof TABS[number]

const OFFER_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  counter: 'bg-blue-100 text-blue-700',
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('Listings')

  const { data: listingsData } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => ListingService.getMyListings(),
    enabled: !!user,
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', user?.id],
    queryFn: () => ReviewService.getSellerReviews(user!.id),
    enabled: !!user?.id,
  })

  const { data: offersData } = useQuery({
    queryKey: ['offers', 'buyer'],
    queryFn: () => OfferService.getOffers('buyer'),
    enabled: !!user,
  })

  const listings = listingsData?.data ?? []
  const reviews = reviewsData?.data?.reviews ?? []
  const avgRating = reviewsData?.data?.averageRating ?? 0
  const offers = offersData?.data ?? []

  if (!user) return null

  const initials = user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarImage src={user.photoURL} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <VerificationBadge
                verified={user.verified || user.isVerified || false}
                verificationType={user.verificationType}
                showLabel
                size="md"
              />
            </div>
            <p className="text-muted-foreground text-sm mb-3">{user.email}</p>

            <div className="flex flex-wrap gap-3 text-sm mb-3">
              {avgRating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{avgRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviews.length} reviews)</span>
                </div>
              )}
              <TrustScoreBadge trustScore={user.trustScore ?? 0} />
              {(user.city || user.location?.city) && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{user.city ?? user.location?.city}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{listings.length} listings</span>
              </div>
            </div>

            {user.bio && (
              <p className="text-sm text-muted-foreground mt-3 max-w-md">{user.bio}</p>
            )}

            {/* Trust Score Card */}
            <div className="mt-4 max-w-sm">
              <TrustScoreCard
                trustScore={user.trustScore ?? 0}
                verified={user.isVerified || user.verified}
                listingCount={user.listingCount ?? listings.length}
                reviewCount={user.reviewCount ?? reviews.length}
                reportCount={(user as any).reportCount ?? 0}
              />
            </div>
          </div>

          <div className="flex gap-2 sm:flex-col">
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile/edit">
                <Edit className="h-4 w-4 mr-1.5" /> Edit
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
            {tab === 'Listings' && listings.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">({listings.length})</span>
            )}
            {tab === 'Reviews' && reviews.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">({reviews.length})</span>
            )}
            {tab === 'Offers' && offers.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">({offers.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Listings' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button asChild size="sm">
              <Link href="/listings/create">
                <Package className="h-4 w-4 mr-1.5" /> New Listing
              </Link>
            </Button>
          </div>
          {listings.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No listings yet"
              description="Start selling by creating your first listing"
              action={{ label: 'Create listing', href: '/listings/create' }}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} showWishlistButton={false} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Reviews' && (
        <div>
          {reviews.length === 0 ? (
            <EmptyState icon={Star} title="No reviews yet" description="Reviews from buyers will appear here." />
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('h-4 w-4', i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">{formatRelativeTime(review.createdAt)}</span>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Offers' && (
        <div>
          {offers.length === 0 ? (
            <EmptyState icon={TrendingDown} title="No offers made" description="Offers you've made on listings will appear here." />
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="rounded-xl border bg-card p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${offer.listingId}`} className="font-semibold hover:text-primary text-sm transition-colors">
                      View Listing
                    </Link>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Offered <span className="font-semibold text-foreground">{formatPrice(offer.offerPrice)}</span>
                    </p>
                    {offer.message && <p className="text-xs text-muted-foreground mt-1 italic">"{offer.message}"</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', OFFER_STATUS_STYLES[offer.status] ?? 'bg-muted text-muted-foreground')}>
                      {offer.status}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(offer.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
