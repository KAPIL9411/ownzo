'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminService } from '@/frontend/services/admin.service'
import { useToast } from '@/frontend/components/ui/toast'
import { Community, CommunityType } from '@/shared/types'
import {
  Plus, Trash2, BadgeCheck, X, CheckCircle2, Loader2,
  GraduationCap, Building2, MapPin, Home, Lock, LockOpen,
} from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

const TYPE_ICONS: Record<CommunityType, React.ElementType> = {
  college: GraduationCap, locality: MapPin, apartment: Building2, society: Home,
}
const TYPE_COLORS: Record<CommunityType, string> = {
  college: '#3b82f6', locality: '#16a34a', apartment: '#f97316', society: '#8b5cf6',
}

type CreateForm = {
  name: string; type: CommunityType; city: string
  college: string; description: string; requiresApproval: boolean; verified: boolean
}
const DEFAULT_FORM: CreateForm = {
  name: '', type: 'locality', city: '', college: '',
  description: '', requiresApproval: false, verified: false,
}

export default function AdminCommunitiesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<CreateForm>(DEFAULT_FORM)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-communities'],
    queryFn: AdminService.getCommunities,
  })

  const createMut = useMutation({
    mutationFn: (d: CreateForm) => AdminService.createCommunity({ ...d, college: d.college || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast({ type: 'success', title: 'Community created!' })
      setShowCreate(false); setForm(DEFAULT_FORM)
    },
    onError: () => toast({ type: 'error', title: 'Failed to create community' }),
  })

  const actionMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: any }) =>
      AdminService.communityAction(id, action),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-communities'] }); toast({ type: 'success', title: 'Updated' }) },
    onError: () => toast({ type: 'error', title: 'Action failed' }),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => AdminService.deleteCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast({ type: 'success', title: 'Community deleted' })
    },
    onError: () => toast({ type: 'error', title: 'Failed to delete' }),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Community> }) =>
      AdminService.updateCommunity(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-communities'] }); toast({ type: 'success', title: 'Updated' }) },
    onError: () => toast({ type: 'error', title: 'Update failed' }),
  })

  const communities = data?.data ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Communities</h1>
          <p className="text-sm text-gray-400">{communities.length} communities</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B4332] text-white text-sm font-bold hover:bg-[#2D6A4F] transition-all"
        >
          <Plus className="h-4 w-4" /> Create Community
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">New Community</h3>
            <button onClick={() => setShowCreate(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'name',        label: 'Name *',        type: 'text'  },
              { key: 'city',        label: 'City *',        type: 'text'  },
              { key: 'college',     label: 'College/Area',  type: 'text'  },
              { key: 'description', label: 'Description',   type: 'text'  },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                <input
                  type={type} value={(form as any)[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-gray-600 bg-gray-700 text-white px-3 text-sm outline-none focus:border-gray-400"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Type *</label>
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as CommunityType }))}
                className="w-full h-9 rounded-lg border border-gray-600 bg-gray-700 text-white px-3 text-sm outline-none">
                {(['college','locality','apartment','society'] as CommunityType[]).map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            {[
              { key: 'verified',         label: 'Mark as Verified'         },
              { key: 'requiresApproval', label: 'Require Join Approval'    },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={(form as any)[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.checked }))}
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.name || !form.city}
              className="px-5 py-2 rounded-xl bg-[#1B4332] text-white text-sm font-bold hover:bg-[#2D6A4F] disabled:opacity-50">
              {createMut.isPending ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => { setShowCreate(false); setForm(DEFAULT_FORM) }}
              className="px-5 py-2 rounded-xl bg-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Communities table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      ) : (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Community','Type','City','Members','Verified','Approval','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {communities.map((c: Community) => {
                const Icon = TYPE_ICONS[c.type] ?? MapPin
                const color = TYPE_COLORS[c.type] ?? '#9ca3af'
                return (
                  <tr key={c.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + '22' }}>
                          <Icon className="h-4 w-4" style={{ color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{c.name}</p>
                          {c.college && <p className="text-[11px] text-gray-400">{c.college}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 capitalize text-xs">{c.type}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{c.city}</td>
                    <td className="px-4 py-3 text-white font-semibold">{c.members}</td>
                    <td className="px-4 py-3">
                      {c.verified
                        ? <CheckCircle2 className="h-4 w-4 text-blue-400" />
                        : <X className="h-4 w-4 text-gray-600" />}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateMut.mutate({ id: c.id, data: { requiresApproval: !c.requiresApproval } })}
                        className={cn('flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-all',
                          c.requiresApproval ? 'bg-amber-900/40 text-amber-400' : 'bg-gray-800 text-gray-400 hover:bg-amber-900/40 hover:text-amber-400')}
                      >
                        {c.requiresApproval ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                        {c.requiresApproval ? 'Approval ON' : 'Open'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => actionMut.mutate({ id: c.id, action: c.verified ? 'unverify' : 'verify' })}
                          disabled={actionMut.isPending}
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-900/30 transition-colors"
                          title={c.verified ? 'Remove verification' : 'Verify'}
                        >
                          <BadgeCheck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete "${c.name}"? This cannot be undone.`)) deleteMut.mutate(c.id) }}
                          disabled={deleteMut.isPending}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {communities.length === 0 && <div className="py-16 text-center text-gray-500">No communities yet</div>}
        </div>
      )}
    </div>
  )
}
