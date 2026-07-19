'use client'

import { Header } from '@/frontend/components/layout/Header'
import { Footer } from '@/frontend/components/layout/Footer'
import { BottomNav } from '@/frontend/components/layout/BottomNav'
import { ErrorBoundary } from '@/frontend/components/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useCallback, useState } from 'react'
import { usePushNotifications } from '@/frontend/hooks/usePushNotifications'
import { useToast } from '@/frontend/components/ui/toast'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handlePush = useCallback((n: { title: string; body: string; url?: string }) => {
    toast({
      type: 'info',
      title: n.title,
      description: n.body,
    })
  }, [toast])

  // Register for push notifications once authenticated
  const { requestPermission } = usePushNotifications(handlePush)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Request push permission after login
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Delay slightly so it doesn't fire on first render
      const t = setTimeout(() => requestPermission(), 3000)
      return () => clearTimeout(t)
    }
  }, [isAuthenticated, isLoading, requestPermission])

  // Still performing the initial Firebase auth check — show minimal skeleton
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <img
              src="/images/logo/logo.webp"
              alt="Ownzo"
              className="h-16 w-16 object-contain"
              style={{ animation: 'breathe 2s ease-in-out infinite' }}
            />
          </div>
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8" viewBox="0 0 40 40" style={{ animation: 'spin 0.9s linear infinite' }}>
              <circle cx="20" cy="20" r="16" fill="none" stroke="#F3F4F6" strokeWidth="3" />
              <circle
                cx="20" cy="20" r="16" fill="none" stroke="#1B4332" strokeWidth="3"
                strokeLinecap="round" strokeDasharray="80" strokeDashoffset="20"
              />
            </svg>
          </div>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes breathe { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(0.93); opacity:0.75; } }
          @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        `}</style>
      </div>
    )
  }

  // Not authenticated and not loading — null while redirect fires
  if (!isAuthenticated) return null

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen bg-white flex flex-col"
        style={{ animation: 'fadeInUp 0.35s ease-out' }}
      >
        {/* Header hidden on mobile (<768px) since mobile hero has logo/search/cart */}
        <div className="hidden md:block">
          <Header />
        </div>
        <main className="container flex-1" style={{ maxWidth: 1400, paddingBottom: '2rem' }}>
          <div className="md:pt-20">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </ErrorBoundary>
  )
}
