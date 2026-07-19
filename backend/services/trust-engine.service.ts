/**
 * Trust Engine Service
 * Central orchestrator for Ownzo's trust and verification system
 * 
 * This is the core IP of Ownzo - the engine that makes us
 * "The hardest place in India to post a fake listing"
 */

import {
  TrustAssessment,
  TrustEngineResult,
  TrustEngineConfig,
  PublishDecision,
  PublishRecommendation,
  ListingVerificationData,
  VerificationCheck,
  TrustScoreBreakdown,
  ListingTrustScoreBreakdown,
} from '@/shared/types/trust.types'
import { SellerVerificationService } from './seller-verification.service'
import { ListingVerificationService } from './listing-verification.service'

/**
 * Trust Engine Configuration
 * Loaded from environment variables with sensible defaults
 */
const TRUST_ENGINE_CONFIG: TrustEngineConfig = {
  // Publishing thresholds
  autoPublishThreshold: Number(process.env.AUTO_PUBLISH_THRESHOLD) || 80,
  manualReviewThreshold: Number(process.env.MANUAL_REVIEW_THRESHOLD) || 60,
  rejectThreshold: Number(process.env.REJECT_THRESHOLD) || 40,
  
  // Seller limits based on trust score
  maxActiveListingsNewSeller: 1,
  maxActiveListingsLowTrust: 3,
  maxActiveListingsMediumTrust: 5,
  maxActiveListingsHighTrust: 10,
  
  // Photo requirements
  minPhotosGeneral: 3,
  minPhotosHighValue: 5,
  maxPhotos: 10,
  highValueThreshold: Number(process.env.TRUST_ENGINE_HIGH_VALUE_THRESHOLD) || 5000,
  
  // Price validation
  priceDeviationThreshold: 300, // 3x average
  priceMinThreshold: 30, // 30% of average
  
  // Feature flags - FREE tier defaults (no external APIs)
  enableAIMetadata: false, // Requires OpenAI API - disabled for free tier
  enableDuplicateDetection: false, // Requires reverse image API - disabled for free tier
  enablePhotoVerification: false, // Requires Google Vision API - disabled for free tier
  enablePriceValidation: process.env.TRUST_ENGINE_ENABLE_PRICE_VALIDATION !== 'false', // FREE - Default true
  enableCategorySpecificVerification: process.env.TRUST_ENGINE_ENABLE_CATEGORY_VERIFICATION !== 'false', // FREE - Default true
  
  // API keys (optional - leave empty for free tier)
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  googleVisionApiKey: process.env.GOOGLE_CLOUD_VISION_KEY || '',
  reverseImageSearchApiKey: process.env.REVERSE_IMAGE_SEARCH_API_KEY || '',
}

export class TrustEngineService {
  private static instance: TrustEngineService
  private sellerVerificationService: SellerVerificationService
  private listingVerificationService: ListingVerificationService
  private config: TrustEngineConfig
  private version = '1.0.0'

  private constructor() {
    this.config = TRUST_ENGINE_CONFIG
    this.sellerVerificationService = new SellerVerificationService(this.config)
    this.listingVerificationService = new ListingVerificationService(this.config)
    
    console.log('[Trust Engine] Initialized', {
      version: this.version,
      autoPublishThreshold: this.config.autoPublishThreshold,
      manualReviewThreshold: this.config.manualReviewThreshold,
      enabledFeatures: {
        aiMetadata: this.config.enableAIMetadata,
        duplicateDetection: this.config.enableDuplicateDetection,
        photoVerification: this.config.enablePhotoVerification,
        priceValidation: this.config.enablePriceValidation,
        categoryVerification: this.config.enableCategorySpecificVerification,
      }
    })
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TrustEngineService {
    if (!TrustEngineService.instance) {
      TrustEngineService.instance = new TrustEngineService()
    }
    return TrustEngineService.instance
  }

  /**
   * Main entry point: Assess a listing for trustworthiness
   * This is called before publishing to determine if listing should go live
   */
  public async assessListing(
    sellerId: string,
    listingData: ListingVerificationData
  ): Promise<TrustEngineResult> {
    const startTime = Date.now()
    
    console.log('[Trust Engine] Starting assessment', {
      sellerId,
      listingTitle: listingData.title,
      price: listingData.price,
    })

    try {
      // Step 1: Verify seller trust
      const sellerResult = await this.sellerVerificationService.verifySeller(sellerId)
      
      // Step 2: Verify listing
      const listingResult = await this.listingVerificationService.verifyListing(
        listingData,
        sellerResult.trustScore
      )
      
      // Step 3: Calculate overall trust assessment
      const assessment = this.calculateTrustAssessment(
        sellerResult,
        listingResult
      )
      
      // Step 4: Make publishing decision
      const decision = this.makePublishingDecision(assessment)
      
      // Step 5: Compile final result
      const result: TrustEngineResult = {
        assessment,
        decision,
        sellerScoreBreakdown: sellerResult.breakdown,
        listingScoreBreakdown: listingResult.breakdown,
        metadata: {
          version: this.version,
          processedAt: new Date(),
          processingTime: Date.now() - startTime,
        }
      }
      
      console.log('[Trust Engine] Assessment complete', {
        sellerId,
        sellerTrustScore: assessment.sellerTrustScore,
        listingTrustScore: assessment.listingTrustScore,
        overallTrustScore: assessment.overallTrustScore,
        recommendation: assessment.recommendation,
        autoPublish: decision.autoPublish,
        processingTime: result.metadata.processingTime,
      })
      
      return result
      
    } catch (error) {
      console.error('[Trust Engine] Assessment failed', {
        sellerId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      // On error, return conservative assessment (manual review)
      return this.getFailsafeAssessment(sellerId, listingData, error)
    }
  }

  /**
   * Calculate overall trust assessment from seller and listing results
   */
  private calculateTrustAssessment(
    sellerResult: any,
    listingResult: any
  ): TrustAssessment {
    // Weighted average: Seller 40%, Listing 60%
    const sellerWeight = 0.4
    const listingWeight = 0.6
    
    const sellerTrustScore = sellerResult.trustScore
    const listingTrustScore = listingResult.trustScore
    
    const overallTrustScore = Math.round(
      (sellerTrustScore * sellerWeight) + (listingTrustScore * listingWeight)
    )
    
    const riskScore = 100 - overallTrustScore
    
    // Combine all checks
    const allChecks: VerificationCheck[] = [
      ...sellerResult.checks,
      ...listingResult.checks,
    ]
    
    const passedChecks = allChecks.filter(c => c.passed).length
    const failedChecks = allChecks.length - passedChecks
    
    // Determine recommendation
    let recommendation: PublishRecommendation
    if (overallTrustScore >= this.config.autoPublishThreshold) {
      recommendation = 'publish'
    } else if (overallTrustScore >= this.config.manualReviewThreshold) {
      recommendation = 'improve'
    } else if (overallTrustScore >= this.config.rejectThreshold) {
      recommendation = 'review'
    } else {
      recommendation = 'reject'
    }
    
    // Compile reasoning
    const reasoning: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []
    
    if (sellerTrustScore >= 80) {
      reasoning.push('Seller has high trust score')
    } else if (sellerTrustScore < 60) {
      warnings.push('Seller trust score is low')
      suggestions.push('Complete your profile and verify your identity')
    }
    
    if (listingTrustScore >= 80) {
      reasoning.push('Listing meets all quality standards')
    } else if (listingTrustScore < 60) {
      warnings.push('Listing quality needs improvement')
    }
    
    // Add specific failed check warnings
    const criticalFailures = allChecks.filter(c => !c.passed && c.weight >= 10)
    criticalFailures.forEach(check => {
      warnings.push(check.message)
    })
    
    // Add suggestions from checks
    allChecks
      .filter(c => !c.passed && c.details)
      .forEach(check => {
        if (check.details) suggestions.push(check.details)
      })
    
    return {
      sellerTrustScore,
      listingTrustScore,
      overallTrustScore,
      riskScore,
      checks: allChecks,
      totalChecks: allChecks.length,
      passedChecks,
      failedChecks,
      recommendation,
      autoPublish: recommendation === 'publish',
      requiresReview: recommendation === 'review',
      reasoning,
      warnings,
      suggestions: [...new Set(suggestions)], // Remove duplicates
      assessedAt: new Date(),
      assessmentVersion: this.version,
    }
  }

  /**
   * Make final publishing decision based on trust assessment
   */
  private makePublishingDecision(assessment: TrustAssessment): PublishDecision {
    const { recommendation, overallTrustScore, warnings, suggestions } = assessment
    
    let action: PublishRecommendation = recommendation
    let autoPublish = false
    let requiresReview = false
    let requiresImprovement = false
    let reason = ''
    
    switch (recommendation) {
      case 'publish':
        autoPublish = true
        reason = `High trust score (${overallTrustScore}/100) - automatically approved for publishing`
        break
        
      case 'improve':
        requiresImprovement = true
        reason = `Trust score (${overallTrustScore}/100) can be improved. Please address the suggestions below.`
        break
        
      case 'review':
        requiresReview = true
        reason = `Trust score (${overallTrustScore}/100) requires manual review by our team. This typically takes 1-2 hours.`
        break
        
      case 'reject':
        reason = `Trust score (${overallTrustScore}/100) is too low. Please address critical issues and try again.`
        break
    }
    
    // Generate reviewer notes for manual review
    let reviewerNotes: string | undefined
    let flaggedReasons: string[] | undefined
    
    if (requiresReview) {
      reviewerNotes = this.generateReviewerNotes(assessment)
      flaggedReasons = warnings.slice(0, 5) // Top 5 concerns
    }
    
    // Estimate review time
    let estimatedReviewTime: number | undefined
    if (requiresReview) {
      // Base time: 5 minutes
      // +2 minutes per critical issue
      const criticalIssues = assessment.checks.filter(c => !c.passed && c.weight >= 15).length
      estimatedReviewTime = 5 + (criticalIssues * 2)
    }
    
    return {
      action,
      autoPublish,
      requiresReview,
      requiresImprovement,
      reason,
      suggestions: suggestions.slice(0, 5), // Top 5 suggestions
      warnings: warnings.slice(0, 5), // Top 5 warnings
      reviewerNotes,
      flaggedReasons,
      estimatedReviewTime,
    }
  }

  /**
   * Generate notes for manual reviewers
   */
  private generateReviewerNotes(assessment: TrustAssessment): string {
    const notes: string[] = [
      `Trust Scores: Seller ${assessment.sellerTrustScore}/100, Listing ${assessment.listingTrustScore}/100, Overall ${assessment.overallTrustScore}/100`,
      '',
      'Failed Checks:',
    ]
    
    assessment.checks
      .filter(c => !c.passed)
      .forEach(check => {
        notes.push(`- ${check.message}${check.details ? ' (' + check.details + ')' : ''}`)
      })
    
    if (assessment.warnings.length > 0) {
      notes.push('')
      notes.push('Warnings:')
      assessment.warnings.forEach(w => notes.push(`- ${w}`))
    }
    
    return notes.join('\n')
  }

  /**
   * Failsafe assessment when engine fails
   * Always requires manual review to be safe
   */
  private getFailsafeAssessment(
    sellerId: string,
    listingData: ListingVerificationData,
    error: any
  ): TrustEngineResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return {
      assessment: {
        sellerTrustScore: 0,
        listingTrustScore: 0,
        overallTrustScore: 0,
        riskScore: 100,
        checks: [],
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        recommendation: 'review',
        autoPublish: false,
        requiresReview: true,
        reasoning: ['Assessment engine encountered an error'],
        warnings: ['Manual review required due to technical issue'],
        suggestions: [],
        assessedAt: new Date(),
        assessmentVersion: this.version,
      },
      decision: {
        action: 'review',
        autoPublish: false,
        requiresReview: true,
        requiresImprovement: false,
        reason: 'Trust engine encountered an error. Manual review required.',
        suggestions: [],
        warnings: ['Technical issue during assessment'],
        reviewerNotes: `Error: ${errorMessage}\n\nSeller ID: ${sellerId}\nListing: ${listingData.title}\nPrice: ${listingData.price}`,
        flaggedReasons: ['Technical assessment failure'],
        estimatedReviewTime: 10,
      },
      sellerScoreBreakdown: this.getEmptySellerBreakdown(),
      listingScoreBreakdown: this.getEmptyListingBreakdown(),
      metadata: {
        version: this.version,
        processedAt: new Date(),
        processingTime: 0,
      }
    }
  }

  /**
   * Get maximum allowed active listings for a seller based on trust score
   */
  public getMaxActiveListings(sellerTrustScore: number): number {
    if (sellerTrustScore >= 80) {
      return this.config.maxActiveListingsHighTrust
    } else if (sellerTrustScore >= 60) {
      return this.config.maxActiveListingsMediumTrust
    } else if (sellerTrustScore >= 40) {
      return this.config.maxActiveListingsLowTrust
    } else {
      return this.config.maxActiveListingsNewSeller
    }
  }

  /**
   * Get configuration (for testing/debugging)
   */
  public getConfig(): TrustEngineConfig {
    return { ...this.config }
  }

  /**
   * Empty seller breakdown for failsafe
   */
  private getEmptySellerBreakdown(): TrustScoreBreakdown {
    return {
      identityScore: 0,
      identityChecks: {
        googleVerified: 0,
        phoneVerified: 0,
        emailVerified: 0,
        collegeVerified: 0,
        governmentIdVerified: 0,
      },
      accountScore: 0,
      accountChecks: {
        accountAge: 0,
        profileComplete: 0,
        hasProfilePicture: 0,
        hasBio: 0,
        hasLocation: 0,
      },
      activityScore: 0,
      activityChecks: {
        completedSales: 0,
        responseRate: 0,
        avgResponseTime: 0,
      },
      reputationScore: 0,
      reputationChecks: {
        positiveReviews: 0,
        avgRating: 0,
        negativeReviews: 0,
      },
      communityScore: 0,
      communityChecks: {
        inCommunity: 0,
        communityVerified: 0,
        communityReports: 0,
      },
      penaltyScore: 0,
      penaltyChecks: {
        totalReports: 0,
        confirmedViolations: 0,
        previousBans: 0,
        currentlyBanned: 0,
      },
      bonusScore: 0,
      bonusChecks: {
        earlyAdopter: 0,
        referrals: 0,
        communityContribution: 0,
      },
      totalScore: 0,
      grade: 'F',
    }
  }

  /**
   * Empty listing breakdown for failsafe
   */
  private getEmptyListingBreakdown(): ListingTrustScoreBreakdown {
    return {
      photosScore: 0,
      photosChecks: {
        count: 0,
        quality: 0,
        originality: 0,
        noDuplicates: 0,
      },
      contentScore: 0,
      contentChecks: {
        titleQuality: 0,
        descriptionLength: 0,
        descriptionQuality: 0,
      },
      priceScore: 0,
      priceChecks: {
        reasonable: 0,
        notSuspicious: 0,
        withMarketRange: 0,
      },
      verificationScore: 0,
      verificationChecks: {
        categorySpecific: 0,
        liveVerification: 0,
        documentsProvided: 0,
      },
      sellerContributionScore: 0,
      totalScore: 0,
      grade: 'F',
    }
  }
}

// Export singleton instance
export const trustEngine = TrustEngineService.getInstance()
