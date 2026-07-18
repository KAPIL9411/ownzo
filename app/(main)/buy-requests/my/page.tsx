'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BuyRequestService } from '@/frontend/services/buyrequest.service'
import { ApiService } from '@/frontend/services/api.service'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/frontend/components/ui/toast'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { Button } from '@/frontend/components/ui/button'
import { formatPrice, formatRelativeTime } from '@/frontend/lib/utils'
import { BuyRequest } from '@/shared/types'
import {
  Package, Plus, Pencil, Trash2, Clock,
  MapPin, Users, CheckCircle, X, Loader2,
} from 'lucide-react'
import { cn } from '@/frontend/lib/utils'
import Link from 'next/link'

const STATUS_CONFIG = {
  active:    { label: 'Active',    cls: 'bg-green-50 text-green-700 border-green-200'  },
  fulfilled: { label: 'Fulfilled', cls: 'bg-blue-50 text-blue-700 border-blue-200'    },
  expired:   { label: 'Expired',   cls: 'bg-gray-50 text-gray-500 border-gray-200'    },
  deleted:   { label: 'Deleted',   cls: 'bg-red-50 text-red-500 border-red-200'       },
}

export default function MyBuyRequestsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-buy-requests'],
    queryFn: async () => {
      // Filter buy requests by current user using the API
      const res = await BuyRequestService.getBuyRequests({ limit: 100 })
      const all = res.data?.data ?? []
      return all.filter((r: BuyRequest) => r.userId === user?.id)
    },
    enabled: !!user?.id,
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => BuyRequestService.deleteBuyRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-buy-requests'] })
      toast({ type: 'success', title: 'Buy request deleted' })
      setDeletingId(null)
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to delete' })
      setDeletingId(null)
    },
  })

  const markFulfilledMut = useMutation({
    mutationFn: (id: string) => ApiService.patch(`/buy-requests/${id}`, { status: 'fulfilled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-buy-requests'] })
      toast({ type: 'success', title: 'Marked as fulfilled!' })
    },
    onError: () => toast({ type: 'error', title: 'Failed to update' }),
  })

  const requests = data ?? []
  const activeCount = requests.filter((r: BuyRequest) => r.status === 'active').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">My Buy Requests</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} active · {requests.length} total
          </p>
        </div>
        <Button asChild>
          <Link href="/buy-requests/create">
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No buy requests yet"
          description="Post what you're looking for and let sellers come to you"
          action={{ label: 'Post a Request', href: '/buy-requests/create' }}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req: BuyRequest) => {
            const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.active
            return (
              <div key={req.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm line-clamp-1">{req.title}</h3>
                      <span className={cn('shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full border', status.cls)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{req.description}</p>
                  </div>
                  <p className="text-xl font-extrabold text-primary shrink-0">
                    {formatPrice(req.budget)}
                    {req.negotiable && <span className="text-xs font-normal text-muted-foreground ml-1">±</span>}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.city}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{req.responseCount} responses</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(req.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {req.status === 'active' && (
                    <>
                      <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
                        <Link href={`/buy-requests/edit/${req.id}`}>
                          <Pencil className="h-3 w-3 mr-1.5" /> Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => markFulfilledMut.mutate(req.id)}
                        disabled={markFulfilledMut.isPending}
                      >
                        <CheckCircle className="h-3 w-3 mr-1.5" />
                        {markFulfilledMut.isPending && markFulfilledMut.variables === req.id ? 'Updating…' : 'Mark Fulfilled'}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Delete this buy request?')) {
                        setDeletingId(req.id)
                        deleteMut.mutate(req.id)
                      }
                    }}
                    disabled={deleteMut.isPending && deletingId === req.id}
                  >
                    {deleteMut.isPending && deletingId === req.id
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Trash2 className="h-3 w-3" />
                    }
                  </Button>
                  <Link
                    href={`/buy-requests?highlight=${req.id}`}
                    className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors px-2"
                  >
                    View public →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
