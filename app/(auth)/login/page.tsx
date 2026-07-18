'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ShieldCheck, MessageCircle, TrendingDown, Star } from 'lucide-react'

const FEATURES = [
  { icon: ShieldCheck, text: 'Verified community members' },
  { icon: MessageCircle, text: 'Real-time chat with sellers' },
  { icon: TrendingDown, text: 'Best prices & offers' },
  { icon: Star, text: 'Trusted by thousands' },
]

export default function LoginPage() {
  const { signInWithGoogle, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  // If already authenticated, start transition overlay then redirect
  useEffect(() => {
    if (isAuthenticated) {
      setTransitioning(true)
      // Small delay so the overlay is visible before the route changes
      const t = setTimeout(() => router.replace('/'), 300)
      return () => clearTimeout(t)
    }
  }, [isAuthenticated, router])

  async function handleGoogleSignIn() {
    setLoading(true)
    try {
      await signInWithGoogle()
      // If signInWithGoogle resolved without throwing, one of two things happened:
      // 1. Popup succeeded — onAuthStateChanged will fire, isAuthenticated becomes true,
      //    and the useEffect above will trigger the transition overlay + redirect.
      // 2. User closed the popup — signInWithGoogle returns silently, so we reset loading.
      // 3. Popup was blocked — signInWithRedirect was called, page is navigating away.
      //
      // We only reset loading for case 2. Cases 1 & 3 are handled externally.
      if (!transitioning) {
        setLoading(false)
      }
    } catch {
      // Genuine error (e.g. network failure) — reset so the user can retry
      setLoading(false)
    }
  }

  return (
    <>
      {/* Full-screen branded transition overlay - covers the async gap between popup close and app load */}
      {transitioning && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <img
            src="/images/logo/logo.webp"
            alt="Ownzo"
            className="h-16 w-16 object-contain mb-5"
            style={{ animation: 'breathe 1.5s ease-in-out infinite' }}
          />
          <p className="text-sm text-gray-400 font-medium tracking-wide" style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}>
            Taking you in…
          </p>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes breathe { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(0.92); opacity:0.7; } }
          `}</style>
        </div>
      )}

      <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left Panel - Brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-[#7C1D1D] via-[#9B2C2C] to-[#7C1D1D] text-white relative overflow-hidden">
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F97316] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm p-2.5">
              <img 
                src="/images/logo/logo.webp" 
                alt="Ownzo" 
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-3xl font-bold">Ownzo</span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              Community Marketplace
            </div>
            
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
              Buy & Sell<br />
              within your<br />
              <span className="text-[#F97316]">community</span>
            </h1>
            
            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Join thousands of community members buying and selling locally. Safe, sustainable, and simple.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-[#F97316]" />
                </div>
                <span className="text-sm font-medium text-white/90">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-white/60">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm text-white/60">Items Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-white/60">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Ownzo. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-white">

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-10">
          <div className="h-16 w-16 rounded-2xl bg-[#7C1D1D] p-3 mb-4 shadow-lg shadow-[#7C1D1D]/20">
            <img 
              src="/images/logo/logo.webp" 
              alt="Ownzo" 
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-[#7C1D1D]">Ownzo</span>
        </div>

        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to continue to your marketplace</p>
          </div>

          {/* Sign in buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-[#7C1D1D] text-white font-semibold hover:bg-[#9B2C2C] transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#7C1D1D]/20"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>Get Started</span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Quick & Secure</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {[
              'Free to list items',
              'Connect with local buyers & sellers',
              'Secure & trusted platform',
              'Community verified members'
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-sm text-gray-700">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {benefit}
              </div>
            ))}
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-gray-500 mt-8 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/legal/terms" className="underline hover:text-gray-900">Terms of Service</a>
            {' '}and{' '}
            <a href="/legal/privacy" className="underline hover:text-gray-900">Privacy Policy</a>
          </p>

          {/* Mobile features */}
          <div className="lg:hidden mt-10 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">10K+</div>
                <div className="text-xs text-gray-600">Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">50K+</div>
                <div className="text-xs text-gray-600">Listings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">98%</div>
                <div className="text-xs text-gray-600">Happy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
