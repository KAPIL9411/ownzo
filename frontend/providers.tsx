'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ToastProvider } from '@/frontend/components/ui/toast'
import { useAuthStore } from '@/store/auth.store'

/* ─────────────────────────────────────────────────────────────────────────────
   GlobalAuthOverlay
   Rendered ABOVE the route tree so it survives the login → app navigation.
   Driven by isAuthenticating in Zustand (not persisted, defaults false).
   ───────────────────────────────────────────────────────────────────────────── */
function GlobalAuthOverlay() {
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating)

  if (!isAuthenticating) return null

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
      style={{ background: '#0D1F17', animation: 'gaoFadeIn 0.2s ease-out' }}
    >
      <img
        src="/images/logo/logo.webp"
        alt="Ownzo"
        className="h-14 w-14 object-contain mb-5"
        style={{ animation: 'gaoPulse 1.4s ease-in-out infinite' }}
      />
      {/* Three bouncing dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full"
            style={{
              background: '#F97316',
              animation: `gaoBounce 1.1s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes gaoFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes gaoPulse   { 0%,100% { transform:scale(1);    opacity:1   }
                                50%      { transform:scale(0.88); opacity:0.7 } }
        @keyframes gaoBounce  { 0%,100% { transform:translateY(0)  }
                                50%      { transform:translateY(-7px) } }
      `}</style>
    </div>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <GlobalAuthOverlay />
        {children}
      </ToastProvider>
    </QueryClientProvider>
  )
}

