/**
 * Seller Eligibility Check API Route
 * GET /api/listings/eligibility
 * 
 * Quick check to see if seller can create listings
 * Returns seller trust score and requirements status
 */

import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/backend/middleware/auth'
import { checkSellerRequirements } from '@/backend/middleware/listing-validator'
import { TrustEngineService } from '@/backend/services/trust-engine.service'
import { userRepository } from '@/backend/repositories/user.repository'
import { getTrustGrade, getTrustBadgeColor, getTrustLevel } from '@/shared/utils/trust-score'

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const authResult = await authMiddleware(req)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401 error
    }

    const userId = authResult.uid

    // 2. Get seller data
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

    // 3. Check basic requirements
    const requirements = checkSellerRequirements(seller)

    // 4. Calculate seller trust score using seller verification directly
    let sellerTrustScore = seller.trustScore || 50
    let sellerBreakdown = null

    if (requirements.canCreateListing) {
      try {
        const { SellerVerificationService } = await import('@/backend/services/seller-verification.service')
        const trustEngine = TrustEngineService.getInstance()
        const config = trustEngine.getConfig()
        const sellerVerification = new SellerVerificationService(config)
        const assessment = await sellerVerification.verifySeller(userId)
        sellerTrustScore = assessment.trustScore
        sellerBreakdown = assessment.breakdown
      } catch (error) {
        console.error('[Seller Trust Score Error]', error)
        sellerTrustScore = seller.trustScore || 50
      }
    }

    // 5. Build response
    const trustLevelInfo = getTrustLevel(sellerTrustScore)
    
    return NextResponse.json({
      success: true,
      data: {
        eligible: requirements.canCreateListing,
        
        // Seller info
        seller: {
          id: seller.id,
          name: seller.name,
          trustScore: sellerTrustScore,
          trustGrade: getTrustGrade(sellerTrustScore),
          trustLevel: trustLevelInfo.level,
          trustDescription: trustLevelInfo.description,
          trustColor: getTrustBadgeColor(sellerTrustScore),
          verified: seller.verified,
          phoneVerified: seller.phoneVerified || false,
          emailVerified: seller.emailVerified || false,
          collegeVerified: seller.collegeVerified || false,
          governmentIdVerified: seller.governmentIdVerified || false,
        },
        
        // Requirements status
        requirements: {
          canCreateListing: requirements.canCreateListing,
          reason: requirements.reason,
          missingRequirements: requirements.missingRequirements,
        },
        
        // Verification checklist
        checklist: {
          hasGoogleAccount: !!seller.email,
          hasProfileName: !!seller.name,
          hasLocation: !!seller.city,
          hasProfilePicture: !!seller.photoURL,
          hasPhoneNumber: !!seller.phone || !!seller.phoneNumber,
          notBanned: !seller.isBanned,
        },
        
        // Recommendations
        recommendations: getSellerRecommendations(seller, sellerTrustScore),
        
        // Breakdown (if available)
        breakdown: sellerBreakdown,
      },
    })
    
  } catch (error: any) {
    console.error('[Eligibility Check Error]', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to check eligibility',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * Get personalized recommendations for seller
 */
function getSellerRecommendations(seller: any, trustScore: number): string[] {
  const recommendations: string[] = []

  // Basic profile
  if (!seller.photoURL) {
    recommendations.push('Add a profile picture to increase trust')
  }
  if (!seller.bio || seller.bio.length < 10) {
    recommendations.push('Write a brief bio to introduce yourself')
  }
  if (!seller.phone && !seller.phoneNumber) {
    recommendations.push('Verify your phone number for better trust score')
  }

  // Verification
  if (!seller.phoneVerified) {
    recommendations.push('Complete phone verification (+4 trust points)')
  }
  if (!seller.collegeVerified && !seller.governmentIdVerified) {
    recommendations.push('Verify your college or government ID for higher trust')
  }

  // Community
  if (!seller.communityId) {
    recommendations.push('Join a community to connect with local buyers')
  }

  // Trust score based
  if (trustScore < 50) {
    recommendations.push('Complete your profile and verification to improve trust score')
  } else if (trustScore < 70) {
    recommendations.push('Keep building your reputation by completing sales successfully')
  }

  // Limit to top 3 recommendations
  return recommendations.slice(0, 3)
}
