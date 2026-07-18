'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Plus, MessageCircle, User } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const TABS = [
  { href: '/',          label: 'Home',    icon: Home         },
  { href: '/listings',  label: 'Browse',  icon: ShoppingBag  },
  { href: '/listings/create', label: 'Sell', icon: Plus, isCTA: true },
  { href: '/chat',      label: 'Chat',    icon: MessageCircle },
  { href: '/profile',   label: 'Profile', icon: User         },
]

export function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return (
    <>
      {/* Spacer so page content isn't hidden behind the tab bar */}
      <div className="md:hidden h-[68px]" />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.07)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-[60px] px-2">
          {TABS.map(({ href, label, icon: Icon, isCTA }) => {
            const isActive =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href.split('?')[0])

            if (isCTA) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center justify-center -mt-6"
                >
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #F97316, #ea6a08)' }}
                  >
                    <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-semibold mt-1 text-orange-500">{label}</span>
                </Link>
              )
            }

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all active:scale-95"
              >
                <div
                  className={cn(
                    'relative flex items-center justify-center w-10 h-7 rounded-xl transition-all',
                    isActive ? 'bg-green-50' : ''
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive ? 'text-[#1B4332]' : 'text-gray-400'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {/* Active dot */}
                  {isActive && (
                    <span
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                      style={{ background: '#1B4332' }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-semibold transition-colors',
                    isActive ? 'text-[#1B4332]' : 'text-gray-400'
                  )}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
