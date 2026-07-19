/**
 * Trust Assessment API Route
 * POST /api/listings/assess
 * 
 * Performs pre-publish trust assessment on a listing
 * Returns trust score, verification status, and publishing decision
 */

import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/backend/middleware/auth'
import { validateListingInput, checkSellerRequirements } from '@/backend/middleware/listing-validator'
import { TrustEngineService } from '@/backend/services/trust-engine.service'
import { ListingVerificationData } from '@/shared/types/trust.types'
import { CreateListingInput } from '@/shared/types'
import { userRepository } from '@/backend/repositories/user.repository'

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const authResult = await authMiddleware(req)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401 error
    }

    const userId = authResult.uid

    // 2. Parse request body
    let listingData: CreateListingInput
    try {
      listingData = await req.json()
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON format',
        },
        { status: 400 }
      )
    }

    // 3. Validate listing input (minimum requirements)
    const validation = validateListingInput(listingData)
    if (!validation.valid) {
      console.warn('[Assess] Validation failed:', JSON.stringify(validation.errors, null, 2))
      return NextResponse.json(
        {
          success: false,
          message: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      )
    }

    // 4. Check seller requirements
    const seller = await userRepository.getUserById(userId)
    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    const sellerCheck = checkSellerRequirements(seller)
    if (!sellerCheck.canCreateListing) {
      console.warn('[Assess] Seller blocked:', sellerCheck.reason, sellerCheck.missingRequirements)
      return NextResponse.json(
        {
          success: false,
          message: sellerCheck.reason || 'Cannot create listing',
          missingRequirements: sellerCheck.missingRequirements,
        },
        { status: 403 }
      )
    }

    // 5. Build listing verification data
    const verificationData: ListingVerificationData = {
      title: listingData.title,
      description: listingData.description,
      price: listingData.price,
      categoryId: listingData.categoryId,
      images: listingData.images,
      video: listingData.video,
      condition: listingData.condition,
      city: listingData.city,
      locality: listingData.locality,
      communityId: listingData.communityId,
      categorySpecificData: listingData.categorySpecificData,
    }

    // 6. Run trust assessment
    const trustEngine = TrustEngineService.getInstance()
    const result = await trustEngine.assessListing(userId, verificationData)
    const { assessment, decision } = result

    // Map internal action names to frontend-expected values
    const actionMap: Record<string, string> = {
      publish: 'auto_publish',
      improve: 'suggest_improvements',
      review: 'require_review',
      reject: 'reject',
    }
    const frontendAction = actionMap[decision.action] ?? decision.action

    // 7. Generate response based on decision
    const response: any = {
      success: true,
      data: {
        // Overall scores
        overallScore: assessment.overallTrustScore,
        sellerScore: assessment.sellerTrustScore,
        listingScore: assessment.listingTrustScore,

        // Decision — mapped to frontend values
        decision: frontendAction,
        canPublish: decision.autoPublish,
        requiresReview: decision.requiresReview,

        // Trust details
        trustLevel: getTrustLevelDescription(assessment.overallTrustScore),

        // Checks summary
        checksCompleted: (assessment.checks ?? []).filter(c => c.passed).length,
        totalChecks: (assessment.checks ?? []).length,

        // Recommendations
        improvements: [
          ...(decision.suggestions ?? []),
          ...(assessment.suggestions ?? []),
        ].slice(0, 5),

        // Warnings from both sources
        warnings: [
          ...(validation.warnings ?? []),
          ...(decision.warnings ?? []),
        ].slice(0, 5),

        // Timestamps
        assessedAt: assessment.assessedAt,
      },
    }

    // Include detailed breakdown in development
    if (process.env.NODE_ENV === 'development') {
      response.data.debug = {
        sellerBreakdown: result.sellerScoreBreakdown,
        listingBreakdown: result.listingScoreBreakdown,
        allChecks: assessment.checks,
        processingTime: result.metadata.processingTime,
      }
    }

    // 8. Different response messages based on decision
    switch (frontendAction) {
      case 'auto_publish':
        response.message = '✅ Great! Your listing meets all requirements and will be published immediately.'
        break

      case 'suggest_improvements':
        response.message = '⚠️ Your listing can be published, but improving these areas will increase visibility.'
        response.data.suggestedImprovements = decision.suggestions
        break

      case 'require_review':
        response.message = '🔍 Your listing requires manual review before publishing. This usually takes 1-2 hours.'
        response.data.estimatedReviewTime = decision.estimatedReviewTime
          ? `${decision.estimatedReviewTime} minutes`
          : '1-2 hours'
        break

      case 'reject':
        response.success = false
        response.message = '❌ Your listing does not meet minimum requirements. Please address the issues below.'
        response.data.blockers = decision.suggestions
        return NextResponse.json(response, { status: 400 })
    }

    return NextResponse.json(response, { status: 200 })
    
  } catch (error: any) {
    console.error('[Trust Assessment Error]', error)
    
    // Failsafe: if trust engine fails, default to manual review
    return NextResponse.json(
      {
        success: true,
        data: {
          decision: 'require_review',
          canPublish: false,
          requiresReview: true,
          message: 'Unable to complete automatic assessment. Your listing will be reviewed manually.',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      },
      { status: 200 }
    )
  }
}

/**
 * Helper function to get trust level description
 */
function getTrustLevelDescription(score: number): {
  level: string
  color: string
  description: string
} {
  if (score >= 85) {
    return {
      level: 'Excellent',
      color: '#10B981',
      description: 'Your listing has passed all verification checks',
    }
  }
  if (score >= 70) {
    return {
      level: 'Very Good',
      color: '#3B82F6',
      description: 'Your listing meets most requirements',
    }
  }
  if (score >= 55) {
    return {
      level: 'Good',
      color: '#F59E0B',
      description: 'Your listing meets basic requirements',
    }
  }
  if (score >= 40) {
    return {
      level: 'Fair',
      color: '#EF4444',
      description: 'Your listing needs improvements',
    }
  }
  return {
    level: 'Poor',
    color: '#6B7280',
    description: 'Your listing requires significant improvements',
  }
}

/**
 * GET endpoint - check if assessment is available
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401 error
    }

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        version: '1.0.0',
        features: [
          'Seller verification',
          'Listing quality check',
          'Photo verification',
          'Price validation',
          'Category-specific requirements',
        ],
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Service unavailable',
        error: error.message,
      },
      { status: 503 }
    )
  }
}
