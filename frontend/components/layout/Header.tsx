'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { NotificationService } from '@/frontend/services/notification.service'
import {
  Search, Bell, Menu, X, Heart, MessageCircle,
  Package, LogOut, User, ChevronDown, MapPin, Plus,
  ShoppingCart, ShieldCheck, TrendingDown,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/frontend/lib/utils'
import { LocationHeader } from '@/frontend/components/map/LocationHeader'

/* ── Reference image nav: Browse | What's New | Deals | Communities | Support ── */
const NAV_LINKS = [
  { href: '/listings',                label: 'Browse' },
  { href: '/listings?sortBy=recent',  label: "What's New" },
  { href: '/listings?sortBy=popular', label: 'Deals' },
  { href: '/community',               label: 'Communities' },
  { href: '/chat',                    label: 'Support' },
]

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const pathname   = usePathname()
  const router     = useRouter()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const profileRef = useRef<HTMLDivElement>(null)

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn:  () => NotificationService.getNotifications(),
    enabled:  isAuthenticated,
    refetchInterval: 30000,
  })
  const unreadCount = notifData?.data?.unreadCount ?? 0

  useEffect(() => {
    function h(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileOpen(false)
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100"
              style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="container">

          {/* ══════════════════════════════════════════════════
              ROW 1 — Logo | Location | Search | Cart | Avatar
              Matches reference single-row header exactly
              ══════════════════════════════════════════════════ */}
          <div className="flex h-[64px] items-center gap-3">

            {/* Logo — Ownzo logo image only */}
            <Link href="/" className="flex items-center shrink-0">
              <img 
                src="/images/logo/logo.webp" 
                alt="Ownzo" 
                className="h-20 w-20 object-contain"
              />
            </Link>

            {/* Location pill — Live location with auto-fetch */}
            {isAuthenticated && (
              <div className="hidden lg:block ml-1">
                <LocationHeader />
              </div>
            )}

            {/* Search bar — wide pill, matches reference */}
            {isAuthenticated && (
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-2">
                <div className="relative w-full">
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search items, Categories or Brands"
                    className="w-full h-10 rounded-full border border-gray-200 bg-gray-50
                               pl-4 pr-10 text-[13px] placeholder:text-gray-400
                               outline-none focus:border-gray-300 focus:bg-white transition-all"
                  />
                  <button type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Mobile search */}
                  <Link href="/search" className="md:hidden p-2 rounded-full hover:bg-gray-100">
                    <Search className="h-5 w-5 text-gray-600" />
                  </Link>

                  {/* Cart / Wishlist — matches reference's cart icon with orange badge */}
                  <Link href="/wishlist"
                    className="relative p-2 rounded-full hover:bg-gray-50 transition-colors">
                    <ShoppingCart className="h-6 w-6 text-gray-600" />
                    <span className="absolute top-0.5 right-0.5 h-[18px] min-w-[18px] px-1 rounded-full
                                     text-[10px] font-extrabold text-white flex items-center justify-center"
                          style={{ background:'#F97316' }}>
                      0
                    </span>
                  </Link>

                  {/* Avatar — matches reference's circular avatar */}
                  <div className="relative hidden md:block" ref={profileRef}>
                    <button onClick={() => setProfileOpen(o => !o)}
                      className="flex items-center rounded-full border-[2px] border-gray-200
                                 hover:border-gray-300 transition-all overflow-hidden"
                      style={{ padding: 1 }}>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.photoURL ?? ''} alt={user?.name ?? ''} />
                        <AvatarFallback className="text-xs font-bold text-white"
                          style={{ background:'#1B4332' }}>{initials}</AvatarFallback>
                      </Avatar>
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-100
                                      bg-white shadow-2xl py-1.5 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-extrabold truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                        </div>
                        {([
                          { href:'/profile',      icon:User,          label:'My Profile'   },
                          { href:'/listings/my',  icon:Package,       label:'My Listings'  },
                          { href:'/offers',       icon:TrendingDown,  label:'My Offers'    },
                          { href:'/buy-requests/my', icon:ShoppingCart, label:'My Requests'},
                          { href:'/wishlist',     icon:Heart,         label:'Wishlist'     },
                          { href:'/chat',         icon:MessageCircle, label:'Messages'     },
                          { href:'/notifications',icon:Bell,          label:'Notifications'},
                        ] as const).map(({ href, icon: Icon, label }) => (
                          <Link key={href} href={href} onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600
                                       hover:bg-gray-50 hover:text-[#1B4332] transition-colors font-medium">
                            <Icon className="h-4 w-4 text-gray-400" />{label}
                          </Link>
                        ))}
                        {(user as any)?.role === 'admin' && (
                          <Link href="/admin" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold
                                       text-purple-600 hover:bg-purple-50 transition-colors">
                            <ShieldCheck className="h-4 w-4 text-purple-500" /> Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={() => { setProfileOpen(false); logout() }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                                       font-medium text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut className="h-4 w-4" />Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sell CTA — small, not shown in reference but keep as icon */}
                  <Link href="/listings/create"
                    className="hidden sm:flex items-center gap-1.5 rounded-full text-white text-[13px]
                               font-bold px-4 py-2 transition-colors ml-1"
                    style={{ background:'#F97316' }}>
                    <Plus className="h-3.5 w-3.5" />Sell
                  </Link>

                  {/* Mobile hamburger */}
                  <button onClick={() => setMobileOpen(o => !o)}
                    className="md:hidden p-2 rounded-full hover:bg-gray-100">
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                </>
              ) : (
                <Link href="/login"
                  className="rounded-full text-white text-[13px] font-bold px-5 py-2"
                  style={{ background:'#1B4332' }}>
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              ROW 2 — Nav links: Browse | What's New | Deals | Support
              Matches reference second row exactly
              ══════════════════════════════════════════════════ */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-0 border-t border-gray-50 h-10">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  className={cn(
                    'px-5 h-10 flex items-center text-[13px] font-semibold transition-colors border-b-2',
                    pathname === link.href || pathname.startsWith(link.href.split('?')[0])
                      ? 'text-[#1B4332] border-[#1B4332]'
                      : 'text-gray-600 border-transparent hover:text-[#1B4332]'
                  )}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && isAuthenticated && (
        <div className="fixed inset-0 top-[64px] z-40 bg-white overflow-y-auto md:hidden border-t">
          <div className="container py-4 space-y-1">
            {/* Mobile Location */}
            <div className="mb-4">
              <LocationHeader />
            </div>
            
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search items…"
                  className="w-full h-11 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4
                             text-sm outline-none focus:border-[#1B4332]" />
              </div>
            </form>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 mb-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={user?.photoURL ?? ''} />
                <AvatarFallback className="text-sm font-bold text-white"
                  style={{ background:'#1B4332' }}>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-extrabold text-sm">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                {link.label}
              </Link>
            ))}
            {[
              { href:'/listings/create', label:'Sell an Item'    },
              { href:'/chat',            label:'Messages'        },
              { href:'/wishlist',        label:'Wishlist'        },
              { href:'/notifications',   label:'Notifications'  },
              { href:'/profile',         label:'My Profile'     },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                {label}
              </Link>
            ))}
            <div className="border-t mt-2 pt-2">
              <button onClick={() => { setMobileOpen(false); logout() }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50">
                <LogOut className="h-5 w-5" />Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
