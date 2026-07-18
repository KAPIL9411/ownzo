'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { ListingService } from '@/frontend/services/listing.service'
import { ReviewService } from '@/frontend/services/review.service'
import { ChatService } from '@/frontend/services/chat.service'
import { WishlistService } from '@/frontend/services/wishlist.service'
import { ApiService } from '@/frontend/services/api.service'
import { OfferModal } from '@/frontend/components/listings/OfferModal'
import { ReviewModal } from '@/frontend/components/listings/ReviewModal'
import { ReportModal } from '@/frontend/components/listings/ReportModal'
import { VerificationBadge, TrustScoreBadge } from '@/frontend/components/verification/VerificationBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar'
import { Button } from '@/frontend/components/ui/button'
import { useToast } from '@/frontend/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice, formatRelativeTime, formatDate } from '@/frontend/lib/utils'
import {
  MapPin, Eye, Heart, MessageCircle, TrendingDown, Star, Share2,
  CheckCircle, Clock, Tag, ChevronLeft, ChevronRight, Flag, Package,
  BarChart2, ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/frontend/lib/utils'

const CONDITION_STYLES: Record<string, string> = {
  'new': 'bg-green-100 text-green-700',
  'like-new': 'bg-blue-100 text-blue-700',
  'good': 'bg-yellow-100 text-yellow-700',
  'fair': 'bg-orange-100 text-orange-700',
  'poor': 'bg-red-100 text-red-700',
}

const CONDITION_LABELS: Record<string, string> = {
  'new': 'New', 'like-new': 'Like New', 'good': 'Good', 'fair': 'Fair', 'poor': 'Poor',
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const listingId = params.id as string

  const [selectedImage, setSelectedImage] = useState(0)
  const [offerOpen, setOfferOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => ListingService.getListingById(listingId),
  })

  const { data: passportData } = useQuery({
    queryKey: ['product-passport', listingId],
    queryFn: () => ApiService.get<any>(`/product-passport?listingId=${listingId}`),
    enabled: !!listingId,
  })

  const { data: reviewData } = useQuery({
    queryKey: ['reviews', data?.data?.sellerId],
    queryFn: () => ReviewService.getSellerReviews(data!.data!.sellerId),
    enabled: !!data?.data?.sellerId,
  })

  const chatMutation = useMutation({
    mutationFn: () => ChatService.createChat(listingId),
    onSuccess: (res) => {
      router.push(`/chat?chatId=${res.data?.id}`)
    },
    onError: () => toast({ type: 'error', title: 'Failed to start chat' }),
  })

  const listing = data?.data
  const hasPassport = !!passportData
  const reviews = reviewData?.data?.reviews ?? []
  const avgRating = reviewData?.data?.averageRating ?? 0
  const isOwnListing = user?.id === listing?.sellerId
  const seller = listing?.seller

  async function toggleWishlist() {
    try {
      if (wishlisted) {
        await WishlistService.removeFromWishlist(listingId)
        setWishlisted(false)
        toast({ type: 'info', title: 'Removed from wishlist' })
      } else {
        await WishlistService.addToWishlist(listingId)
        setWishlisted(true)
        toast({ type: 'success', title: 'Added to wishlist!' })
      }
    } catch {
      toast({ type: 'error', title: 'Sign in to save items' })
    }
  }

  function shareListng() {
    if (navigator.share) {
      navigator.share({ title: listing?.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({ type: 'success', title: 'Link copied to clipboard' })
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
        <div className="aspect-square rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-8 bg-muted rounded w-2/3" />
          <div className="h-10 bg-muted rounded w-1/2" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Listing not found</h2>
        <p className="text-muted-foreground mb-6">This listing may have been removed or expired.</p>
        <Button asChild><Link href="/listings">Browse Listings</Link></Button>
      </div>
    )
  }

  const images = listing.images?.length ? listing.images : []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-foreground transition-colors">Listings</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Image gallery — 3 cols */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-20 w-20 text-muted-foreground/30" />
              </div>
            )}

            {/* Arrow nav */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {selectedImage + 1}/{images.length}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                    i === selectedImage ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Video player — shown if listing has a video */}
          {listing.video && (
            <div className="rounded-2xl overflow-hidden border bg-black">
              <p className="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1">Video Preview</p>
              <video
                src={listing.video}
                controls
                className="w-full max-h-72 object-contain"
                poster={images[0]}
                preload="metadata"
              />
            </div>
          )}
        </div>

        {/* Details — 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title + badges */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', CONDITION_STYLES[listing.condition] ?? 'bg-muted text-muted-foreground')}>
                {CONDITION_LABELS[listing.condition] ?? listing.condition}
              </span>
              {listing.status !== 'active' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 uppercase">
                  {listing.status}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold leading-snug mb-1">{listing.title}</h1>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-primary">{formatPrice(listing.price)}</p>
              {listing.negotiable && (
                <span className="text-xs border border-primary/40 text-primary rounded-full px-2 py-0.5">Negotiable</span>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{listing.city}{listing.locality && `, ${listing.locality}`}</span>
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{listing.views} views</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatRelativeTime(listing.createdAt)}</span>
          </div>

          {/* Description */}
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold mb-2 text-sm">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Seller card */}
          {seller && (
            <Link href={`/users/${seller.id}`} className="block rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Seller</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={seller.photoURL} />
                  <AvatarFallback>{seller.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{seller.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {avgRating > 0 && (
                      <>
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span>{avgRating.toFixed(1)}</span>
                        <span>({reviews.length} reviews)</span>
                      </>
                    )}
                    {(seller.verified || seller.isVerified) && (
                      <span className="flex items-center gap-0.5 text-primary">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Action buttons */}
          {!isOwnListing && listing.status === 'active' && (
            <div className="space-y-2.5">
              <Button
                className="w-full"
                size="lg"
                onClick={() => chatMutation.mutate()}
                disabled={chatMutation.isPending}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {chatMutation.isPending ? 'Starting chat…' : 'Chat with Seller'}
              </Button>
              {listing.negotiable && (
                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  onClick={() => setOfferOpen(true)}
                >
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Make an Offer
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={toggleWishlist}
                  className={cn(wishlisted && 'border-red-300 text-red-500 bg-red-50')}
                >
                  <Heart className={cn('h-4 w-4 mr-2', wishlisted && 'fill-current')} />
                  {wishlisted ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" onClick={shareListng}>
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
              {hasPassport && (
                <Button variant="outline" className="w-full" size="sm" asChild>
                  <Link href={`/listings/${listingId}/passport`}>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    View Product Passport
                  </Link>
                </Button>
              )}
            </div>
          )}

          {isOwnListing && (
            <div className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/listings/${listingId}/edit`}>Edit Listing</Link>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/listings/${listingId}/analytics`}>
                    <BarChart2 className="h-4 w-4 mr-1.5" /> Analytics
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/listings/${listingId}/passport`}>
                    <ShieldCheck className="h-4 w-4 mr-1.5" /> Passport
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Report button — shown to non-owners only */}
          {!isOwnListing && user && (
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors mx-auto"
            >
              <Flag className="h-3.5 w-3.5" /> Report this listing
            </button>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <div className="border-t pt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Seller Reviews</h2>
          {!isOwnListing && user && (
            <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)}>
              <Star className="h-4 w-4 mr-1.5" /> Write a Review
            </Button>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet for this seller.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn('h-4 w-4', i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-auto">{formatRelativeTime(review.createdAt)}</span>
                </div>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {offerOpen && listing && (
        <OfferModal listing={listing} open={offerOpen} onClose={() => setOfferOpen(false)} />
      )}
      {reviewOpen && listing && (
        <ReviewModal
          listingId={listingId}
          sellerId={listing.sellerId}
          sellerName={seller?.name ?? 'Seller'}
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
        />
      )}
      {reportOpen && (
        <ReportModal
          type="listing"
          targetId={listingId}
          targetName={listing?.title}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  )
}
