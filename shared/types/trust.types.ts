/**
 * Trust Engine Types
 * Core interfaces for Ownzo's trust and verification system
 */

// ============================================================================
// VERIFICATION CHECK
// ============================================================================

export interface VerificationCheck {
  type: VerificationCheckType
  passed: boolean
  score: number
  weight: number
  message: string
  details?: string
  timestamp: Date
}

export type VerificationCheckType =
  // Seller checks
  | 'seller_verified'
  | 'seller_google_verified'
  | 'seller_phone_verified'
  | 'seller_email_verified'
  | 'seller_college_verified'
  | 'seller_government_id_verified'
  | 'seller_account_age'
  | 'seller_profile_complete'
  | 'seller_in_community'
  | 'seller_trust_score'
  | 'seller_completed_sales'
  | 'seller_positive_reviews'
  | 'seller_no_reports'
  | 'seller_response_rate'
  | 'seller_active_listings_limit'
  
  // Listing checks
  | 'listing_photos_count'
  | 'listing_photos_quality'
  | 'listing_original_photos'
  | 'listing_no_screenshots'
  | 'listing_description_length'
  | 'listing_title_quality'
  | 'listing_price_check'
  | 'listing_no_duplicates'
  | 'listing_category_match'
  | 'listing_verification_photo'
  
  // Category-specific
  | 'category_phone_imei'
  | 'category_bike_rc'
  | 'category_laptop_serial'

// ============================================================================
// TRUST ASSESSMENT
// ============================================================================

export interface TrustAssessment {
  // Core scores
  sellerTrustScore: number        // 0-100
  listingTrustScore: number       // 0-100
  overallTrustScore: number       // Weighted average
  riskScore: number               // 0-100 (inverse of trust)
  
  // Checks
  checks: VerificationCheck[]
  totalChecks: number
  passedChecks: number
  failedChecks: number
  
  // Decision
  recommendation: PublishRecommendation
  autoPublish: boolean
  requiresReview: boolean
  
  // Reasoning
  reasoning: string[]
  warnings: string[]
  suggestions: string[]
  
  // Metadata
  assessedAt: Date
  assessmentVersion: string
}

export type PublishRecommendation = 'publish' | 'improve' | 'review' | 'reject'

// ============================================================================
// ENHANCED SELLER TRUST DATA
// ============================================================================

export interface EnhancedTrustScoreData {
  // Identity verification
  googleVerified: boolean
  phoneVerified: boolean
  emailVerified: boolean
  collegeVerified: boolean
  governmentIdVerified: boolean
  
  // Account information
  accountAge: number              // Days since creation
  profileComplete: boolean
  hasProfilePicture: boolean
  hasBio: boolean
  hasLocation: boolean
  lastActiveAt: Date
  
  // Activity metrics
  totalListings: number
  activeListings: number
  completedSales: number
  cancelledSales: number
  avgListingDuration: number      // Days until sold
  responseRate: number            // 0-100%
  avgResponseTime: number         // Hours
  
  // Reputation
  totalReviews: number
  positiveReviews: number
  negativeReviews: number
  neutralReviews: number
  avgRating: number               // 0-5
  
  // Community
  inCommunity: boolean
  communityVerified: boolean
  communityMemberDuration: number // Days
  communityReports: number
  
  // Violations & reports
  totalReports: number
  confirmedViolations: number
  previousBans: number
  currentlyBanned: boolean
  warningCount: number
}

// ============================================================================
// LISTING VERIFICATION DATA
// ============================================================================

export interface ListingVerificationData {
  // Basic info
  title: string
  description: string
  categoryId: string
  price: number
  condition: string
  
  // Photos
  images: string[]
  video?: string
  
  // Seller info (optional — assessListing receives sellerId separately)
  sellerId?: string
  sellerTrustScore?: number
  
  // Community
  communityId?: string
  city: string
  locality?: string
  
  // Category-specific
  categorySpecificData?: CategorySpecificData
}

export interface CategorySpecificData {
  // Phone
  imei?: string
  batteryHealth?: number
  
  // Bike
  rcNumber?: string
  vehicleNumber?: string
  rcPhoto?: string
  
  // Laptop
  serialNumber?: string
  systemInfoScreenshot?: string
  
  // High-value items
  verificationCode?: string
  verificationPhoto?: string
  invoicePhoto?: string
}

// ============================================================================
// PHOTO VERIFICATION
// ============================================================================

export interface PhotoVerificationResult {
  photoUrl: string
  isOriginal: boolean
  isScreenshot: boolean
  hasExifData: boolean
  quality: 'high' | 'medium' | 'low'
  duplicateFound: boolean
  duplicateListingId?: string
  confidence: number              // 0-100
  checks: {
    reverseImageSearch: boolean
    exifDataPresent: boolean
    resolutionCheck: boolean
    screenshotDetection: boolean
  }
}

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

export interface DuplicateCheckResult {
  isDuplicate: boolean
  duplicateType: 'exact' | 'similar' | 'none'
  duplicateListingId?: string
  similarity: number              // 0-100
  matchedFields: string[]
}

// ============================================================================
// PRICE VALIDATION
// ============================================================================

export interface PriceValidation {
  price: number
  categoryAvgPrice: number
  categoryMinPrice: number
  categoryMaxPrice: number
  priceDeviation: number          // Percentage from average
  isReasonable: boolean
  isSuspicious: boolean
  reason?: string
}

// ============================================================================
// TRUST SCORE BREAKDOWN
// ============================================================================

export interface TrustScoreBreakdown {
  // Identity (max 20 points)
  identityScore: number
  identityChecks: {
    googleVerified: number
    phoneVerified: number
    emailVerified: number
    collegeVerified: number
    governmentIdVerified: number
  }
  
  // Account (max 15 points)
  accountScore: number
  accountChecks: {
    accountAge: number
    profileComplete: number
    hasProfilePicture: number
    hasBio: number
    hasLocation: number
  }
  
  // Activity (max 25 points)
  activityScore: number
  activityChecks: {
    completedSales: number
    responseRate: number
    avgResponseTime: number
  }
  
  // Reputation (max 25 points)
  reputationScore: number
  reputationChecks: {
    positiveReviews: number
    avgRating: number
    negativeReviews: number
  }
  
  // Community (max 10 points)
  communityScore: number
  communityChecks: {
    inCommunity: number
    communityVerified: number
    communityReports: number
  }
  
  // Penalties (max -50 points)
  penaltyScore: number
  penaltyChecks: {
    totalReports: number
    confirmedViolations: number
    previousBans: number
    currentlyBanned: number
  }
  
  // Bonuses (max +5 points)
  bonusScore: number
  bonusChecks: {
    earlyAdopter: number
    referrals: number
    communityContribution: number
  }
  
  // Final
  totalScore: number              // Sum of all (0-100)
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
}

// ============================================================================
// LISTING TRUST SCORE BREAKDOWN
// ============================================================================

export interface ListingTrustScoreBreakdown {
  // Photos (max 30 points)
  photosScore: number
  photosChecks: {
    count: number
    quality: number
    originality: number
    noDuplicates: number
  }
  
  // Content (max 20 points)
  contentScore: number
  contentChecks: {
    titleQuality: number
    descriptionLength: number
    descriptionQuality: number
  }
  
  // Price (max 15 points)
  priceScore: number
  priceChecks: {
    reasonable: number
    notSuspicious: number
    withMarketRange: number
  }
  
  // Verification (max 20 points)
  verificationScore: number
  verificationChecks: {
    categorySpecific: number
    liveVerification: number
    documentsProvided: number
  }
  
  // Seller contribution (max 15 points)
  sellerContributionScore: number
  
  // Final
  totalScore: number              // Sum of all (0-100)
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
}

// ============================================================================
// PUBLISH DECISION
// ============================================================================

export interface PublishDecision {
  action: PublishRecommendation
  autoPublish: boolean
  requiresReview: boolean
  requiresImprovement: boolean
  
  // Reasoning
  reason: string
  suggestions: string[]
  warnings: string[]
  
  // Review notes (for manual reviewers)
  reviewerNotes?: string
  flaggedReasons?: string[]
  
  // Estimated review time
  estimatedReviewTime?: number    // Minutes
}

// ============================================================================
// TRUST ENGINE CONFIG
// ============================================================================

export interface TrustEngineConfig {
  // Publishing thresholds
  autoPublishThreshold: number    // Default: 80
  manualReviewThreshold: number   // Default: 60
  rejectThreshold: number         // Default: 40
  
  // Seller limits
  maxActiveListingsNewSeller: number      // Default: 1
  maxActiveListingsLowTrust: number       // Default: 3
  maxActiveListingsMediumTrust: number    // Default: 5
  maxActiveListingsHighTrust: number      // Default: 10
  
  // Photo requirements
  minPhotosGeneral: number        // Default: 3
  minPhotosHighValue: number      // Default: 5
  maxPhotos: number               // Default: 10
  highValueThreshold: number      // Default: 10000 (₹)
  
  // Price validation
  priceDeviationThreshold: number // Default: 300% (3x average)
  priceMinThreshold: number       // Default: 30% of average
  
  // Feature flags
  enableAIMetadata: boolean
  enableDuplicateDetection: boolean
  enablePhotoVerification: boolean
  enablePriceValidation: boolean
  enableCategorySpecificVerification: boolean
  
  // API keys (from env)
  openaiApiKey?: string
  googleVisionApiKey?: string
  reverseImageSearchApiKey?: string
}

// ============================================================================
// TRUST ENGINE RESULT
// ============================================================================

export interface TrustEngineResult {
  assessment: TrustAssessment
  decision: PublishDecision
  sellerScoreBreakdown: TrustScoreBreakdown
  listingScoreBreakdown: ListingTrustScoreBreakdown
  metadata: {
    version: string
    processedAt: Date
    processingTime: number          // Milliseconds
  }
}
