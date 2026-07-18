'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// ── Micro-stats shown on the brand panel ───────────────────────────────────
const STATS = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Items Listed' },
  { value: '98%',  label: 'Satisfaction' },
]

// ── Trust signals shown on the form panel ─────────────────────────────────
const TRUST = [
  'No spam, ever',
  'End-to-end verified sellers',
  'Cancel anytime',
]

export default function LoginPage() {
  const { signInWithGoogle, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading]           = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      setTransitioning(true)
      const t = setTimeout(() => router.replace('/'), 350)
      return () => clearTimeout(t)
    }
  }, [isAuthenticated, router])

  async function handleGoogleSignIn() {
    setLoading(true)
    try {
      await signInWithGoogle()
      if (!transitioning) setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Transition overlay ─────────────────────────────────────────── */}
      {transitioning && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: '#0D1F17', animation: 'fadeIn 0.25s ease-out' }}
        >
          <img
            src="/images/logo/logo.webp"
            alt="Ownzo"
            className="h-16 w-16 object-contain mb-4"
            style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
          />
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-orange-400"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <style>{`
            @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
            @keyframes pulse   { 0%,100% { transform:scale(1) } 50% { transform:scale(0.9) } }
            @keyframes bounce  { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
          `}</style>
        </div>
      )}

      {/* ── Main split layout ──────────────────────────────────────────── */}
      <div className="min-h-screen flex">

        {/* ── LEFT — Brand panel ──────────────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden"
          style={{ background: '#0D1F17' }}
        >
          {/* Subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 60% 40%, rgba(249,115,22,0.12) 0%, transparent 70%)',
            }}
          />

          {/* Grid texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-14">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
              >
                <img src="/images/logo/logo.webp" alt="Ownzo" className="h-7 w-7 object-contain" />
              </div>
              <span className="text-white text-xl font-bold tracking-tight">Ownzo</span>
            </div>

            {/* Hero text — centred vertically */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Tag */}
              <div
                className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase"
                style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316', border: '1px solid rgba(249,115,22,0.25)' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                Community Marketplace
              </div>

              <h1
                className="text-5xl xl:text-6xl font-extrabold leading-[1.08] text-white mb-6"
                style={{ letterSpacing: '-0.03em' }}
              >
                Buy & Sell<br />
                within your<br />
                <span style={{ color: '#F97316' }}>community.</span>
              </h1>

              <p className="text-base leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                The marketplace built for real people. Connect with verified neighbours, 
                discover great deals, and list your items in under 60 seconds.
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-10 mt-12">
                {STATS.map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-extrabold text-white" style={{ letterSpacing: '-0.02em' }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              © {new Date().getFullYear()} Ownzo · All rights reserved
            </p>
          </div>

          {/* Decorative orange arc */}
          <svg
            className="absolute bottom-0 right-0 opacity-20 pointer-events-none"
            width="320" height="320" viewBox="0 0 320 320" fill="none"
          >
            <circle cx="320" cy="320" r="200" stroke="#F97316" strokeWidth="60" />
          </svg>
        </div>

        {/* ── RIGHT — Form panel ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-white">
          <div className="w-full max-w-[400px]">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-10">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center"
                style={{ background: '#0D1F17' }}
              >
                <img src="/images/logo/logo.webp" alt="Ownzo" className="h-6 w-6 object-contain" />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">Ownzo</span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2
                className="text-3xl font-extrabold text-gray-900 mb-2"
                style={{ letterSpacing: '-0.025em' }}
              >
                Welcome back
              </h2>
              <p className="text-sm text-gray-400 font-medium">
                Sign in to your marketplace account
              </p>
            </div>

            {/* Google sign-in button */}
            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-[52px] flex items-center gap-3 rounded-2xl border text-sm font-semibold text-gray-700 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ borderColor: '#E5E7EB', background: '#FAFAFA' }}
            >
              {/* Hover shimmer */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.04), rgba(249,115,22,0.02))' }}
              />
              <span className="relative flex items-center gap-3 w-full px-5">
                {loading ? (
                  <>
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                    <span className="text-gray-500">Connecting…</span>
                  </>
                ) : (
                  <>
                    {/* Google "G" SVG */}
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google</span>
                    {/* Arrow */}
                    <svg className="h-4 w-4 ml-auto text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] font-semibold tracking-widest text-gray-300 uppercase">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Quick start CTA */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl text-white text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', boxShadow: '0 8px 24px rgba(27,67,50,0.3)' }}
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <>
                  <span>Get Started Free</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-5 mt-8">
              {TRUST.map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[11px] text-gray-400 font-medium">{t}</span>
                </div>
              ))}
            </div>

            {/* Terms */}
            <p className="text-center text-[11px] text-gray-300 mt-8 leading-relaxed">
              By continuing you agree to our{' '}
              <a href="/legal/terms" className="text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors">Terms</a>
              {' '}and{' '}
              <a href="/legal/privacy" className="text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors">Privacy Policy</a>
            </p>

          </div>
        </div>
      </div>
    </>
  )
}
