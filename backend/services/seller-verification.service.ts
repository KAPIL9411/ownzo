/**
 * Seller Verification Service
 * Verifies seller identity, reputation, and trustworthiness
 */

import {
  EnhancedTrustScoreData,
  VerificationCheck,
  TrustScoreBreakdown,
  TrustEngineConfig,
} from '@/shared/types/trust.types'
import { userRepository } from '@/backend/repositories/user.repository'

interface SellerVerificationResult {
  trustScore: number
  breakdown: TrustScoreBreakdown
  checks: VerificationCheck[]
}

export class SellerVerificationService {
  private config: TrustEngineConfig

  constructor(config: TrustEngineConfig) {
    this.config = config
  }

  /**
   * Main verification entry point
   */
  async verifySeller(sellerId: string): Promise<SellerVerificationResult> {
    // Fetch seller data
    const seller = await userRepository.getUserById(sellerId)
    
    if (!seller) {
      throw new Error(`Seller not found: ${sellerId}`)
    }
    
    // Build enhanced trust data
    const trustData = await this.buildTrustData(seller)
    
    // Run all verification checks
    const checks: VerificationCheck[] = []
    
    // Identity checks (max 20 points)
    const identityResult = this.verifyIdentity(trustData)
    checks.push(...identityResult.checks)
    
    // Account checks (max 15 points)
    const accountResult = this.verifyAccount(trustData)
    checks.push(...accountResult.checks)
    
    // Activity checks (max 25 points)
    const activityResult = this.verifyActivity(trustData)
    checks.push(...activityResult.checks)
    
    // Reputation checks (max 25 points)
    const reputationResult = this.verifyReputation(trustData)
    checks.push(...reputationResult.checks)
    
    // Community checks (max 10 points)
    const communityResult = this.verifyCommunity(trustData)
    checks.push(...communityResult.checks)
    
    // Penalties (max -50 points)
    const penaltyResult = this.calculatePenalties(trustData)
    checks.push(...penaltyResult.checks)
    
    // Bonuses (max +5 points)
    const bonusResult = this.calculateBonuses(trustData)
    checks.push(...bonusResult.checks)
    
    // Build breakdown
    const breakdown: TrustScoreBreakdown = {
      identityScore: identityResult.score,
      identityChecks: identityResult.breakdown,
      accountScore: accountResult.score,
      accountChecks: accountResult.breakdown,
      activityScore: activityResult.score,
      activityChecks: activityResult.breakdown,
      reputationScore: reputationResult.score,
      reputationChecks: reputationResult.breakdown,
      communityScore: communityResult.score,
      communityChecks: communityResult.breakdown,
      penaltyScore: penaltyResult.score,
      penaltyChecks: penaltyResult.breakdown,
      bonusScore: bonusResult.score,
      bonusChecks: bonusResult.breakdown,
      totalScore: 0, // Calculated below
      grade: 'F', // Calculated below
    }
    
    // Calculate total (0-100 scale)
    breakdown.totalScore = Math.max(0, Math.min(100, 
      breakdown.identityScore +
      breakdown.accountScore +
      breakdown.activityScore +
      breakdown.reputationScore +
      breakdown.communityScore +
      breakdown.penaltyScore +
      breakdown.bonusScore
    ))
    
    // Assign grade
    breakdown.grade = this.calculateGrade(breakdown.totalScore)
    
    return {
      trustScore: breakdown.totalScore,
      breakdown,
      checks,
    }
  }

  /**
   * Build enhanced trust data from user
   */
  private async buildTrustData(seller: any): Promise<EnhancedTrustScoreData> {
    const now = new Date()
    const createdAt = seller.createdAt?.toDate ? seller.createdAt.toDate() : new Date(seller.createdAt)
    const accountAge = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      // Identity verification
      googleVerified: true, // Always true if they logged in with Google
      phoneVerified: !!seller.phoneVerified || !!seller.phone,
      emailVerified: !!seller.emailVerified || !!seller.email,
      collegeVerified: seller.verificationType === 'student',
      governmentIdVerified: seller.verificationType === 'government',
      
      // Account information
      accountAge,
      profileComplete: this.isProfileComplete(seller),
      hasProfilePicture: !!seller.photoURL,
      hasBio: !!seller.bio && seller.bio.length > 10,
      hasLocation: !!seller.city,
      lastActiveAt: seller.updatedAt?.toDate ? seller.updatedAt.toDate() : new Date(seller.updatedAt || now),
      
      // Activity metrics
      totalListings: seller.listingCount || 0,
      activeListings: 0, // Will be fetched separately if needed
      completedSales: 0, // Placeholder - will add transaction tracking later
      cancelledSales: 0, // Placeholder
      avgListingDuration: 0, // Placeholder
      responseRate: 100, // Placeholder - will add message tracking later
      avgResponseTime: 2, // Placeholder (hours)
      
      // Reputation
      totalReviews: seller.reviewCount || 0,
      positiveReviews: Math.floor((seller.reviewCount || 0) * 0.9), // Placeholder
      negativeReviews: Math.floor((seller.reviewCount || 0) * 0.1), // Placeholder
      neutralReviews: 0,
      avgRating: seller.rating || 0,
      
      // Community
      inCommunity: !!seller.communityId,
      communityVerified: false, // Placeholder - will check community verification
      communityMemberDuration: 0, // Placeholder
      communityReports: 0, // Placeholder
      
      // Violations & reports
      totalReports: seller.reportCount || 0,
      confirmedViolations: 0, // Placeholder
      previousBans: 0, // Placeholder
      currentlyBanned: seller.isBanned || false,
      warningCount: 0, // Placeholder
    }
  }

  /**
   * Check if profile is complete
   */
  private isProfileComplete(seller: any): boolean {
    return !!(
      seller.name &&
      seller.email &&
      seller.city &&
      seller.photoURL
    )
  }

  /**
   * Verify identity (max 20 points)
   */
  private verifyIdentity(data: EnhancedTrustScoreData): {
    score: number
    checks: VerificationCheck[]
    breakdown: any
  } {
    const checks: VerificationCheck[] = []
    let score = 0
    
    // Google verified (8 points) - baseline requirement
    const googleScore = data.googleVerified ? 8 : 0
    checks.push({
      type: 'seller_google_verified',
      passed: data.googleVerified,
      score: googleScore,
      weight: 20,
      message: data.googleVerified ? 'Google account verified' : 'Google verification required',
      details: data.googleVerified ? undefined : 'Sign in with Google to verify identity',
      timestamp: new Date(),
    })
    
    // Phone verified (4 points)
    const phoneScore = data.phoneVerified ? 4 : 0
    checks.push({
      type: 'seller_phone_verified',
      passed: data.phoneVerified,
      score: phoneScore,
      weight: 15,
      message: data.phoneVerified ? 'Phone number verified' : 'Phone verification pending',
      details: data.phoneVerified ? undefined : 'Verify your phone number to increase trust',
      timestamp: new Date(),
    })
    
    // Email verified (3 points)
    const emailScore = data.emailVerified ? 3 : 0
    checks.push({
      type: 'seller_email_verified',
      passed: data.emailVerified,
      score: emailScore,
      weight: 10,
      message: data.emailVerified ? 'Email verified' : 'Email verification pending',
      timestamp: new Date(),
    })
    
    // College verified (3 points)
    const collegeScore = data.collegeVerified ? 3 : 0
    if (data.collegeVerified) {
      checks.push({
        type: 'seller_college_verified',
        passed: true,
        score: 3,
        weight: 8,
        message: 'College/Company verified',
        timestamp: new Date(),
      })
    }
    
    // Government ID verified (2 points)
    const govIdScore = data.governmentIdVerified ? 2 : 0
    if (data.governmentIdVerified) {
      checks.push({
        type: 'seller_government_id_verified',
        passed: true,
        score: 2,
        weight: 8,
        message: 'Government ID verified',
        timestamp: new Date(),
      })
    }
    
    score = googleScore + phoneScore + emailScore + collegeScore + govIdScore
    
    return {
      score,
      checks,
      breakdown: {
        googleVerified: googleScore,
        phoneVerified: phoneScore,
        emailVerified: emailScore,
        collegeVerified: collegeScore,
        governmentIdVerified: govIdScore,
      }
    }
  }

  /**
   * Verify account (max 15 points)
   */
  private verifyAccount(data: EnhancedTrustScoreData): {
    score: number
    checks: VerificationCheck[]
    breakdown: any
  } {
    const checks: VerificationCheck[] = []
    let score = 0
    
    // Account age (0-6 points)
    let accountAgeScore = 0
    if (data.accountAge >= 180) { // 6+ months
      accountAgeScore = 6
    } else if (data.accountAge >= 90) { // 3-6 months
      accountAgeScore = 4
    } else if (data.accountAge >= 30) { // 1-3 months
      accountAgeScore = 2
    }
    
    checks.push({
      type: 'seller_account_age',
      passed: accountAgeScore > 0,
      score: accountAgeScore,
      weight: 10,
      message: `Account age: ${data.accountAge} days`,
      details: data.accountAge < 30 ? 'New accounts have limited features' : undefined,
      timestamp: new Date(),
    })
    
    // Profile complete (4 points)
    const profileScore = data.profileComplete ? 4 : 0
    checks.push({
      type: 'seller_profile_complete',
      passed: data.profileComplete,
      score: profileScore,
      weight: 15,
      message: data.profileComplete ? 'Profile is complete' : 'Profile incomplete',
      details: data.profileComplete ? undefined : 'Complete your profile to increase trust',
      timestamp: new Date(),
    })
    
    // Profile picture (2 points)
    const photoScore = data.hasProfilePicture ? 2 : 0
    
    // Bio (2 points)
    const bioScore = data.hasBio ? 2 : 0
    
    // Location (1 point)
    const locationScore = data.hasLocation ? 1 : 0
    
    score = accountAgeScore + profileScore + photoScore + bioScore + locationScore
    
    return {
      score,
      checks,
      breakdown: {
        accountAge: accountAgeScore,
        profileComplete: profileScore,
        hasProfilePicture: photoScore,
        hasBio: bioScore,
        hasLocation: locationScore,
      }
    }
  }

  /**
   * Verify activity (max 25 points)
   */
  private verifyActivity(data: EnhancedTrustScoreData): {
    score: number
    checks: VerificationCheck[]
    breakdown: any
  } {
    const checks: VerificationCheck[] = []
    let score = 0
    
    // Completed sales (0-15 points)
    let salesScore = Math.min(15, data.completedSales * 3)
    if (data.completedSales > 0) {
      checks.push({
        type: 'seller_completed_sales',
        passed: true,
        score: salesScore,
        weight: 20,
        message: `${data.completedSales} successful sales`,
        timestamp: new Date(),
      })
    }
    
    // Response rate (0-5 points)
    let responseRateScore = Math.round((data.responseRate / 100) * 5)
    
    // Response time (0-5 points)
    let responseTimeScore = 0
    if (data.avgResponseTime <= 2) {
      responseTimeScore = 5
    } else if (data.avgResponseTime <= 6) {
      responseTimeScore = 3
    } else if (data.avgResponseTime <= 24) {
      responseTimeScore = 1
    }
    
    score = salesScore + responseRateScore + responseTimeScore
    
    return {
      score,
      checks,
      breakdown: {
        completedSales: salesScore,
        responseRate: responseRateScore,
        avgResponseTime: responseTimeScore,
      }
    }
  }

  /**
   * Verify reputation (max 25 points)
   */
  private verifyReputation(data: EnhancedTrustScoreData): {
    score: number
    checks: VerificationCheck[]
    breakdown: any
  } {
    const checks: VerificationCheck[] = []
    let score = 0
    
    // Positive reviews (0-12 points)
    let positiveScore = Math.min(12, data.positiveReviews * 3)
    if (data.positiveReviews > 0) {
      checks.push({
        type: 'seller_positive_reviews',
        passed: true,
        score: positiveScore,
        weight: 15,
        message: `${data.positiveReviews} positive reviews`,
        timestamp: new Date(),
      })
    }
    
    // Average rating (0-8 points)
    let ratingScore = Math.round((data.avgRating / 5) * 8)
    
    // Negative reviews penalty (0 to -5 points)
    let negativeScore = Math.max(-5, data.negativeReviews * -5)
    if (data.negativeReviews > 0) {
      checks.push({
        type: 'seller_no_reports',
        passed: false,
        score: negativeScore,
        weight: 15,
        message: `${data.negativeReviews} negative reviews`,
        details: 'Work on improving customer satisfaction',
        timestamp: new Date(),
      })
    }
    
    score = positiveScore + ratingScore + negativeScore
    
    return {
      score,
      checks,
      breakdown: {
        positiveReviews: positiveScore,
        avgRating: ratingScore,
        negativeReviews: negativeScore,
      }
    }
  }

  /**
   * Verify community (max 10 points)
   */
  private verifyCommunity(data: EnhancedTrustScoreData): {
    score: number
    checks: VerificationCheck[]
    breakdown: any
  } {
    const checks: VerificationCheck[] = []
    let score = 0
    
    // In community (5 points)
    const inCommunityScore = data.inCommunity ? 5 : 0
    checks.push({
      type: 'seller_in_community',
      passed: data.inCommunity,
      score: inCommunityScore,
      weight: 12,
      message: data.inCommunity ? 'Member of a community' : 'Not in any community',
      details: data.inCommunity ? undefined : 'Join a community to increase trust',
      timestamp: new Date(),
    })
    
    // Community verified (3 points)
    const verifiedScore = data.communityVerified ? 3 : 0
    
    // No community reports (2 points)
    const reportsScore = data.communityReports === 0 ? 2 : Math.max(0, 2 - data.communityReports)
    
    score = inCommunityScore + verifiedScore + reportsScore
    
    return {
      score,
      checks,
      breakdown: {
        inCommunity: inCommunityScore,
        communityVerified: verifiedScore,
        communityReports: reportsScore,
      }
    }
  }

  /**
   * Calculate penalties (max -50 points)
   */
  private calculatePenalties(data: EnhancedTrustScoreData): {
    score: number
    checks: VerificationCheck[]
    breakdown: any
  } {
    const checks: VerificationCheck[] = []
    let score = 0
    
    // Reports penalty (-10 per report, max -20)
    const reportsPenalty = Math.max(-20, data.totalReports * -10)
    if (data.totalReports > 0) {
      checks.push({
        type: 'seller_no_reports',
        passed: false,
        score: reportsPenalty,
        weight: 20,
        message: `${data.totalReports} reports filed against seller`,
        details: 'Multiple reports significantly reduce trust',
        timestamp: new Date(),
      })
    }
    
    // Confirmed violations penalty (-15 per violation, max -30)
    const violationsPenalty = Math.max(-30, data.confirmedViolations * -15)
    
    // Previous bans penalty (-20 per ban, max -40)
    const bansPenalty = Math.max(-40, data.previousBans * -20)
    
    // Currently banned (-50 points - cannot list)
    const currentBanPenalty = data.currentlyBanned ? -50 : 0
    if (data.currentlyBanned) {
      checks.push({
        type: 'seller_trust_score',
        passed: false,
        score: -50,
        weight: 50,
        message: 'Account is currently banned',
        details: 'Cannot create listings while banned',
        timestamp: new Date(),
      })
    }
    
    score = reportsPenalty + violationsPenalty + bansPenalty + currentBanPenalty
    
    return {
      score,
      checks,
      breakdown: {
        totalReports: reportsPenalty,
        confirmedViolations: violationsPenalty,
        previousBans: bansPenalty,
        currentlyBanned: currentBanPenalty,
      }
    }
  }

  /**
   * Calculate bonuses (max +5 points)
   */
  private calculateBonuses(data: EnhancedTrustScoreData): {
    score: number
    checks: VerificationCheck[]
    breakdown: any
  } {
    const checks: VerificationCheck[] = []
    let score = 0
    
    // Early adopter bonus (2 points for accounts >180 days old)
    const earlyAdopterScore = data.accountAge >= 180 ? 2 : 0
    
    // Referrals bonus (placeholder)
    const referralsScore = 0
    
    // Community contribution (placeholder)
    const contributionScore = 0
    
    score = earlyAdopterScore + referralsScore + contributionScore
    
    return {
      score,
      checks,
      breakdown: {
        earlyAdopter: earlyAdopterScore,
        referrals: referralsScore,
        communityContribution: contributionScore,
      }
    }
  }

  /**
   * Calculate letter grade from score
   */
  private calculateGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+'
    if (score >= 85) return 'A'
    if (score >= 80) return 'B+'
    if (score >= 70) return 'B'
    if (score >= 65) return 'C+'
    if (score >= 55) return 'C'
    if (score >= 45) return 'D'
    return 'F'
  }
}
