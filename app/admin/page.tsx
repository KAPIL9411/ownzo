'use client'

import { useQuery } from '@tanstack/react-query'
import { AdminService } from '@/frontend/services/admin.service'
import { Users, Package, UsersRound, ShoppingBag, ShieldCheck, Ban, ClipboardList, BadgeCheck } from 'lucide-react'
import Link from 'next/link'

function StatCard({
  label, value, icon: Icon, color, href,
}: { label: string; value: number | string; icon: React.ElementType; color: string; href?: string }) {
  const content = (
    <div className={`rounded-2xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-700 transition-all ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center`} style={{ background: color + '22' }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: AdminService.getStats,
    refetchInterval: 30000,
  })

  const stats = data?.data

  const cards = [
    { label: 'Total Users',           value: stats?.totalUsers ?? 0,          icon: Users,       color: '#3b82f6', href: '/admin/users'        },
    { label: 'Total Listings',        value: stats?.totalListings ?? 0,        icon: Package,     color: '#f59e0b'                               },
    { label: 'Active Listings',       value: stats?.activeListings ?? 0,       icon: ShoppingBag, color: '#10b981'                               },
    { label: 'Communities',           value: stats?.totalCommunities ?? 0,     icon: UsersRound,  color: '#8b5cf6', href: '/admin/communities'  },
    { label: 'Verified Users',        value: stats?.verifiedUsers ?? 0,        icon: BadgeCheck,  color: '#06b6d4', href: '/admin/users'        },
    { label: 'Banned Users',          value: stats?.bannedUsers ?? 0,          icon: Ban,         color: '#ef4444', href: '/admin/users'        },
    { label: 'Pending Join Requests', value: stats?.pendingJoinRequests ?? 0,  icon: ClipboardList, color: '#f97316', href: '/admin/join-requests' },
    { label: 'Buy Requests',          value: stats?.totalBuyRequests ?? 0,     icon: ShieldCheck, color: '#1B4332'                               },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm">Platform overview at a glance</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-800 bg-gray-900 p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Manage Users',       href: '/admin/users',         color: '#3b82f6' },
            { label: 'Manage Communities', href: '/admin/communities',   color: '#8b5cf6' },
            { label: 'Review Join Requests', href: '/admin/join-requests', color: '#f97316' },
            { label: 'View Live Site',     href: '/',                    color: '#1B4332' },
          ].map(({ label, href, color }) => (
            <Link
              key={href}
              href={href}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: color }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
