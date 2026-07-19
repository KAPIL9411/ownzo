'use client'

import { CheckCircle, Phone, Mail, GraduationCap, CreditCard, Shield } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

interface VerificationBadgesProps {
  verified?: boolean
  phoneVerified?: boolean
  emailVerified?: boolean
  collegeVerified?: boolean
  governmentIdVerified?: boolean
  size?: 'sm' | 'md' | 'lg'
  layout?: 'inline' | 'grid'
  className?: string
}

export function VerificationBadges({
  verified,
  phoneVerified,
  emailVerified,
  collegeVerified,
  governmentIdVerified,
  size = 'md',
  layout = 'inline',
  className,
}: VerificationBadgesProps) {
  const badges = [
    {
      icon: Shield,
      label: 'Verified Seller',
      active: verified,
      color: 'text-green-600 bg-green-50 border-green-200',
    },
    {
      icon: Phone,
      label: 'Phone Verified',
      active: phoneVerified,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      icon: Mail,
      label: 'Email Verified',
      active: emailVerified,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      icon: GraduationCap,
      label: 'College Verified',
      active: collegeVerified,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      icon: CreditCard,
      label: 'ID Verified',
      active: governmentIdVerified,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
  ].filter((badge) => badge.active)

  if (badges.length === 0) return null

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  }

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <div
      className={cn(
        'flex flex-wrap',
        layout === 'grid' ? 'grid grid-cols-2 gap-2' : 'gap-2',
        className
      )}
    >
      {badges.map((badge) => (
        <div
          key={badge.label}
          className={cn(
            'inline-flex items-center rounded-full border font-medium',
            badge.color,
            sizeClasses[size]
          )}
        >
          <badge.icon className={iconSize[size]} />
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  )
}

// Simple verified badge for listings
interface VerifiedBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function VerifiedBadge({ className, size = 'md' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  }

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-green-500 text-white font-medium',
        sizeClasses[size],
        className
      )}
    >
      <CheckCircle className={iconSize[size]} />
      <span>Verified</span>
    </div>
  )
}

// Trust indicator for listing cards
interface TrustIndicatorProps {
  trustScore: number
  verificationStatus?: 'verified' | 'pending' | 'unverified'
  className?: string
}

export function TrustIndicator({ trustScore, verificationStatus, className }: TrustIndicatorProps) {
  const getColor = () => {
    if (verificationStatus === 'verified' && trustScore >= 80) {
      return 'bg-green-500 text-white'
    }
    if (trustScore >= 70) {
      return 'bg-blue-500 text-white'
    }
    if (trustScore >= 55) {
      return 'bg-yellow-500 text-white'
    }
    return 'bg-gray-400 text-white'
  }

  const getLabel = () => {
    if (verificationStatus === 'verified') return 'Verified'
    if (verificationStatus === 'pending') return 'Pending'
    return 'Unverified'
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        getColor(),
        className
      )}
    >
      <Shield className="h-3 w-3" />
      <span>{trustScore}</span>
      {verificationStatus && <span>· {getLabel()}</span>}
    </div>
  )
}
