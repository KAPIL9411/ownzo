'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminService } from '@/frontend/services/admin.service'
import { useToast } from '@/frontend/components/ui/toast'
import { User } from '@/shared/types'
import {
  Search, Ban, ShieldCheck, RefreshCw, BadgeCheck,
  MoreVertical, User as UserIcon, X, CheckCircle2, Loader2,
} from 'lucide-react'
import { cn } from '@/frontend/lib/utils'
import { TrustScoreBadge } from '@/frontend/components/verification/VerificationBadge'

type ActionMenu = { userId: string; x: number; y: number } | null

export default function AdminUsersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [actionMenu, setActionMenu] = useState<ActionMenu>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => AdminService.getUsers(200),
  })

  const mutation = useMutation({
    mutationFn: ({ userId, action, payload }: { userId: string; action: any; payload?: any }) =>
      AdminService.userAction(userId, action, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast({ type: 'success', title: `Action "${vars.action}" applied successfully` })
    },
    onError: () => toast({ type: 'error', title: 'Action failed' }),
  })

  const users = (data?.data ?? []).filter((u) =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  function act(userId: string, action: any, payload?: any) {
    setActionMenu(null)
    mutation.mutate({ userId, action, payload })
  }

  return (
    <div className="space-y-5" onClick={() => setActionMenu(null)}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white">Users</h1>
          <p className="text-sm text-gray-400">{users.length} users</p>
        </div>
        <div className="sm:ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="h-9 rounded-lg border border-gray-700 bg-gray-800 text-white pl-9 pr-4
                       text-sm placeholder:text-gray-500 outline-none focus:border-gray-500 w-64"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['User', 'Role', 'Trust Score', 'Status', 'Verified', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                  {/* User info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[11px] font-bold uppercase',
                      user.role === 'admin'     ? 'bg-purple-900/50 text-purple-300' :
                      user.role === 'moderator' ? 'bg-blue-900/50 text-blue-300'    :
                                                  'bg-gray-800 text-gray-400'
                    )}>
                      {user.role ?? 'user'}
                    </span>
                  </td>

                  {/* Trust score */}
                  <td className="px-4 py-3">
                    <TrustScoreBadge trustScore={user.trustScore ?? 0} showLabel={false} />
                  </td>

                  {/* Banned */}
                  <td className="px-4 py-3">
                    {user.isBanned ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-900/50 text-red-300">Banned</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-900/50 text-green-300">Active</span>
                    )}
                  </td>

                  {/* Verified */}
                  <td className="px-4 py-3">
                    {(user.isVerified || user.verified) ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    ) : (
                      <X className="h-4 w-4 text-gray-600" />
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = (e.target as HTMLElement).getBoundingClientRect()
                        setActionMenu(
                          actionMenu?.userId === user.id
                            ? null
                            : { userId: user.id, x: rect.left, y: rect.bottom + 8 }
                        )
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {actionMenu?.userId === user.id && (
                      <div
                        className="absolute right-4 top-10 z-50 w-52 rounded-xl border border-gray-700 bg-gray-800 shadow-2xl py-1 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[
                          { label: user.isBanned ? 'Unban User' : 'Ban User', action: user.isBanned ? 'unban' : 'ban', icon: Ban, color: 'text-red-400', payload: user.isBanned ? {} : { reason: 'Violated platform rules' } },
                          { label: (user.isVerified || user.verified) ? 'Remove Verification' : 'Verify User', action: (user.isVerified || user.verified) ? 'unverify' : 'verify', icon: BadgeCheck, color: 'text-blue-400' },
                          { label: 'Recalculate Trust', action: 'recalculate-trust', icon: RefreshCw, color: 'text-green-400' },
                          { label: 'Make Admin', action: 'set-role', icon: ShieldCheck, color: 'text-purple-400', payload: { role: 'admin' } },
                          { label: 'Make User', action: 'set-role', icon: UserIcon, color: 'text-gray-400', payload: { role: 'user' } },
                        ].map(({ label, action, icon: Icon, color, payload }) => (
                          <button
                            key={action + label}
                            onClick={() => act(user.id, action, payload)}
                            disabled={mutation.isPending}
                            className={cn(
                              'flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50',
                              color
                            )}
                          >
                            <Icon className="h-4 w-4" /> {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="py-16 text-center text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  )
}
