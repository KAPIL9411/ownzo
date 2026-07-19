'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import {
  LayoutDashboard, Users, UsersRound, ClipboardList,
  LogOut, Menu, X, ShieldCheck, ChevronRight, FileCheck,
} from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

const NAV = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Dashboard'   },
  { href: '/admin/users',      icon: Users,           label: 'Users'       },
  { href: '/admin/communities',icon: UsersRound,      label: 'Communities' },
  { href: '/admin/listings',   icon: FileCheck,       label: 'Listings'    },
  { href: '/admin/join-requests', icon: ClipboardList, label: 'Join Requests' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) { router.replace('/login'); return }
      if ((user as any)?.role !== 'admin') { router.replace('/'); return }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || (user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <ShieldCheck className="h-12 w-12 text-[#1B4332] mx-auto mb-3 animate-pulse" />
          <p className="text-white font-semibold">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'A'

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-200',
        'lg:translate-x-0 lg:static',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#1B4332] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm">Ownzo Admin</p>
            <p className="text-xs text-gray-400">Control Panel</p>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  active
                    ? 'bg-[#1B4332] text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg
                         bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold transition-all"
            >
              View Site
            </Link>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg
                         bg-red-900/40 text-red-400 hover:bg-red-900/60 text-xs font-semibold transition-all"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Overlay (mobile) ───────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-200">
              {NAV.find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label ?? 'Admin'}
            </p>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
