/**
 * Trust Engine Service - Frontend API Client
 * Handles all trust-related API calls
 */

import { ApiService } from './api.service'

export interface TrustAssessmentRequest {
  title: string
  description: string
  price: number
  categoryId: string
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
  city: string
  locality?: string
  communityId?: string
  images: string[]
  video?: string
  categorySpecificData?: {
    verificationPhoto?: string
    invoice?: string
    serialNumber?: string
  }
}

export interface TrustAssessmentResponse {
  success: boolean
  message: string
  data: {
    overallScore: number
    sellerScore: number
    listingScore: number
    decision: 'auto_publish' | 'suggest_improvements' | 'require_review' | 'reject'
    canPublish: boolean
    requiresReview: boolean
    trustLevel: {
      level: string
      color: string
      description: string
    }
    checksCompleted: number
    totalChecks: number
    improvements: string[]
    warnings?: string[]
    assessedAt: string
  }
}

export interface EligibilityResponse {
  success: boolean
  data: {
    eligible: boolean
    seller: {
      id: string
      name: string
      trustScore: number
      trustGrade: string
      trustLevel: string
      trustDescription: string
      trustColor: string
      verified: boolean
      phoneVerified: boolean
      emailVerified: boolean
      collegeVerified: boolean
      governmentIdVerified: boolean
    }
    requirements: {
      canCreateListing: boolean
      reason?: string
      missingRequirements?: string[]
    }
    checklist: {
      hasGoogleAccount: boolean
      hasProfileName: boolean
      hasLocation: boolean
      hasProfilePicture: boolean
      hasPhoneNumber: boolean
      notBanned: boolean
    }
    recommendations: string[]
    breakdown?: any
  }
}

class TrustEngineServiceClass {
  /**
   * Check if seller is eligible to create listings
   */
  async checkEligibility(): Promise<EligibilityResponse> {
    const response = await ApiService.get<EligibilityResponse>('/listings/eligibility')
    return response as EligibilityResponse
  }

  /**
   * Assess a listing before creation
   */
  async assessListing(data: TrustAssessmentRequest): Promise<TrustAssessmentResponse> {
    const response = await ApiService.post<TrustAssessmentResponse>('/listings/assess', data)
    return response as TrustAssessmentResponse
  }

  /**
   * Get trust engine health status
   */
  async getHealthStatus(): Promise<any> {
    const response = await ApiService.get('/trust-engine/health')
    return response
  }

  /**
   * Get trust badge color based on score
   */
  getTrustBadgeColor(score: number): string {
    if (score >= 85) return '#10B981' // Green
    if (score >= 70) return '#3B82F6' // Blue
    if (score >= 55) return '#F59E0B' // Yellow
    if (score >= 40) return '#EF4444' // Red
    return '#6B7280' // Gray
  }

  /**
   * Get trust level text based on score
   */
  getTrustLevel(score: number): {
    level: string
    description: string
    emoji: string
  } {
    if (score >= 85) {
      return {
        level: 'Excellent',
        description: 'Highly trusted seller',
        emoji: '🌟',
      }
    }
    if (score >= 70) {
      return {
        level: 'Very Good',
        description: 'Trusted seller',
        emoji: '✅',
      }
    }
    if (score >= 55) {
      return {
        level: 'Good',
        description: 'Reliable seller',
        emoji: '👍',
      }
    }
    if (score >= 40) {
      return {
        level: 'Fair',
        description: 'New seller',
        emoji: '⚠️',
      }
    }
    return {
      level: 'Poor',
      description: 'Limited verification',
      emoji: '❌',
    }
  }

  /**
   * Format decision message for UI
   */
  getDecisionMessage(decision: string): {
    title: string
    message: string
    icon: string
    color: string
  } {
    switch (decision) {
      case 'auto_publish':
        return {
          title: 'Listing Approved!',
          message: 'Your listing meets all requirements and will be published immediately.',
          icon: '✅',
          color: 'green',
        }
      case 'suggest_improvements':
        return {
          title: 'Published with Suggestions',
          message: 'Your listing is live! Consider these improvements for better visibility.',
          icon: '⚠️',
          color: 'yellow',
        }
      case 'require_review':
        return {
          title: 'Review Required',
          message: 'Your listing will be reviewed manually within 24-48 hours.',
          icon: '🔍',
          color: 'blue',
        }
      case 'reject':
        return {
          title: 'Listing Not Approved',
          message: 'Please address these issues before resubmitting.',
          icon: '❌',
          color: 'red',
        }
      default:
        return {
          title: 'Processing',
          message: 'Checking your listing...',
          icon: '⏳',
          color: 'gray',
        }
    }
  }
}

export const TrustEngineService = new TrustEngineServiceClass()
