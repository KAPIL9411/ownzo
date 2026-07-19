'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertTriangle, Clock, Shield, Loader2 } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrustAssessmentModalProps {
  isOpen: boolean
  stage: 'checking' | 'result' | 'closed'
  result?: {
    decision: 'auto_publish' | 'suggest_improvements' | 'require_review' | 'reject'
    overallScore: number
    message: string
    improvements?: string[]
    warnings?: string[]
  }
  onClose: () => void
  onContinue?: () => void
}

// ─── Checking steps ───────────────────────────────────────────────────────────

const STEPS = [
  'Verifying seller identity',
  'Analysing listing content',
  'Checking photo quality',
  'Validating price range',
  'Calculating trust score',
]

const STEP_MS = [1600, 2200, 1800, 1400, 1600]

// ─── Score arc (SVG, no external dep) ────────────────────────────────────────

function ScoreArc({ score }: { score: number }) {
  const r    = 36
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ

  const color =
    score >= 80 ? '#16a34a' :
    score >= 60 ? '#d97706' :
    score >= 40 ? '#2563eb' : '#dc2626'

  const label =
    score >= 80 ? 'Good'   :
    score >= 60 ? 'Fair'   :
    score >= 40 ? 'Review' : 'Low'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" className="-rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} stroke="#f3f4f6" strokeWidth="6" fill="none" />
          <motion.circle
            cx="40" cy="40" r={r}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - fill }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-xl font-bold text-gray-900">{score}</span>
        </motion.div>
      </div>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  )
}

// ─── Decision config ──────────────────────────────────────────────────────────

const DECISION_CFG = {
  auto_publish: {
    icon:       <Check className="w-5 h-5" />,
    iconBg:     'bg-green-100 text-green-700',
    accent:     'bg-green-600 hover:bg-green-700',
    tag:        'Published',
    tagCls:     'bg-green-50 text-green-700 border-green-200',
    title:      'Listing approved',
    subtitle:   'Your item is now live and visible to buyers.',
    primaryBtn: 'Continue',
    secondaryBtn: undefined,
  },
  suggest_improvements: {
    icon:       <AlertTriangle className="w-5 h-5" />,
    iconBg:     'bg-amber-100 text-amber-700',
    accent:     'bg-amber-600 hover:bg-amber-700',
    tag:        'Published',
    tagCls:     'bg-amber-50 text-amber-700 border-amber-200',
    title:      'Published with suggestions',
    subtitle:   'Your listing is live. Improve it to reach more buyers.',
    primaryBtn: 'Continue',
    secondaryBtn: 'Edit listing',
  },
  require_review: {
    icon:       <Clock className="w-5 h-5" />,
    iconBg:     'bg-blue-100 text-blue-700',
    accent:     'bg-[#1B4332] hover:bg-[#2D6A4F]',
    tag:        'Under review',
    tagCls:     'bg-blue-50 text-blue-700 border-blue-200',
    title:      'Review required',
    subtitle:   "We'll review your listing within 1–2 hours.",
    primaryBtn: 'Submit for review',
    secondaryBtn: 'Edit listing',
  },
  reject: {
    icon:       <X className="w-5 h-5" />,
    iconBg:     'bg-red-100 text-red-700',
    accent:     'bg-gray-900 hover:bg-gray-800',
    tag:        'Not published',
    tagCls:     'bg-red-50 text-red-700 border-red-200',
    title:      'Listing not approved',
    subtitle:   'Address the issues below and try again.',
    primaryBtn: 'Fix issues',
    secondaryBtn: undefined,
  },
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TrustAssessmentModal({
  isOpen,
  stage,
  result,
  onClose,
  onContinue,
}: TrustAssessmentModalProps) {
  const [done,    setDone]    = useState<number[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (stage !== 'checking') return
    setDone([])
    setCurrent(0)

    let i = 0
    let t: ReturnType<typeof setTimeout>

    const tick = () => {
      if (i >= STEPS.length) return
      setCurrent(i)
      t = setTimeout(() => {
        setDone(p => [...p, i])
        i++
        tick()
      }, STEP_MS[i] ?? 1500)
    }
    tick()
    return () => clearTimeout(t)
  }, [stage])

  if (!isOpen) return null

  const cfg = result ? DECISION_CFG[result.decision] : null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

        {/* ── Backdrop ─────────────────────────────────────────────────── */}
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={stage === 'result' ? onClose : undefined}
        />

        {/* ── Panel ────────────────────────────────────────────────────── */}
        <motion.div
          className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >

          {/* ══════════════════════════════════════════════════════════════
              CHECKING STAGE
          ══════════════════════════════════════════════════════════════ */}
          {stage === 'checking' && (
            <div className="p-7">

              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#1B4332]/8">
                  <Shield className="w-6 h-6 text-[#1B4332]" />
                  {/* Pulse ring */}
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-[#1B4332]/30"
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-center text-[15px] font-semibold text-gray-900 mb-1">
                Verifying your listing
              </h2>
              <p className="text-center text-sm text-gray-400 mb-6">
                Takes about 10–30 seconds
              </p>

              {/* Steps */}
              <ol className="space-y-2">
                {STEPS.map((label, idx) => {
                  const isDone    = done.includes(idx)
                  const isActive  = current === idx && !isDone
                  const isPending = !isDone && !isActive

                  return (
                    <li
                      key={idx}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors duration-200',
                        isDone   ? 'bg-green-50'   :
                        isActive ? 'bg-gray-50 ring-1 ring-gray-200' :
                                   'opacity-40'
                      )}
                    >
                      {/* Status dot */}
                      <span className={cn(
                        'shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                        isDone   ? 'bg-green-500' :
                        isActive ? 'bg-white ring-1 ring-gray-300' :
                                   'bg-gray-200'
                      )}>
                        {isDone   && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        {isActive && <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />}
                      </span>

                      <span className={cn(
                        'font-medium',
                        isDone   ? 'text-gray-700' :
                        isActive ? 'text-gray-900' :
                                   'text-gray-400'
                      )}>
                        {label}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              RESULT STAGE
          ══════════════════════════════════════════════════════════════ */}
          {stage === 'result' && result && cfg && (
            <div>

              {/* ── Header ──────────────────────────────────────────────── */}
              <div className="px-6 pt-6 pb-5 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">

                  {/* Left: icon + text */}
                  <div className="flex items-start gap-3">
                    <motion.span
                      className={cn('shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center', cfg.iconBg)}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1,   opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {cfg.icon}
                    </motion.span>

                    <div>
                      <span className={cn(
                        'inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border mb-1.5',
                        cfg.tagCls
                      )}>
                        {cfg.tag}
                      </span>
                      <h2 className="text-[15px] font-semibold text-gray-900 leading-snug">
                        {cfg.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                        {cfg.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: close */}
                  <button
                    onClick={onClose}
                    className="shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Score row ───────────────────────────────────────────── */}
              <div className="px-6 py-5 flex items-center gap-5 border-b border-gray-100">
                <ScoreArc score={result.overallScore} />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wide font-medium">Trust Score</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-gray-900">{result.overallScore}</span>
                    <span className="text-sm text-gray-400">/100</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-full',
                        result.overallScore >= 80 ? 'bg-green-500' :
                        result.overallScore >= 60 ? 'bg-amber-500' :
                        result.overallScore >= 40 ? 'bg-blue-500'  : 'bg-red-500'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.overallScore}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Suggestions / Fixes ─────────────────────────────────── */}
              {(result.improvements?.length ?? 0) > 0 && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {result.decision === 'reject' ? 'Required fixes' : 'Suggestions'}
                  </p>
                  <ul className="space-y-2">
                    {result.improvements!.slice(0, 4).map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <span className={cn(
                          'shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold',
                          result.decision === 'reject'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-500'
                        )}>
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Warnings ────────────────────────────────────────────── */}
              {(result.warnings?.length ?? 0) > 0 && (
                <div className="px-6 py-3 border-b border-gray-100 bg-amber-50/60">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <ul className="space-y-1">
                      {result.warnings!.slice(0, 3).map((w, i) => (
                        <li key={i} className="text-xs text-amber-700">{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ── Actions ─────────────────────────────────────────────── */}
              <div className="px-6 py-5 flex flex-col gap-2.5">
                <button
                  onClick={result.decision === 'reject' ? onClose : (onContinue ?? onClose)}
                  className={cn(
                    'w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors',
                    cfg.accent
                  )}
                >
                  {cfg.primaryBtn}
                </button>

                {cfg.secondaryBtn && (
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    {cfg.secondaryBtn}
                  </button>
                )}
              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
