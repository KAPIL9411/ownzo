'use client'

import { Shield, ShieldCheck, Award, CheckCircle2, Star } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

interface VerificationBadgeProps {
  verificationType?: 'email' | 'phone' | 'student' | 'government'
  verified: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function VerificationBadge({
  verificationType,
  verified,
  size = 'md',
  showLabel = false,
  className,
}: VerificationBadgeProps) {
  if (!verified) return null

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const badgeConfig = {
    email: {
      icon: CheckCircle2,
      label: 'Email Verified',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    phone: {
      icon: CheckCircle2,
      label: 'Phone Verified',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    student: {
      icon: Award,
      label: 'Student Verified',
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    government: {
      icon: ShieldCheck,
      label: 'ID Verified',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
  }

  const config = verificationType ? badgeConfig[verificationType] : {
    icon: Shield,
    label: 'Verified',
    color: 'text-[#1B4332]',
    bg: 'bg-green-50',
  }

  const Icon = config.icon

  if (showLabel) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
          config.bg,
          config.color,
          className
        )}
      >
        <Icon className={sizeClasses[size]} />
        {config.label}
      </div>
    )
  }

  return (
    <Icon
      className={cn(sizeClasses[size], config.color, className)}
      aria-label={config.label}
    />
  )
}

interface TrustScoreBadgeProps {
  trustScore: number
  className?: string
  showLabel?: boolean
}

export function TrustScoreBadge({ trustScore, className, showLabel = true }: TrustScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return { color: 'text-green-600', bg: 'bg-green-50', label: 'Excellent', bar: '#16a34a' }
    if (score >= 75) return { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Very Good', bar: '#2563eb' }
    if (score >= 50) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Good', bar: '#ca8a04' }
    return { color: 'text-gray-600', bg: 'bg-gray-50', label: 'New', bar: '#9ca3af' }
  }

  const config = getScoreColor(trustScore)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold',
        config.bg,
        config.color,
        className
      )}
    >
      <Star className="h-3.5 w-3.5 fill-current" />
      <span>{trustScore}%</span>
      {showLabel && <span className="font-semibold opacity-75">{config.label}</span>}
    </div>
  )
}

/* ── Full Trust Score Card — used in profile ──────────────── */
interface TrustScoreCardProps {
  trustScore: number
  verified?: boolean
  listingCount?: number
  reviewCount?: number
  reportCount?: number
  className?: string
}

export function TrustScoreCard({
  trustScore, verified, listingCount = 0,
  reviewCount = 0, reportCount = 0, className,
}: TrustScoreCardProps) {
  const getConfig = (score: number) => {
    if (score >= 90) return { label: 'Excellent',  color: '#16a34a', bg: 'bg-green-50',  border: 'border-green-200' }
    if (score >= 75) return { label: 'Very Good',  color: '#2563eb', bg: 'bg-blue-50',   border: 'border-blue-200'  }
    if (score >= 50) return { label: 'Good',       color: '#ca8a04', bg: 'bg-yellow-50', border: 'border-yellow-200'}
    return              { label: 'New Member', color: '#9ca3af', bg: 'bg-gray-50',   border: 'border-gray-200'  }
  }
  const cfg = getConfig(trustScore)

  return (
    <div className={cn('rounded-xl border p-4', cfg.bg, cfg.border, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" style={{ color: cfg.color }} />
          <p className="text-sm font-bold text-gray-800">Trust Score</p>
        </div>
        <span className="text-xl font-extrabold" style={{ color: cfg.color }}>
          {trustScore}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-gray-200 mb-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${trustScore}%`, background: cfg.color }}
        />
      </div>

      <p className="text-xs font-semibold mb-3" style={{ color: cfg.color }}>{cfg.label}</p>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Listings',  value: listingCount  },
          { label: 'Reviews',   value: reviewCount   },
          { label: 'Reports',   value: reportCount   },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/70 rounded-lg p-2">
            <p className="text-base font-extrabold text-gray-800">{value}</p>
            <p className="text-[10px] text-gray-400 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {verified && (
        <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Verified user · +20 trust points
        </div>
      )}
    </div>
  )
}
