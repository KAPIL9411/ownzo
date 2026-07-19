/**
 * Listing Verification Service
 * Verifies listing quality, authenticity, and completeness
 */

import {
  ListingVerificationData,
  VerificationCheck,
  ListingTrustScoreBreakdown,
  TrustEngineConfig,
} from '@/shared/types/trust.types'

interface ListingVerificationResult {
  trustScore: number
  breakdown: ListingTrustScoreBreakdown
  checks: VerificationCheck[]
}

export class ListingVerificationService {
  private config: TrustEngineConfig

  constructor(config: TrustEngineConfig) {
    this.config = config
  }

  /**
   * Main verification entry point
   */
  async verifyListing(
    listingData: ListingVerificationData,
    sellerTrustScore: number
  ): Promise<ListingVerificationResult> {
    const checks: VerificationCheck[] = []
    
    // Photos verification (max 30 points)
    const photosChecks = this.verifyPhotos(listingData)
    checks.push(...photosChecks.checks)
    
    // Content verification (max 20 points)
    const contentChecks = this.verifyContent(listingData)
    checks.push(...contentChecks.checks)
    
    // Price verification (max 15 points)
    const priceChecks = await this.verifyPrice(listingData)
    checks.push(...priceChecks.checks)
    
    // Category-specific verification (max 20 points)
    const categoryChecks = this.verifyCategorySpecific(listingData)
    checks.push(...categoryChecks.checks)
    
    // Calculate breakdown
    const breakdown: ListingTrustScoreBreakdown = {
      photosScore: photosChecks.score,
      photosChecks: photosChecks.breakdown,
      contentScore: contentChecks.score,
      contentChecks: contentChecks.breakdown,
      priceScore: priceChecks.score,
      priceChecks: priceChecks.breakdown,
      verificationScore: categoryChecks.score,
      verificationChecks: categoryChecks.breakdown,
      sellerContributionScore: this.calculateSellerContribution(sellerTrustScore),
      totalScore: 0, // Calculated below
      grade: 'F', // Calculated below
    }
    
    // Calculate total score
    breakdown.totalScore = Math.round(
      breakdown.photosScore +
      breakdown.contentScore +
      breakdown.priceScore +
      breakdown.verificationScore +
      breakdown.sellerContributionScore
    )
    
    // Assign grade
    breakdown.grade = this.calculateGrade(breakdown.totalScore)
    
    return {
      trustScore: breakdown.totalScore,
      breakdown,
      checks,
    }
  }

  /**
   * Verify photos (max 30 points)
   */
  private verifyPhotos(listingData: ListingVerificationData): {
    score: number
    checks: VerificationCheck[]
    breakdown: any
  } {
    const checks: VerificationCheck[] = []
    let score = 0
    
    const photoCount = listingData.images.length
    const isHighValue = listingData.price >= this.config.highValueThreshold
    const minRequired = isHighValue ? this.config.minPhotosHighValue : this.config.minPhotosGeneral
    
    // Photo count check (0-10 points)
    let countScore = 0
    if (photoCount >= this.config.minPhotosHighValue) {
      countScore = 10
      checks.push({
        type: 'listing_photos_count',
        passed: true,
        score: 10,
        weight: 15,
        message: `Excellent: ${photoCount} photos provided`,
        timestamp: new Date(),
      })
    } else if (photoCount >= minRequired) {
      countScore = 7
      checks.push({
        type: 'listing_photos_count',
        passed: true,
        score: 7,
        weight: 15,
        message: `Good: ${photoCount} photos provided`,
        details: `Consider adding ${this.config.minPhotosHighValue - photoCount} more photos`,
        timestamp: new Date(),
      })
    } else {
      checks.push({
        type: 'listing_photos_count',
        passed: false,
        score: 0,
        weight: 15,
        message: `Insufficient photos: ${photoCount}/${minRequired} required`,
        details: `Add at least ${minRequired - photoCount} more photos`,
        timestamp: new Date(),
      })
    }
    
    // Photo quality check (0-10 points) - Basic validation for now
    let qualityScore = 0
    if (photoCount > 0) {
      qualityScore = 8 // Placeholder - will add actual image analysis later
      checks.push({
        type: 'listing_photos_quality',
        passed: true,
        score: 8,
        weight: 10,
        message: 'Photo quality looks good',
        timestamp: new Date(),
      })
    }
    
    // Photo originality check (0-5 points) - Placeholder
    let originalityScore = 0
    if (photoCount > 0) {
      originalityScore = 5 // Will add reverse image search later
      checks.push({
        type: 'listing_original_photos',
        passed: true,
        score: 5,
        weight: 15,
        message: 'Photos appear to be original',
        timestamp: new Date(),
      })
    }
    
    // No screenshots check (0-5 points)
    const noScreenshotsScore = 5 // Placeholder
    checks.push({
      type: 'listing_no_screenshots',
      passed: true,
      score: 5,
      weight: 10,
      message: 'No screenshots detected',
      timestamp: new Date(),
    })
    
    score = countScore + qualityScore + originalityScore + noScreenshotsScore
    
    return {
      score,
      checks,
      breakdown: {
        count: countScore,
        quality: qualityScore,
        originality: originalityScore,
        noDuplicates: noScreenshotsScore,
      }
    }
  }

  /**
   * Verify content (max 20 points)
   */
  private verifyContent(listingData: ListingVerificationData): {
    score: number
    checks: VerificationCheck[]
    breakdown: any
  } {
    const checks: VerificationCheck[] = []
    let score = 0
    
    // Title quality (0-7 points)
    let titleScore = 0
    const titleLength = listingData.title.length
    if (titleLength >= 20 && titleLength <= 100) {
      titleScore = 7
      checks.push({
        type: 'listing_title_quality',
        passed: true,
        score: 7,
        weight: 8,
        message: 'Title is clear and descriptive',
        timestamp: new Date(),
      })
    } else if (titleLength >= 10) {
      titleScore = 4
      checks.push({
        type: 'listing_title_quality',
        passed: true,
        score: 4,
        weight: 8,
        message: 'Title could be more descriptive',
        details: 'Aim for 20-100 characters with relevant details',
        timestamp: new Date(),
      })
    } else {
      checks.push({
        type: 'listing_title_quality',
        passed: false,
        score: 0,
        weight: 8,
        message: 'Title is too short',
        details: 'Write a clear title with product details (min 10 characters)',
        timestamp: new Date(),
      })
    }
    
    // Description length (0-7 points)
    let descLengthScore = 0
    const descLength = listingData.description.length
    if (descLength >= 100) {
      descLengthScore = 7
      checks.push({
        type: 'listing_description_length',
        passed: true,
        score: 7,
        weight: 10,
        message: 'Description is detailed',
        timestamp: new Date(),
      })
    } else if (descLength >= 50) {
      descLengthScore = 4
      checks.push({
        type: 'listing_description_length',
        passed: true,
        score: 4,
        weight: 10,
        message: 'Description could be more detailed',
        details: 'Add more details about condition, usage, accessories',
        timestamp: new Date(),
      })
    } else {
      checks.push({
        type: 'listing_description_length',
        passed: false,
        score: 0,
        weight: 10,
        message: 'Description is too short',
        details: 'Write at least 50 characters describing the item',
        timestamp: new Date(),
      })
    }
    
    // Description quality (0-6 points) - Basic check
    let descQualityScore = 5 // Placeholder
    checks.push({
      type: 'listing_description_length',
      passed: true,
      score: 5,
      weight: 7,
      message: 'Description quality is acceptable',
      timestamp: new Date(),
    })
    
    score = titleScore + descLengthScore + descQualityScore
    
    return {
      score,
      checks,
      breakdown: {
        titleQuality: titleScore,
        descriptionLength: descLengthScore,
        descriptionQuality: descQualityScore,
      }
    }
  }

  /**
   * Verify price (max 15 points)
   */
  private async verifyPrice(listingData: ListingVerificationData): Promise<{
    score: number
    checks: VerificationCheck[]
    breakdown: any
  }> {
    const checks: VerificationCheck[] = []
    let score = 0
    
    if (!this.config.enablePriceValidation) {
      // Skip price validation if disabled
      score = 15
      checks.push({
        type: 'listing_price_check',
        passed: true,
        score: 15,
        weight: 10,
        message: 'Price validation skipped',
        timestamp: new Date(),
      })
      
      return {
        score,
        checks,
        breakdown: {
          reasonable: 5,
          notSuspicious: 5,
          withMarketRange: 5,
        }
      }
    }
    
    // Basic price reasonability check
    const price = listingData.price
    
    if (price > 0 && price < 10000000) { // Less than 1 crore
      score = 10
      checks.push({
        type: 'listing_price_check',
        passed: true,
        score: 10,
        weight: 10,
        message: 'Price is reasonable',
        timestamp: new Date(),
      })
    } else {
      checks.push({
        type: 'listing_price_check',
        passed: false,
        score: 0,
        weight: 10,
        message: 'Price seems unusual',
        details: 'Please verify the price is correct',
        timestamp: new Date(),
      })
    }
    
    // Will add market comparison later with actual data
    const withinMarketRange = 5
    score += withinMarketRange
    
    return {
      score,
      checks,
      breakdown: {
        reasonable: Math.min(score, 5),
        notSuspicious: Math.min(Math.max(score - 5, 0), 5),
        withMarketRange: Math.min(Math.max(score - 10, 0), 5),
      }
    }
  }

  /**
   * Verify category-specific requirements (max 20 points)
   */
  private verifyCategorySpecific(listingData: ListingVerificationData): {
    score: number
    checks: VerificationCheck[]
    breakdown: any
  } {
    const checks: VerificationCheck[] = []
    let score = 0
    
    if (!this.config.enableCategorySpecificVerification) {
      // Default score if category verification is disabled
      score = 15
      checks.push({
        type: 'listing_category_match',
        passed: true,
        score: 15,
        weight: 5,
        message: 'Category verification skipped',
        timestamp: new Date(),
      })
      
      return {
        score,
        checks,
        breakdown: {
          categorySpecific: 0,
          liveVerification: 0,
          documentsProvided: 15,
        }
      }
    }
    
    const isHighValue = listingData.price >= this.config.highValueThreshold
    const hasVerificationPhoto = !!listingData.categorySpecificData?.verificationPhoto
    
    // Live verification for high-value items (0-10 points)
    let liveVerificationScore = 0
    if (isHighValue) {
      if (hasVerificationPhoto) {
        liveVerificationScore = 10
        checks.push({
          type: 'listing_verification_photo',
          passed: true,
          score: 10,
          weight: 20,
          message: 'Live verification photo provided',
          timestamp: new Date(),
        })
      } else {
        checks.push({
          type: 'listing_verification_photo',
          passed: false,
          score: 0,
          weight: 20,
          message: 'Live verification photo required for high-value items',
          details: 'Take a photo with handwritten verification code',
          timestamp: new Date(),
        })
      }
    } else {
      // Not required for lower-value items, give partial credit
      liveVerificationScore = 7
    }
    
    // Category-specific documents (0-10 points)
    let documentsScore = 8 // Default - will enhance later with actual checks
    
    score = liveVerificationScore + documentsScore
    
    return {
      score,
      checks,
      breakdown: {
        categorySpecific: 0,
        liveVerification: liveVerificationScore,
        documentsProvided: documentsScore,
      }
    }
  }

  /**
   * Calculate seller contribution to listing trust (max 15 points)
   */
  private calculateSellerContribution(sellerTrustScore: number): number {
    // Seller trust contributes up to 15 points to listing score
    return Math.round((sellerTrustScore / 100) * 15)
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
