'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ShieldCheck, MessageCircle, Star, TrendingDown, Package, Users, Check } from 'lucide-react'
import Image from 'next/image'

const FEATURES = [
  { icon: ShieldCheck, text: 'Verified community members', color: 'bg-emerald-500/10 text-emerald-600' },
  { icon: MessageCircle, text: 'Real-time chat with sellers', color: 'bg-blue-500/10 text-blue-600' },
  { icon: TrendingDown, text: 'Negotiate & make offers', color: 'bg-orange-500/10 text-orange-600' },
  { icon: Star, text: 'Trusted ratings & reviews', color: 'bg-yellow-500/10 text-yellow-600' },
]

const STATS = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Items Listed' },
  { value: '98%', label: 'Satisfaction' },
]

export default function LoginPage() {
  const { signInWithGoogle, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) router.replace('/')
  }, [isAuthenticated, router])

  async function handleGoogleSignIn() {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-5 bg-gradient-to-br from-slate-50 via-white to-slate-50">

      {/* ─── Left Panel: Hero/Branding (3 columns on desktop) ─── */}
      <div className="hidden lg:flex lg:col-span-3 flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#1B4332] text-white relative overflow-hidden">
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-[url('/images/hero/texture-maroon-swirl.svg')] opacity-5" />
        
        {/* Floating shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm p-2 flex items-center justify-center">
            <img 
              src="/images/logo/logo.webp" 
              alt="Ownzo" 
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-3xl font-black tracking-tight">Ownzo</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <Package className="h-4 w-4 text-[#F97316]" />
            <span className="text-sm font-semibold">Community Marketplace</span>
          </div>
          
          <h1 className="text-6xl xl:text-7xl font-black leading-[1.1] mb-6 bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent">
            Buy & Sell within your community
          </h1>
          
          <p className="text-xl text-white/80 mb-12 leading-relaxed max-w-xl">
            Join thousands of community members buying and selling locally. Safe, sustainable, and simple.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {FEATURES.map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-black text-white mb-1">{value}</div>
                <div className="text-sm text-white/60">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/40 text-sm">
          © {new Date().getFullYear()} Ownzo. All rights reserved.
        </p>
      </div>

      {/* ─── Right Panel: Login Form (2 columns on desktop) ─── */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 sm:p-12">

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-12">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] p-3 mb-4 shadow-lg">
            <img 
              src="/images/logo/logo.webp" 
              alt="Ownzo" 
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-3xl font-black text-[#1B4332]">Ownzo</span>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 mb-3">Welcome back</h2>
            <p className="text-slate-600 text-base">
              Sign in to access your local marketplace
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 font-semibold text-base hover:border-[#1B4332] hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm hover:shadow-md mb-6"
          >
            {loading ? (
              <div className="h-5 w-5 rounded-full border-2 border-[#1B4332] border-t-transparent animate-spin" />
            ) : (
              <>
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Benefits */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-[#1B4332]" />
              <h3 className="font-bold text-slate-900">Why join Ownzo?</h3>
            </div>
            <ul className="space-y-3">
              {['Free to list items', 'Connect with local buyers', 'Secure transactions', 'Community verified'].map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-[#1B4332] flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-slate-500 mt-8 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/legal/terms" className="underline hover:text-[#1B4332] transition-colors">Terms</a>
            {' '}and{' '}
            <a href="/legal/privacy" className="underline hover:text-[#1B4332] transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
