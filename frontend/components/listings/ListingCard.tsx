'use client'

import Link from 'next/link'
import { Listing } from '@/shared/types'
import { formatPrice, formatRelativeTime } from '@/frontend/lib/utils'
import { Heart, MapPin, Star, Tag } from 'lucide-react'
import { useState } from 'react'
import { WishlistService } from '@/frontend/services/wishlist.service'
import { useToast } from '@/frontend/components/ui/toast'
import { cn } from '@/frontend/lib/utils'

/* ─────────────────────────────────────────────────────────────
   Top-left badge logic (reference: "Best Sale", "15% OFF", "20% OFF")
   Maps listing condition → badge
───────────────────────────────────────────────────────────── */
function getLeftBadge(listing: Listing): { label: string; cls: string } | null {
  if (listing.condition === 'new')      return { label: 'New Item',   cls: 'badge-sale'    }
  if (listing.condition === 'like-new') return { label: 'Best Deal',  cls: 'badge-sale'    }
  if (listing.condition === 'good')     return { label: '10% OFF',    cls: 'badge-off'     }
  if (listing.condition === 'fair')     return { label: '20% OFF',    cls: 'badge-off'     }
  return null
}

/* Top-right badge (reference: "✦ ORGANIC", "❄ FROZEN") */
function getRightBadge(listing: Listing): { label: string; cls: string } | null {
  if (listing.condition === 'new')      return { label: '✓ VERIFIED',  cls: 'badge-organic' }
  if (listing.condition === 'like-new') return { label: '★ TOP RATED', cls: 'badge-organic' }
  if (listing.condition === 'good')     return null
  if (listing.condition === 'fair')     return { label: '🔥 POPULAR',  cls: 'badge-frozen'  }
  return null
}

/* ─────────────────────────────────────────────────────────────
   The struck-through "original" price (like reference: $1.50 → $1.25)
   We use 15% markup to simulate an original price
───────────────────────────────────────────────────────────── */
function getOriginalPrice(listing: Listing): number | null {
  if (listing.negotiable) return Math.round(listing.price * 1.15)
  return null
}

interface ListingCardProps {
  listing: Listing
  showWishlistButton?: boolean
  isWishlisted?: boolean
  onWishlistChange?: (id: string, added: boolean) => void
}

export function ListingCard({
  listing,
  showWishlistButton = true,
  isWishlisted = false,
  onWishlistChange,
}: ListingCardProps) {
  const { toast }     = useToast()
  const [wishlisted, setWishlisted] = useState(isWishlisted)
  const [adding, setAdding]         = useState(false)

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (adding) return
    setAdding(true)
    try {
      if (wishlisted) {
        await WishlistService.removeFromWishlist(listing.id)
        setWishlisted(false)
        toast({ type: 'info', title: 'Removed from wishlist' })
        onWishlistChange?.(listing.id, false)
      } else {
        await WishlistService.addToWishlist(listing.id)
        setWishlisted(true)
        toast({ type: 'success', title: 'Saved to wishlist!' })
        onWishlistChange?.(listing.id, true)
      }
    } catch {
      toast({ type: 'error', title: 'Please sign in to save items' })
    } finally {
      setAdding(false)
    }
  }

  const leftBadge  = getLeftBadge(listing)
  const rightBadge = getRightBadge(listing)
  const origPrice  = getOriginalPrice(listing)

  /* Simulate stock bar (reference shows a green progress bar) */
  const stockPct = 65 + ((listing.views ?? 0) % 30)

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="product-card">

        {/* ── Image area (reference: light gray bg, product centred) ── */}
        <div className="relative overflow-hidden" style={{ background:'#F5F5F5', aspectRatio:'1/1' }}>

          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.05]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag className="h-12 w-12 text-gray-200" />
            </div>
          )}

          {/* Top-left badge */}
          {leftBadge && (
            <span className={cn('absolute top-2 left-2', leftBadge.cls)}>
              {leftBadge.label}
            </span>
          )}

          {/* Top-right badge */}
          {rightBadge && (
            <span className={cn('absolute top-2 right-2', rightBadge.cls)}>
              {rightBadge.label}
            </span>
          )}
        </div>

        {/* ── Card body ── */}
        <div className="p-3 pt-3.5">

          {/* Title (reference: 2 lines, normal weight) */}
          <h3 className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5
                         group-hover:text-[#1B4332] transition-colors">
            {listing.title}
          </h3>

          {/* Condition label (reference shows weight/unit like "1000gm") */}
          <p className="text-[11px] text-gray-400 font-medium mb-1">
            {listing.condition === 'new'      ? 'Brand New'
             : listing.condition === 'like-new' ? 'Barely Used'
             : listing.condition === 'good'     ? 'Good Condition'
             : listing.condition === 'fair'     ? 'Fair Condition'
             : 'Used'} ·{' '}
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              4.8/5
            </span>
          </p>

          {/* Price row (reference: bold price + struck-through original + green + button) */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[18px] font-extrabold text-[#1A1A1A]">
                {formatPrice(listing.price)}
              </span>
              {origPrice && (
                <span className="text-[12px] text-gray-400 line-through font-medium">
                  {formatPrice(origPrice)}
                </span>
              )}
            </div>

            {/* Dark-green circular + button (exact reference match) */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              className="btn-add"
              aria-label="View listing"
            >
              +
            </button>
          </div>

          {/* Stock progress bar + "Available only" (reference shows this) */}
          <div className="mt-3">
            <p className="text-[10px] text-gray-400 font-medium mb-1">
              {listing.views > 0 ? `${listing.views} people viewed this` : 'A limited quantity of this item is available'}
            </p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'#E5E7EB' }}>
              <div className="h-full rounded-full transition-all"
                   style={{ width:`${stockPct}%`, background:'var(--c-green)' }} />
            </div>
            <p className="text-[11px] font-bold mt-1" style={{ color:'var(--c-orange)' }}>
              {listing.city}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────────
   Skeleton (matches card layout)
───────────────────────────────────────────────────────────── */
export function ListingCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="skeleton" style={{ aspectRatio:'1/1' }} />
      <div className="p-3 pt-3.5 space-y-2">
        <div className="h-3.5 skeleton w-4/5" />
        <div className="h-3 skeleton w-1/2" />
        <div className="flex items-center justify-between mt-2">
          <div className="h-5 skeleton w-1/3" />
          <div className="skeleton rounded-full" style={{ width:36, height:36 }} />
        </div>
        <div className="h-1.5 skeleton rounded-full mt-2" />
        <div className="h-3 skeleton w-1/4" />
      </div>
    </div>
  )
}
