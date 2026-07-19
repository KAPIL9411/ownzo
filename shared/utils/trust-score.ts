import { EnhancedTrustScoreData } from '@/shared/types/trust.types'

// Legacy interface - kept for backward compatibility
export interface TrustScoreData {
  verified: boolean
  completedSales: number
  positiveReviews: number
  negativeReviews: number
  profileComplete: boolean
  reported: number
}

// Legacy function - kept for backward compatibility
// Use TrustEngineService for new implementations
export function calculateTrustScore(data: TrustScoreData): number {
  let score = 0

  if (data.verified) score += 20
  score += Math.min(data.completedSales * 5, 30)
  score += Math.min(data.positiveReviews * 3, 25)
  score -= data.negativeReviews * 5
  if (data.profileComplete) score += 5
  score -= data.reported * 10

  return Math.max(0, Math.min(100, score))
}

/**
 * Enhanced trust score calculation using comprehensive data
 * This provides a quick calculation without full Trust Engine overhead
 * For authoritative scores, use TrustEngineService.assessSeller()
 */
export function calculateEnhancedTrustScore(data: EnhancedTrustScoreData): number {
  let score = 0

  // Identity verification (max 20 points)
  if (data.googleVerified) score += 8
  if (data.phoneVerified) score += 4
  if (data.emailVerified) score += 3
  if (data.collegeVerified) score += 3
  if (data.governmentIdVerified) score += 2

  // Account health (max 15 points)
  if (data.accountAge >= 180) score += 6
  else if (data.accountAge >= 90) score += 4
  else if (data.accountAge >= 30) score += 2
  
  if (data.profileComplete) score += 4
  if (data.hasProfilePicture) score += 2
  if (data.hasBio) score += 2
  if (data.hasLocation) score += 1

  // Activity (max 25 points)
  score += Math.min(15, data.completedSales * 3)
  score += Math.round((data.responseRate / 100) * 5)
  if (data.avgResponseTime <= 2) score += 5
  else if (data.avgResponseTime <= 6) score += 3
  else if (data.avgResponseTime <= 24) score += 1

  // Reputation (max 25 points)
  score += Math.min(12, data.positiveReviews * 3)
  score += Math.round((data.avgRating / 5) * 8)
  score += Math.max(-5, data.negativeReviews * -5)

  // Community (max 10 points)
  if (data.inCommunity) score += 5
  if (data.communityVerified) score += 3
  score += data.communityReports === 0 ? 2 : Math.max(0, 2 - data.communityReports)

  // Penalties (max -50 points)
  score += Math.max(-20, data.totalReports * -10)
  score += Math.max(-30, data.confirmedViolations * -15)
  score += Math.max(-40, data.previousBans * -20)
  if (data.currentlyBanned) score -= 50

  // Bonuses (max +5 points)
  if (data.accountAge >= 180) score += 2 // Early adopter

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate trust score letter grade
 */
export function getTrustGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 80) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 65) return 'C+'
  if (score >= 55) return 'C'
  if (score >= 45) return 'D'
  return 'F'
}

/**
 * Get trust badge color for UI display
 */
export function getTrustBadgeColor(score: number): string {
  if (score >= 85) return '#10B981' // Green
  if (score >= 70) return '#3B82F6' // Blue
  if (score >= 55) return '#F59E0B' // Yellow
  if (score >= 40) return '#EF4444' // Red
  return '#6B7280' // Gray
}

/**
 * Get trust level description
 */
export function getTrustLevel(score: number): {
  level: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor' | 'Very Poor'
  description: string
} {
  if (score >= 85) {
    return {
      level: 'Excellent',
      description: 'Highly trusted seller with proven track record'
    }
  }
  if (score >= 70) {
    return {
      level: 'Very Good',
      description: 'Trusted seller with good reputation'
    }
  }
  if (score >= 55) {
    return {
      level: 'Good',
      description: 'Reliable seller with some verification'
    }
  }
  if (score >= 40) {
    return {
      level: 'Fair',
      description: 'New or unverified seller - proceed with caution'
    }
  }
  if (score >= 25) {
    return {
      level: 'Poor',
      description: 'Limited verification - high risk'
    }
  }
  return {
    level: 'Very Poor',
    description: 'Insufficient trust - avoid transactions'
  }
}
