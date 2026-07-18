'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { OfferService } from '@/frontend/services/offer.service'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/frontend/components/ui/toast'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { formatPrice, formatRelativeTime } from '@/frontend/lib/utils'
import { Offer } from '@/shared/types'
import {
  TrendingDown, Check, X, MessageCircle, ArrowRight,
  Clock, Package, ChevronDown, Loader2,
} from 'lucide-react'
import { cn } from '@/frontend/lib/utils'
import Link from 'next/link'

type Tab = 'received' | 'sent'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-200'  },
  accepted: { label: 'Accepted', cls: 'bg-green-50 text-green-700 border-green-200'  },
  rejected: { label: 'Declined', cls: 'bg-red-50 text-red-700 border-red-200'        },
  counter:  { label: 'Counter',  cls: 'bg-blue-50 text-blue-700 border-blue-200'     },
}

export default function OffersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('received')

  const { data: receivedData, isLoading: receivedLoading } = useQuery({
    queryKey: ['offers', 'seller'],
    queryFn: () => OfferService.getOffers('seller'),
  })
  const { data: sentData, isLoading: sentLoading } = useQuery({
    queryKey: ['offers', 'buyer'],
    queryFn: () => OfferService.getOffers('buyer'),
  })

  const actionMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) =>
      OfferService.updateOfferStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      toast({
        type: vars.status === 'accepted' ? 'success' : 'info',
        title: vars.status === 'accepted' ? 'Offer accepted!' : 'Offer declined',
        description: vars.status === 'accepted'
          ? 'Listing marked as sold. Great deal!'
          : 'The buyer has been notified.',
      })
    },
    onError: (error: any) => {
      // Handle specific error messages from the backend
      const errorMessage = error?.response?.data?.error || error?.message || 'Action failed'
      
      // Check for already sold error
      if (errorMessage.includes('already been sold') || errorMessage.includes('already sold')) {
        queryClient.invalidateQueries({ queryKey: ['offers'] })
        toast({ 
          type: 'error', 
          title: 'Listing Already Sold', 
          description: 'This listing was sold to another buyer. Please refresh to see updated offers.',
        })
        // Auto-refresh offers after 2 seconds
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['offers'] })
        }, 2000)
      } else if (errorMessage.includes('already accepted')) {
        toast({ 
          type: 'error', 
          title: 'Already Accepted', 
          description: 'This offer has already been accepted.',
        })
      } else if (errorMessage.includes('not found')) {
        queryClient.invalidateQueries({ queryKey: ['offers'] })
        toast({ 
          type: 'error', 
          title: 'Offer Not Found', 
          description: 'This offer no longer exists. Refreshing...',
        })
      } else {
        toast({ 
          type: 'error', 
          title: 'Action Failed', 
          description: errorMessage,
        })
      }
    },
  })

  const received = receivedData?.data ?? []
  const sent     = sentData?.data     ?? []
  const offers   = tab === 'received' ? received : sent
  const isLoading = tab === 'received' ? receivedLoading : sentLoading
  const pendingCount = received.filter(o => o.status === 'pending').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Offers</h1>
          <p className="text-sm text-muted-foreground">
            Manage offers on your listings and track offers you've made
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-700">{pendingCount} pending</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {([
          { key: 'received', label: 'Received', count: received.length, pending: pendingCount },
          { key: 'sent',     label: 'Sent',     count: sent.length,     pending: 0 },
        ] as const).map(({ key, label, count, pending }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors',
              tab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn(
                'text-xs font-bold px-1.5 py-0.5 rounded-full',
                pending > 0 && key === 'received'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-muted text-muted-foreground'
              )}>
                {pending > 0 && key === 'received' ? `${pending} new` : count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Offer list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          icon={TrendingDown}
          title={tab === 'received' ? 'No offers received yet' : 'No offers made yet'}
          description={tab === 'received'
            ? 'When buyers make offers on your listings, they\'ll appear here'
            : 'Browse listings and make offers to negotiate prices'}
          action={tab === 'sent' ? { label: 'Browse Listings', href: '/listings' } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {offers.map((offer: Offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              type={tab}
              onAccept={() => actionMut.mutate({ id: offer.id, status: 'accepted' })}
              onReject={() => actionMut.mutate({ id: offer.id, status: 'rejected' })}
              isActing={actionMut.isPending && (actionMut.variables as any)?.id === offer.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface OfferCardProps {
  offer: Offer
  type: Tab
  onAccept: () => void
  onReject: () => void
  isActing: boolean
}

function OfferCard({ offer, type, onAccept, onReject, isActing }: OfferCardProps) {
  const status = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.pending
  const saving = offer.listing
    ? Math.round(((offer.listing.price - offer.offerPrice) / offer.listing.price) * 100)
    : 0

  return (
    <div className={cn(
      'rounded-xl border bg-card p-5 transition-all',
      offer.status === 'pending' ? 'border-amber-200/60 bg-amber-50/20' : ''
    )}>
      <div className="flex gap-4">
        {/* Listing image */}
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-muted shrink-0">
          {offer.listing?.images?.[0] ? (
            <img src={offer.listing.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link
              href={offer.listingId ? `/listings/${offer.listingId}` : '#'}
              className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors"
            >
              {offer.listing?.title ?? `Listing #${offer.listingId?.slice(0, 8)}`}
            </Link>
            <span className={cn('shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full border', status.cls)}>
              {status.label}
            </span>
          </div>

          {/* Price details */}
          <div className="flex items-center gap-3 mb-2">
            <div>
              <p className="text-xs text-muted-foreground">Offer price</p>
              <p className="text-lg font-extrabold text-primary">{formatPrice(offer.offerPrice)}</p>
            </div>
            {offer.listing && (
              <>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Listed at</p>
                  <p className="text-sm font-semibold line-through text-muted-foreground">
                    {formatPrice(offer.listing.price)}
                  </p>
                </div>
                {saving > 0 && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    {saving}% off
                  </span>
                )}
              </>
            )}
          </div>

          {offer.message && (
            <p className="text-xs text-muted-foreground italic mb-2 line-clamp-2">
              "{offer.message}"
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(offer.createdAt)}
            </span>
            {type === 'received' && offer.buyer && (
              <span>from {offer.buyer.name ?? 'Buyer'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions — only for received pending offers */}
      {type === 'received' && offer.status === 'pending' && (
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <button
            onClick={onAccept}
            disabled={isActing}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1B4332] text-white text-sm font-bold hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
          >
            {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Accept
          </button>
          <button
            onClick={onReject}
            disabled={isActing}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" /> Decline
          </button>
          <Link
            href={`/chat`}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> Chat
          </Link>
        </div>
      )}
    </div>
  )
}
