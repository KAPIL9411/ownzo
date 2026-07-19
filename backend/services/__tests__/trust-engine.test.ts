/**
 * Trust Engine Test Suite
 * Tests the complete trust assessment flow with various scenarios
 *
 * Run: npx jest backend/services/__tests__/trust-engine.test.ts
 */

import { TrustEngineService } from '../trust-engine.service'
import { ListingVerificationData } from '@/shared/types/trust.types'

// Mock user repository
jest.mock('@/backend/repositories/user.repository', () => ({
  userRepository: {
    getUserById: jest.fn(),
  },
}))

import { userRepository } from '@/backend/repositories/user.repository'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockGetUserById = userRepository.getUserById as jest.MockedFunction<
  typeof userRepository.getUserById
>

const makeSeller = (overrides: Record<string, any> = {}) => ({
  id: 'seller1',
  name: 'Test Seller',
  email: 'test@gmail.com',
  city: 'Mumbai',
  trustScore: 60,
  reviewCount: 0,
  listingCount: 0,
  verified: false,
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(),
  ...overrides,
})

const makeListing = (overrides: Partial<ListingVerificationData> = {}): ListingVerificationData => ({
  title: 'Good Product Title for Listing',
  description: 'Detailed description of the product with all relevant information included for buyers.',
  price: 5000,
  categoryId: 'electronics',
  condition: 'good',
  images: [
    'https://firebasestorage.googleapis.com/img1.jpg',
    'https://firebasestorage.googleapis.com/img2.jpg',
    'https://firebasestorage.googleapis.com/img3.jpg',
  ],
  city: 'Mumbai',
  ...overrides,
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Trust Engine', () => {
  let trustEngine: TrustEngineService

  beforeEach(() => {
    jest.clearAllMocks()
    trustEngine = TrustEngineService.getInstance()
  })

  // ==================== LISTING ASSESSMENT ====================

  describe('assessListing()', () => {
    it('gives high score to verified seller with quality listing', async () => {
      mockGetUserById.mockResolvedValue(makeSeller({
        phoneVerified: true,
        emailVerified: true,
        collegeVerified: true,
        photoURL: 'https://example.com/photo.jpg',
        bio: 'Trusted seller since 2023',
        trustScore: 90,
        rating: 4.9,
        reviewCount: 50,
        listingCount: 55,
        verified: true,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      }))

      const result = await trustEngine.assessListing('seller1', makeListing({
        title: 'iPhone 14 Pro Max 256GB - Pristine, Original Box',
        description: 'Selling my iPhone 14 Pro Max 256GB. Bought 5 months ago from Apple Store. Battery health 99%. Original box, charger, and Apple Care+ until 2025. No scratches — always in a case. Reason for selling: upgrading.',
        price: 90000,
        images: [
          'https://firebasestorage.googleapis.com/img1.jpg',
          'https://firebasestorage.googleapis.com/img2.jpg',
          'https://firebasestorage.googleapis.com/img3.jpg',
          'https://firebasestorage.googleapis.com/img4.jpg',
        ],
      }))

      expect(result.assessment.overallTrustScore).toBeGreaterThan(70)
      expect(result.decision.autoPublish).toBe(true)
    })

    it('flags low-quality listing', async () => {
      mockGetUserById.mockResolvedValue(makeSeller())

      const result = await trustEngine.assessListing('seller1', makeListing({
        title: 'iPhone',
        description: 'phone',
        images: ['https://firebasestorage.googleapis.com/img1.jpg'],
      }))

      expect(result.decision.action).toMatch(/suggest_improvements|review|reject/)
      expect((result.decision.suggestions ?? []).length).toBeGreaterThan(0)
    })

    it('requires verification photo for high-value items', async () => {
      mockGetUserById.mockResolvedValue(makeSeller({ verified: true, trustScore: 70 }))

      const result = await trustEngine.assessListing('seller1', makeListing({
        price: 180000,
        images: [
          'https://firebasestorage.googleapis.com/img1.jpg',
          'https://firebasestorage.googleapis.com/img2.jpg',
          'https://firebasestorage.googleapis.com/img3.jpg',
        ],
        categorySpecificData: undefined,
      }))

      const verificationCheck = (result.assessment.checks ?? []).find(
        c => c.type === 'listing_verification_photo'
      )
      expect(verificationCheck?.passed).toBe(false)
    })

    it('approves high-value item WITH verification photo', async () => {
      mockGetUserById.mockResolvedValue(makeSeller({
        phoneVerified: true,
        verified: true,
        trustScore: 80,
        reviewCount: 10,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      }))

      const result = await trustEngine.assessListing('seller1', makeListing({
        title: 'Royal Enfield Classic 350 2022 - Single Owner All Docs',
        description: 'Well-maintained Royal Enfield Classic 350 2022. Single owner, all service records from authorised centre. Driven 5,000 km. No accidents. Full documentation ready for transfer. Insurance valid till 2025.',
        price: 150000,
        categoryId: 'vehicles',
        images: [
          'https://firebasestorage.googleapis.com/img1.jpg',
          'https://firebasestorage.googleapis.com/img2.jpg',
          'https://firebasestorage.googleapis.com/img3.jpg',
          'https://firebasestorage.googleapis.com/img4.jpg',
          'https://firebasestorage.googleapis.com/img5.jpg',
        ],
        categorySpecificData: {
          verificationPhoto: 'https://firebasestorage.googleapis.com/verif.jpg',
          serialNumber: 'RE350-2022-12345',
        },
      }))

      const verificationCheck = (result.assessment.checks ?? []).find(
        c => c.type === 'listing_verification_photo'
      )
      expect(verificationCheck?.passed).toBe(true)
      expect(result.assessment.listingTrustScore).toBeGreaterThan(70)
    })
  })

  // ==================== PUBLISHING DECISIONS ====================

  describe('Publishing Decisions', () => {
    it('auto-publishes when overall score >= 80', async () => {
      mockGetUserById.mockResolvedValue(makeSeller({
        phoneVerified: true,
        emailVerified: true,
        collegeVerified: true,
        photoURL: 'https://example.com/p.jpg',
        bio: 'Trusted seller',
        trustScore: 92,
        rating: 4.9,
        reviewCount: 50,
        verified: true,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      }))

      const result = await trustEngine.assessListing('seller1', makeListing({
        title: 'Samsung Galaxy S23 Ultra - Mint Condition with Box',
        description: 'Selling Samsung Galaxy S23 Ultra. 4 months old, mint condition. Original accessories, warranty valid until 2025. No scratches — always used with a cover.',
        price: 95000,
        images: [
          'https://firebasestorage.googleapis.com/img1.jpg',
          'https://firebasestorage.googleapis.com/img2.jpg',
          'https://firebasestorage.googleapis.com/img3.jpg',
          'https://firebasestorage.googleapis.com/img4.jpg',
        ],
      }))

      expect(result.decision.action).toBe('publish')
      expect(result.decision.autoPublish).toBe(true)
      expect(result.assessment.overallTrustScore).toBeGreaterThanOrEqual(80)
    })

    it('requires review for new sellers with weak listings', async () => {
      mockGetUserById.mockResolvedValue(makeSeller({
        trustScore: 20,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      }))

      const result = await trustEngine.assessListing('seller1', makeListing({
        title: 'Laptop',
        description: 'Works fine.',
        images: ['https://firebasestorage.googleapis.com/img1.jpg'],
      }))

      expect(result.decision.requiresReview).toBe(true)
      expect(result.decision.autoPublish).toBe(false)
    })

    it('provides failsafe assessment when DB errors occur', async () => {
      mockGetUserById.mockRejectedValue(new Error('Firestore timeout'))

      const result = await trustEngine.assessListing('seller1', makeListing())

      // Failsafe should always be manual review, never auto-publish
      expect(result.decision.autoPublish).toBe(false)
      expect(result.decision.requiresReview).toBe(true)
    })
  })

  // ==================== WEIGHTED SCORING ====================

  describe('Weighted Scoring (40% Seller / 60% Listing)', () => {
    it('calculates overall score as 40% seller + 60% listing', async () => {
      mockGetUserById.mockResolvedValue(makeSeller({
        phoneVerified: true,
        verified: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      }))

      const result = await trustEngine.assessListing('seller1', makeListing())

      const { sellerTrustScore, listingTrustScore, overallTrustScore } = result.assessment
      const expected = Math.round(sellerTrustScore * 0.4 + listingTrustScore * 0.6)

      expect(Math.abs(overallTrustScore - expected)).toBeLessThanOrEqual(1)
    })
  })
})

export { TrustEngineService }
