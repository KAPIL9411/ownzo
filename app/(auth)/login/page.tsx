'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Tag, ShieldCheck, MessageCircle, Star, TrendingDown, ArrowRight } from 'lucide-react'

const FEATURES = [
  { icon: ShieldCheck, text: 'Verified community members only' },
  { icon: MessageCircle, text: 'Real-time chat with sellers' },
  { icon: TrendingDown, text: 'Negotiate & make offers' },
  { icon: Star, text: 'Trusted ratings & reviews' },
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
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Left — crimson branding panel (matches reference hero) ── */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#7C1D1D] text-white relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[300px] font-black text-white/5 leading-none">O</span>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <img 
            src="/images/logo/logo.webp" 
            alt="Ownzo" 
            className="h-9 w-9 object-contain"
          />
          <span className="text-2xl font-extrabold">Ownzo</span>
        </div>

        <div className="relative z-10">
          <p className="text-[#F97316] text-xs font-bold uppercase tracking-widest mb-4">
            Community Marketplace
          </p>
          <h1 className="text-5xl font-extrabold leading-tight mb-5">
            Buy & Sell within<br />
            your{' '}
            <span className="text-[#F97316]">community</span>
          </h1>
          <p className="text-white/70 text-base mb-10 max-w-sm">
            Discover great deals on second-hand items from students and locals near you.
            Safe, local, and 100% community-first.
          </p>
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-[#F97316]" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} Ownzo. All rights reserved.
        </p>
      </div>

      {/* ── Right — auth panel (clean white like reference) ── */}
      <div className="flex flex-col items-center justify-center p-8 bg-white">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <img 
            src="/images/logo/logo.webp" 
            alt="Ownzo" 
            className="h-10 w-10 object-contain"
          />
          <span className="text-2xl font-extrabold text-[#1B4332]">Ownzo</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-[#1B1B1B] mb-2">Welcome back!</h2>
            <p className="text-gray-500 text-sm">
              Sign in to access your local marketplace
            </p>
          </div>

          {/* Google button — styled like reference's prominent CTA */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:border-[#1B4332]/40 hover:bg-gray-50 transition-all active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? (
              <div className="h-5 w-5 rounded-full border-2 border-[#1B4332] border-t-transparent animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">
              or
            </div>
          </div>

          {/* Green CTA */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#1B4332] text-white font-bold text-sm hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-[11px] text-center text-gray-400 mt-5 leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-[#1B4332]">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-[#1B4332]">Privacy Policy</a>
          </p>

          {/* Mobile features */}
          <div className="lg:hidden mt-10 pt-8 border-t">
            <ul className="space-y-3">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm text-gray-500">
                  <Icon className="h-4 w-4 text-[#1B4332] shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
