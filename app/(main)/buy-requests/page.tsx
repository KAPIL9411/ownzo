'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { BuyRequestService } from '@/frontend/services/buyrequest.service'
import { CategoryService } from '@/frontend/services/category.service'
import { Button } from '@/frontend/components/ui/button'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { useToast } from '@/frontend/components/ui/toast'
import { formatPrice, formatRelativeTime } from '@/frontend/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Clock, Tag, Users, ArrowRight, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/frontend/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { ApiService } from '@/frontend/services/api.service'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  fulfilled: 'bg-blue-100 text-blue-700',
  expired: 'bg-gray-100 text-gray-500',
}

export default function BuyRequestsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [categoryFilter, setCategoryFilter] = useState('')
  const [responding, setResponding] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['buy-requests', categoryFilter],
    queryFn: () => BuyRequestService.getBuyRequests({ categoryId: categoryFilter || undefined }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryService.getCategories(),
  })

  const respondMut = useMutation({
    mutationFn: (reqId: string) => ApiService.post(`/buy-request/${reqId}/respond`, {}),
    onSuccess: (res: any) => {
      const chatId = res?.data?.chatId
      toast({ type: 'success', title: 'Response sent!', description: 'Opening chat with the buyer…' })
      router.push(`/chat?chatId=${chatId}`)
    },
    onError: () => toast({ type: 'error', title: 'Failed to respond. Try again.' }),
    onSettled: () => setResponding(null),
  })

  const requests = data?.data?.data ?? []
  const total = data?.data?.total ?? 0
  const categories = categoriesData?.data ?? []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="section-title">Buy Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? 'Loading…' : `${total} active requests`} — sellers can respond directly
          </p>
        </div>
        <Button asChild className="sm:ml-auto">
          <Link href="/buy-requests/create">
            <Plus className="h-4 w-4 mr-2" /> Post a Request
          </Link>
        </Button>
      </div>

      {/* Info banner */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
        <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-sm">How Buy Requests work</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Post what you're looking for with your budget. Sellers who have it will reach out to you directly.
          </p>
        </div>
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setCategoryFilter('')}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
              !categoryFilter ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
            )}
          >All</button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
                categoryFilter === c.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
              )}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Requests grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-8 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No buy requests yet"
          description="Be the first to post what you're looking for"
          action={{ label: 'Post a Buy Request', href: '/buy-requests/create' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border bg-card p-5 hover:border-primary/40 transition-all card-hover flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_STYLES[req.status] ?? 'bg-muted text-muted-foreground')}>
                  {req.status}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />{formatRelativeTime(req.createdAt)}
                </span>
              </div>

              <h3 className="font-semibold mb-1.5 line-clamp-2 leading-snug">{req.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{req.description}</p>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-bold text-primary">
                    {formatPrice(req.budget)}
                    {req.negotiable && <span className="text-xs font-normal text-muted-foreground ml-1">(Negotiable)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{req.city}</span>
                </div>
              </div>

              {req.userId !== user?.id && (
                <Button
                  size="sm"
                  className="w-full"
                  disabled={responding === req.id || respondMut.isPending}
                  onClick={() => { setResponding(req.id); respondMut.mutate(req.id) }}
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  {responding === req.id ? 'Sending…' : "I Have This"}
                </Button>
              )}
              {req.userId === user?.id && (
                <p className="text-xs text-center text-muted-foreground">Your request · {req.responseCount} response{req.responseCount !== 1 ? 's' : ''}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
