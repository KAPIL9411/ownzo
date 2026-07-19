/**
 * Manual Trust Engine Test
 * Run this to quickly test the trust engine with sample data
 *
 * Usage: tsx backend/services/__tests__/manual-trust-test.ts
 */

import { TrustEngineService } from '../trust-engine.service'
import { ListingVerificationData } from '@/shared/types/trust.types'

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_SELLERS = {
  excellent: {
    id: 'excellent_seller',
    name: 'Rahul Sharma',
    email: 'rahul@gmail.com',
    photoURL: 'https://example.com/rahul.jpg',
    phone: '+919876543210',
    phoneVerified: true,
    emailVerified: true,
    collegeVerified: true,
    city: 'Mumbai',
    bio: 'Tech enthusiast and trusted seller since 2023',
    trustScore: 92,
    rating: 4.9,
    reviewCount: 47,
    listingCount: 52,
    verified: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  good: {
    id: 'good_seller',
    name: 'Priya Patel',
    email: 'priya@gmail.com',
    photoURL: 'https://example.com/priya.jpg',
    phoneVerified: true,
    emailVerified: true,
    city: 'Bangalore',
    bio: 'Selling pre-loved items',
    trustScore: 75,
    rating: 4.5,
    reviewCount: 12,
    listingCount: 15,
    verified: true,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  new: {
    id: 'new_seller',
    name: 'Amit Kumar',
    email: 'amit@gmail.com',
    city: 'Delhi',
    trustScore: 35,
    reviewCount: 0,
    listingCount: 0,
    verified: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  problematic: {
    id: 'problematic_seller',
    name: 'Suspicious User',
    email: 'suspicious@gmail.com',
    city: 'Kolkata',
    trustScore: 18,
    reportCount: 4,
    reviewCount: 8,
    rating: 2.1,
    listingCount: 3,
    verified: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
}

const SAMPLE_LISTINGS = {
  highQuality: {
    title: 'iPhone 14 Pro Max 256GB - Pristine Condition with Warranty',
    description:
      'Selling my iPhone 14 Pro Max 256GB in pristine condition. Purchased 6 months ago from Apple Store, original invoice available. Battery health: 100%. Comes with original box, all accessories, and Apple Care+ valid till Dec 2024. Reason for selling: Upgrading to iPhone 15.',
    price: 95000,
    categoryId: 'electronics',
    condition: 'like-new' as const,
    images: [
      'https://firebasestorage.googleapis.com/img1.jpg',
      'https://firebasestorage.googleapis.com/img2.jpg',
      'https://firebasestorage.googleapis.com/img3.jpg',
      'https://firebasestorage.googleapis.com/img4.jpg',
      'https://firebasestorage.googleapis.com/img5.jpg',
    ],
    city: 'Mumbai',
    locality: 'Andheri',
  },
  decent: {
    title: 'Study Table and Chair Set - Good Condition',
    description:
      'Selling my study table and chair set. Both are in good condition with minor wear and tear. Table: 4ft x 2ft. Used for 2 years. Reason for selling: Moving to a new city.',
    price: 3500,
    categoryId: 'furniture',
    condition: 'good' as const,
    images: [
      'https://firebasestorage.googleapis.com/table1.jpg',
      'https://firebasestorage.googleapis.com/table2.jpg',
      'https://firebasestorage.googleapis.com/chair.jpg',
    ],
    city: 'Bangalore',
    locality: 'Koramangala',
  },
  lowQuality: {
    title: 'Laptop',
    description: 'Old laptop for sale. Works.',
    price: 8000,
    categoryId: 'electronics',
    condition: 'fair' as const,
    images: ['https://firebasestorage.googleapis.com/laptop.jpg'],
    city: 'Delhi',
  },
  highValue: {
    title: 'Royal Enfield Himalayan 2023 - Excellent Condition',
    description:
      'Selling my Royal Enfield Himalayan 2023 in excellent condition. Single owner, all service records available. Driven only 3,500 km. No scratches or dents. Documents ready for transfer. Reason for selling: Relocating abroad.',
    price: 185000,
    categoryId: 'vehicles',
    condition: 'like-new' as const,
    images: [
      'https://firebasestorage.googleapis.com/bike1.jpg',
      'https://firebasestorage.googleapis.com/bike2.jpg',
      'https://firebasestorage.googleapis.com/bike3.jpg',
      'https://firebasestorage.googleapis.com/bike4.jpg',
      'https://firebasestorage.googleapis.com/bike5.jpg',
    ],
    categorySpecificData: {
      verificationPhoto: 'https://firebasestorage.googleapis.com/verification.jpg',
      serialNumber: 'REH-2023-45678',
    },
    city: 'Pune',
    locality: 'Koregaon Park',
  },
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function runTest(
  testName: string,
  sellerId: string,
  listingData: ListingVerificationData
) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`TEST: ${testName}`)
  console.log('='.repeat(80))

  try {
    const trustEngine = TrustEngineService.getInstance()
    const result = await trustEngine.assessListing(sellerId, listingData)

    const { assessment, decision, sellerScoreBreakdown: sb, listingScoreBreakdown: lb } = result

    console.log('\n📊 SCORES:')
    console.log(`  Overall Score: ${assessment.overallTrustScore}/100`)
    console.log(`  Seller Score:  ${assessment.sellerTrustScore}/100 (${sb.grade})`)
    console.log(`  Listing Score: ${assessment.listingTrustScore}/100 (${lb.grade})`)

    console.log('\n🎯 DECISION:')
    console.log(`  Action:          ${decision.action}`)
    console.log(`  Auto-publish:    ${decision.autoPublish ? '✅ YES' : '❌ NO'}`)
    console.log(`  Requires Review: ${decision.requiresReview ? '⚠️  YES' : '✅ NO'}`)

    if ((decision.suggestions ?? []).length > 0) {
      console.log('\n💡 SUGGESTIONS:')
      decision.suggestions!.forEach((s, i) => console.log(`  ${i + 1}. ${s}`))
    }

    const checks = assessment.checks ?? []

    console.log('\n✅ PASSED CHECKS:')
    const passed = checks.filter(c => c.passed)
    passed.slice(0, 5).forEach(c => console.log(`  ✓ ${c.message}`))
    if (passed.length > 5) console.log(`  ... and ${passed.length - 5} more`)

    const failed = checks.filter(c => !c.passed)
    if (failed.length > 0) {
      console.log('\n❌ FAILED CHECKS:')
      failed.forEach(c => {
        console.log(`  ✗ ${c.message}`)
        if (c.details) console.log(`    → ${c.details}`)
      })
    }

    console.log('\n📈 DETAILED BREAKDOWN:')
    console.log('  Seller:')
    console.log(`    Identity:   ${sb.identityScore}/20`)
    console.log(`    Account:    ${sb.accountScore}/15`)
    console.log(`    Activity:   ${sb.activityScore}/25`)
    console.log(`    Reputation: ${sb.reputationScore}/25`)
    console.log(`    Community:  ${sb.communityScore}/10`)
    console.log(`    Penalties:  ${sb.penaltyScore}`)
    console.log(`    Bonuses:    ${sb.bonusScore}`)
    console.log('  Listing:')
    console.log(`    Photos:      ${lb.photosScore}/30`)
    console.log(`    Content:     ${lb.contentScore}/20`)
    console.log(`    Price:       ${lb.priceScore}/15`)
    console.log(`    Verification:${lb.verificationScore}/20`)
    console.log(`    Seller Contrib: ${lb.sellerContributionScore}/15`)

    return result
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message)
    return null
  }
}

async function main() {
  console.log('\n🔐 OWNZO TRUST ENGINE - MANUAL TEST SUITE')
  console.log('='.repeat(80))

  await runTest(
    'Excellent Seller + High Quality Listing (Should Auto-Publish)',
    SAMPLE_SELLERS.excellent.id,
    SAMPLE_LISTINGS.highQuality
  )
  await runTest(
    'Good Seller + Decent Listing (Should Suggest Improvements)',
    SAMPLE_SELLERS.good.id,
    SAMPLE_LISTINGS.decent
  )
  await runTest(
    'New Seller + Low Quality Listing (Should Require Review)',
    SAMPLE_SELLERS.new.id,
    SAMPLE_LISTINGS.lowQuality
  )
  await runTest(
    'Problematic Seller + Decent Listing (Should Reject or Review)',
    SAMPLE_SELLERS.problematic.id,
    SAMPLE_LISTINGS.decent
  )
  await runTest(
    'Excellent Seller + High Value Item with Verification (Should Auto-Publish)',
    SAMPLE_SELLERS.excellent.id,
    SAMPLE_LISTINGS.highValue
  )
  await runTest(
    'Good Seller + High Value Item WITHOUT Verification (Should Suggest Adding It)',
    SAMPLE_SELLERS.good.id,
    { ...SAMPLE_LISTINGS.highValue, categorySpecificData: undefined }
  )

  console.log('\n' + '='.repeat(80))
  console.log('✅ ALL TESTS COMPLETED')
  console.log('='.repeat(80) + '\n')
}

if (require.main === module) {
  main().catch(console.error)
}

export { main, runTest, SAMPLE_SELLERS, SAMPLE_LISTINGS }
