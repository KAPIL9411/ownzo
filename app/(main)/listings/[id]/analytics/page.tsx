'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { ListingService } from '@/frontend/services/listing.service'
import { ApiService } from '@/frontend/services/api.service'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/frontend/components/ui/button'
import { formatPrice, formatRelativeTime, formatDate } from '@/frontend/lib/utils'
import {
  Eye, Heart, MessageCircle, TrendingUp, BarChart2,
  ArrowLeft, Package, Users, ArrowUpRight, ArrowDownRight, Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/frontend/lib/utils'

interface AnalyticsData {
  views:         number
  wishlistCount: number
  chatCount:     number
  offerCount:    number
  viewHistory:   { date: string; views: number }[]
}

export default function ListingAnalyticsPage() {
  const { id: listingId } = useParams() as { id: string }
  const { user } = useAuth()

  const { data: listingData, isLoading: listingLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn:  () => ListingService.getListingById(listingId),
  })

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', listingId],
    queryFn:  () => ApiService.get<AnalyticsData>(`/listings/${listingId}/analytics`),
  })

  const listing   = listingData?.data
  const analytics = analyticsData as AnalyticsData | undefined
  const isOwner   = user?.id === listing?.sellerId

  if (listingLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }
  if (!isOwner) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-muted-foreground">You can only view analytics for your own listings.</p>
        <Button asChild className="mt-4"><Link href="/listings/my">My Listings</Link></Button>
      </div>
    )
  }

  const stats = [
    { label: 'Total Views',     value: analytics?.views         ?? listing?.views         ?? 0, icon: Eye,            color: 'text-blue-500',   bg: 'bg-blue-50'   },
    { label: 'Saved',           value: analytics?.wishlistCount ?? listing?.wishlistCount ?? 0, icon: Heart,          color: 'text-red-500',    bg: 'bg-red-50'    },
    { label: 'Chats Started',   value: analytics?.chatCount     ?? 0,                           icon: MessageCircle,  color: 'text-green-500',  bg: 'bg-green-50'  },
    { label: 'Offers Received', value: analytics?.offerCount    ?? 0,                           icon: TrendingUp,     color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  // Simple bar chart using divs
  const history   = analytics?.viewHistory ?? []
  const maxViews  = Math.max(...history.map(h => h.views), 1)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/listings/${listingId}`}><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h1 className="section-title">Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{listing?.title}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/listings/${listingId}/edit`}>Edit Listing</Link>
        </Button>
      </div>

      {/* Listing preview */}
      {listing && (
        <div className="flex gap-3 p-4 rounded-xl border bg-card">
          <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0">
            {listing.images?.[0]
              ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
              : <Package className="h-8 w-8 text-muted-foreground/30 m-3" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm line-clamp-1">{listing.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-primary font-bold">{formatPrice(listing.price)}</p>
              <span className={cn(
                'text-[11px] font-bold px-2 py-0.5 rounded-full capitalize',
                listing.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
              )}>
                {listing.status}
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>Listed {formatRelativeTime(listing.createdAt)}</p>
            {listing.expiresAt && <p>Expires {formatDate(listing.expiresAt)}</p>}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center mb-3', bg)}>
              <Icon className={cn('h-5 w-5', color)} />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* View history chart */}
      {analyticsLoading ? (
        <div className="rounded-xl border bg-card p-6 flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : history.length > 0 ? (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" /> Views Over Time (last 30 days)
          </h2>
          <div className="flex items-end gap-1.5 h-32">
            {history.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full rounded-t-sm bg-primary/20 hover:bg-primary/50 transition-colors cursor-default"
                  style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: 2 }}
                />
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10">
                  {day.views} views
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{history[0]?.date}</span>
            <span>{history[history.length - 1]?.date}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" /> Views Over Time
          </h2>
          <div className="text-center py-8">
            <BarChart2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              View history will appear as your listing gets traffic
            </p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-bold text-sm mb-3">💡 Tips to improve performance</h2>
        <div className="space-y-2">
          {[
            { done: (listing?.images?.length ?? 0) >= 3,     tip: 'Add at least 3 high-quality photos'        },
            { done: (listing?.description?.length ?? 0) > 100, tip: 'Write a detailed description (100+ chars)' },
            { done: !!listing?.negotiable,                    tip: 'Enable negotiation to attract more buyers'  },
            { done: !!listing?.locality,                      tip: 'Add your locality for better local reach'   },
          ].map(({ done, tip }) => (
            <div key={tip} className={cn('flex items-center gap-2.5 text-sm', done ? 'text-muted-foreground' : 'text-foreground')}>
              <div className={cn('h-5 w-5 rounded-full flex items-center justify-center shrink-0',
                done ? 'bg-green-100' : 'bg-amber-100'
              )}>
                {done
                  ? <ArrowUpRight className="h-3 w-3 text-green-600" />
                  : <ArrowDownRight className="h-3 w-3 text-amber-600" />
                }
              </div>
              <span className={done ? 'line-through opacity-50' : ''}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
