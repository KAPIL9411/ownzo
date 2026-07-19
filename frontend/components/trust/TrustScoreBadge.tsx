'use client'

import { Shield, Star, CheckCircle } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

interface TrustScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showScore?: boolean
  className?: string
}

export function TrustScoreBadge({
  score,
  size = 'md',
  showLabel = true,
  showScore = true,
  className,
}: TrustScoreBadgeProps) {
  const getTrustLevel = () => {
    if (score >= 85) return { level: 'Excellent', color: 'text-green-600 bg-green-50 border-green-200', emoji: '🌟' }
    if (score >= 70) return { level: 'Very Good', color: 'text-blue-600 bg-blue-50 border-blue-200', emoji: '✅' }
    if (score >= 55) return { level: 'Good', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', emoji: '👍' }
    if (score >= 40) return { level: 'Fair', color: 'text-orange-600 bg-orange-50 border-orange-200', emoji: '⚠️' }
    return { level: 'Poor', color: 'text-red-600 bg-red-50 border-red-200', emoji: '❌' }
  }

  const getTrustGrade = () => {
    if (score >= 95) return 'A+'
    if (score >= 85) return 'A'
    if (score >= 80) return 'B+'
    if (score >= 70) return 'B'
    if (score >= 65) return 'C+'
    if (score >= 55) return 'C'
    if (score >= 45) return 'D'
    return 'F'
  }

  const trust = getTrustLevel()
  const grade = getTrustGrade()

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border font-medium',
        trust.color,
        sizeClasses[size],
        className
      )}
    >
      <Shield className={cn('flex-shrink-0', size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} />
      
      {showScore && (
        <span className="font-bold">
          {score}
        </span>
      )}

      {showLabel && (
        <span>
          {trust.level}
        </span>
      )}

      <span className={size === 'sm' ? 'text-xs' : ''}>
        ({grade})
      </span>
    </div>
  )
}

interface TrustScoreDisplayProps {
  score: number
  breakdown?: {
    identityScore: number
    accountScore: number
    activityScore: number
    reputationScore: number
  }
  className?: string
}

export function TrustScoreDisplay({ score, breakdown, className }: TrustScoreDisplayProps) {
  const trust = score >= 85 ? { level: 'Excellent', color: 'text-green-600' } :
                score >= 70 ? { level: 'Very Good', color: 'text-blue-600' } :
                score >= 55 ? { level: 'Good', color: 'text-yellow-600' } :
                score >= 40 ? { level: 'Fair', color: 'text-orange-600' } :
                { level: 'Poor', color: 'text-red-600' }

  return (
    <div className={cn('rounded-xl border bg-card p-6', className)}>
      <div className="flex items-center gap-3 mb-4">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h3 className="font-semibold text-lg">Trust Score</h3>
          <p className="text-sm text-muted-foreground">Verified by Ownzo</p>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className={cn('text-5xl font-bold', trust.color)}>{score}</div>
        <div className="text-2xl text-muted-foreground pb-1">/100</div>
      </div>

      <div className={cn('text-sm font-medium mb-4', trust.color)}>
        {trust.level} Seller
      </div>

      {breakdown && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">Score Breakdown</div>
          {[
            { label: 'Identity', value: breakdown.identityScore, max: 20 },
            { label: 'Account', value: breakdown.accountScore, max: 15 },
            { label: 'Activity', value: breakdown.activityScore, max: 25 },
            { label: 'Reputation', value: breakdown.reputationScore, max: 25 },
          ].map(({ label, value, max }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}/{max}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
