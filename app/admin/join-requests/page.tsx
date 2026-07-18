'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminService } from '@/frontend/services/admin.service'
import { useToast } from '@/frontend/components/ui/toast'
import { CommunityJoinRequest } from '@/shared/types'
import { CheckCircle, XCircle, Loader2, ClipboardList } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'
import { formatRelativeTime } from '@/frontend/lib/utils'

export default function AdminJoinRequestsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-join-requests'],
    queryFn: () => AdminService.getJoinRequests(),
    refetchInterval: 15000,
  })

  const reviewMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      AdminService.reviewJoinRequest(id, action),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-join-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast({ type: 'success', title: `Request ${vars.action}d successfully` })
    },
    onError: () => toast({ type: 'error', title: 'Failed to review request' }),
  })

  const allRequests = data?.data ?? []
  const requests = statusFilter === 'pending'
    ? allRequests.filter((r) => r.status === 'pending')
    : allRequests

  const STATUS_STYLES: Record<string, string> = {
    pending:  'bg-amber-900/40 text-amber-300',
    approved: 'bg-green-900/40 text-green-300',
    rejected: 'bg-red-900/40 text-red-300',
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white">Join Requests</h1>
          <p className="text-sm text-gray-400">{allRequests.filter(r => r.status === 'pending').length} pending</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          {(['pending', 'all'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize',
                statusFilter === s ? 'bg-[#1B4332] text-white border-[#1B4332]' : 'border-gray-700 text-gray-400 hover:border-gray-500'
              )}>
              {s === 'all' ? 'All Requests' : 'Pending Only'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 py-20 flex flex-col items-center gap-3">
          <ClipboardList className="h-12 w-12 text-gray-600" />
          <p className="text-gray-400 font-semibold">
            {statusFilter === 'pending' ? 'No pending requests' : 'No join requests yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: CommunityJoinRequest) => (
            <div key={req.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4 flex items-start gap-4">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {req.userId.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-white text-sm">User: {req.userId.slice(0, 12)}...</p>
                  <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-bold', STATUS_STYLES[req.status] ?? 'bg-gray-800 text-gray-400')}>
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-1">
                  Community: <span className="text-gray-300 font-medium">{req.communityId}</span>
                </p>
                {req.message && (
                  <p className="text-xs text-gray-400 italic">"{req.message}"</p>
                )}
                <p className="text-[11px] text-gray-500 mt-1">{formatRelativeTime(req.createdAt)}</p>
              </div>

              {/* Actions */}
              {req.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => reviewMut.mutate({ id: req.id, action: 'approve' })}
                    disabled={reviewMut.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-900/40 text-green-300 text-xs font-bold hover:bg-green-900/60 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => reviewMut.mutate({ id: req.id, action: 'reject' })}
                    disabled={reviewMut.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/40 text-red-300 text-xs font-bold hover:bg-red-900/60 transition-all disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
