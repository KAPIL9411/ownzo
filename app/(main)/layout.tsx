'use client'

import { Header } from '@/frontend/components/layout/Header'
import { Footer } from '@/frontend/components/layout/Footer'
import { ErrorBoundary } from '@/frontend/components/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useCallback } from 'react'
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          {/* Logo with subtle scale animation */}
          <div className="relative">
            <img 
              src="/images/logo/logo.webp" 
              alt="Ownzo"
              className="h-20 w-20 object-contain"
              style={{
                animation: 'breathe 2s ease-in-out infinite'
              }}
            />
          </div>

          {/* Perfect minimal spinner - single rotating arc */}
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10" viewBox="0 0 40 40" style={{ animation: 'spin 1s linear infinite' }}>
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#F3F4F6"
                strokeWidth="3"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#1B4332"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="80"
                strokeDashoffset="20"
              />
            </svg>
          </div>
        </div>

        {/* CSS Keyframes */}
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.95); opacity: 0.8; }
          }
        `}</style>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="container flex-1" style={{ maxWidth: 1400, paddingTop: '5rem', paddingBottom: '2rem' }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}
