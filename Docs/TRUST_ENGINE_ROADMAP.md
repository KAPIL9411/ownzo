# Ownzo Trust Engine - Implementation Roadmap

## Vision

> **"The hardest place in India to post a fake listing"**

## Core Principle

Nothing becomes public until Ownzo trusts both the seller and the listing.

---

## Phase 1: Foundation (Week 1-2) ⚡ PRIORITY

### 1.1 Trust Engine Architecture

**New Files to Create:**
- `backend/services/trust-engine.service.ts` - Central trust calculation
- `backend/services/listing-verification.service.ts` - Listing-specific checks
- `backend/services/seller-verification.service.ts` - Seller-specific checks
- `backend/services/duplicate-detection.service.ts` - Image & listing duplicates
- `shared/types/trust.types.ts` - Trust score interfaces

**Key Functions:**
```typescript
// trust-engine.service.ts
interface TrustAssessment {
  sellerTrustScore: number
  listingTrustScore: number
  riskScore: number
  checks: VerificationCheck[]
  recommendation: 'publish' | 'review' | 'reject'
  reasoning: string[]
}

async function assessListing(
  sellerId: string,
  listingData: CreateListingInput
): Promise<TrustAssessment>
```

### 1.2 Enhanced Trust Score Schema

**Update `shared/types/index.ts`:**
```typescript
export interface Listing {
  // ... existing fields
  trustScore?: number // NEW: Listing-specific trust
  verificationStatus?: 'pending' | 'verified' | 'flagged'
  verificationChecks?: VerificationCheck[]
  riskScore?: number
  publishedAt?: Date // Track when it went live
  verificationCode?: string // For live verification
}

export interface VerificationCheck {
  type: string
  passed: boolean
  score: number
  message: string
  timestamp: Date
}

export interface User {
  // ... existing fields
  accountAge?: number // Days since creation
  lastActiveAt?: Date
  phoneVerified?: boolean
  emailVerified?: boolean
  collegeVerified?: boolean
  governmentIdVerified?: boolean
}
```

### 1.3 Minimum Photo Requirements

**New Middleware:**
- `backend/middleware/listing-validator.ts`

**Rules:**
- Minimum 3 photos (5 for items >₹10,000)
- Maximum 10 photos
- Each photo must be >100KB (not screenshots)
- At least one photo must be original (not found via reverse image search)

---

## Phase 2: Pre-Publish Verification Flow (Week 2-3) 🚦

### 2.1 Backend: Trust Assessment API

**New Route:**
`POST /api/listings/assess` - Pre-publish trust check (doesn't create listing)

**Response:**
```json
{
  "trustAssessment": {
    "sellerTrustScore": 85,
    "listingTrustScore": 92,
    "riskScore": 15,
    "recommendation": "publish",
    "checks": [
      { "type": "seller_verified", "passed": true, "score": 20 },
      { "type": "photos_count", "passed": true, "score": 10 },
      { "type": "original_photos", "passed": true, "score": 15 },
      { "type": "price_check", "passed": true, "score": 10 },
      { "type": "duplicate_scan", "passed": true, "score": 15 }
    ],
    "reasoning": [
      "Seller is verified",
      "5 original photos uploaded",
      "Price is within market range"
    ]
  }
}
```

### 2.2 Frontend: "Checking..." Experience

**New Component:**
`frontend/components/listings/TrustVerificationModal.tsx`

**Flow:**
1. User clicks "Publish"
2. Show modal with animated checks (10-30 seconds)
3. Display each check completing:
   - ✅ Seller verified
   - ✅ Photos validated
   - ✅ Price checked
   - ✅ Duplicate scan complete
4. Show final trust score: **93/100**
5. Based on score:
   - **>80**: "🎉 Your listing is now live"
   - **60-80**: "⚠️ Please improve..." (suggestions)
   - **<60**: "❌ Needs manual review"

**Update:**
`app/(main)/listings/create/page.tsx` - Integrate verification flow

---

## Phase 3: Seller Trust Checks (Week 3-4) 👤

### 3.1 Enhanced Seller Scoring

**Update `calculateTrustScore()` in `shared/utils/trust-score.ts`:**

```typescript
export interface EnhancedTrustScoreData {
  // Identity
  googleVerified: boolean
  phoneVerified: boolean
  emailVerified: boolean
  collegeVerified: boolean
  governmentIdVerified: boolean
  
  // Account
  accountAge: number // days
  profileComplete: boolean
  hasProfilePicture: boolean
  hasBio: boolean
  hasLocation: boolean
  
  // Activity
  completedSales: number
  activeSales: number
  cancelledSales: number
  responseRate: number // %
  avgResponseTime: number // hours
  
  // Reputation
  positiveReviews: number
  negativeReviews: number
  rating: number
  
  // Community
  inCommunity: boolean
  communityVerified: boolean
  communityReports: number
  
  // Violations
  totalReports: number
  confirmedViolations: number
  previousBans: number
}

export function calculateEnhancedTrustScore(
  data: EnhancedTrustScoreData
): number {
  // Implementation with weighted scoring
  // Range: 0-100
}
```

### 3.2 Active Listing Limits

**Based on Trust Score:**
- 0-40: 1 active listing
- 41-60: 3 active listings
- 61-80: 5 active listings
- 81-100: 10 active listings

**Implement in:**
`backend/repositories/listing.repository.ts` - Check before creating

---

## Phase 4: Listing Trust Checks (Week 4-5) 📋

### 4.1 Duplicate Detection

**Image Similarity:**
- Use perceptual hashing (pHash)
- Compare against all active listings
- Flag if >95% similar

**Listing Similarity:**
- Compare title, description, price
- Check for copied content
- Flag exact matches

**New Service:**
`backend/services/duplicate-detection.service.ts`

### 4.2 Price Sanity Check

**Rules:**
- Get average price for category from last 30 days
- Flag if >3x higher or <30% of average
- Require explanation from seller

**Database:**
```typescript
interface CategoryPriceStats {
  categoryId: string
  avgPrice: number
  minPrice: number
  maxPrice: number
  sampleSize: number
  updatedAt: Date
}
```

### 4.3 Photo Originality Check

**Methods:**
1. **Reverse Image Search** (via API):
   - Google Custom Search API
   - TinEye API
   
2. **EXIF Data Check**:
   - Check for camera metadata
   - Verify capture date is recent
   
3. **Screenshot Detection**:
   - Check resolution patterns
   - Detect UI elements (status bars, buttons)

**Requirement:**
At least 1 photo must pass originality check

---

## Phase 5: AI-Generated Metadata (Week 5-6) 🤖

### 5.1 Integration Options

**Option A: OpenAI GPT-4 Vision**
```typescript
async function generateListingMetadata(images: string[]) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Analyze this product. Generate: 1) Title 2) Description 3) Category 4) Suggested price range" },
        { type: "image_url", image_url: images[0] }
      ]
    }]
  });
  
  return parseResponse(response);
}
```

**Option B: Google Cloud Vision + Vertex AI**
- Label detection for category
- OCR for text extraction
- Gemini for description generation

**Option C: Open-Source (Cost-effective)**
- CLIP for image understanding
- Locally hosted LLaMA for text generation

### 5.2 UI Flow

1. User uploads photos
2. "Analyzing photos..." (3-5 seconds)
3. Pre-filled form appears:
   ```
   Title: iPhone 13 Pro 128GB Space Grey
   Description: [AI-generated]
   Category: Electronics > Phones
   Suggested Price: ₹45,000 - ₹50,000
   ```
4. User reviews and edits
5. Proceeds to publish

**Update:**
`app/(main)/listings/create/page.tsx` - Add AI analysis step

---

## Phase 6: Live Verification Photo (Week 6) 📸

### 6.1 Implementation

**For items >₹10,000:**

**Backend:**
```typescript
function generateVerificationCode(): string {
  return `OWNZO-${randomInt(1000, 9999)}`;
}

interface ListingWithVerification extends Listing {
  verificationCode: string
  verificationPhoto?: string
  verificationPhotoVerified?: boolean
}
```

**Frontend Flow:**
1. When creating high-value listing, show:
   ```
   📸 Verification Required
   
   Please place a handwritten note with this code
   next to your product and upload a photo:
   
   OWNZO-3841
   
   This proves you have the item.
   ```

2. OCR verification:
   - Detect handwritten code in photo
   - Match with generated code
   - Flag if doesn't match

**Service:**
`backend/services/ocr-verification.service.ts`

---

## Phase 7: Category-Specific Verification (Week 7-8) 🏷️

### 7.1 Phone Verification

**Required Fields:**
- IMEI number (future)
- Battery health screenshot
- System info screenshot

**Validation:**
- IMEI format check
- IMEI blacklist check (future integration)

### 7.2 Bike Verification

**Required:**
- RC (Registration Certificate) upload
- RC number input
- Vehicle number

**Validation:**
- OCR to extract RC details
- Match with input
- Flag if doesn't match

### 7.3 Laptop Verification

**Required:**
- System information screenshot
- Serial number (optional)

### 7.4 Books

**No extra verification** - Low fraud risk

**Schema Update:**
```typescript
interface CategoryVerification {
  categoryId: string
  requiredFields: string[]
  optionalFields: string[]
  minPrice: number // Verification threshold
}
```

---

## Phase 8: Risk-Based Publishing (Week 8-9) ⚖️

### 8.1 Decision Engine

```typescript
interface PublishDecision {
  action: 'publish' | 'improve' | 'review'
  autoPublish: boolean
  reason: string
  suggestions?: string[]
  reviewerNotes?: string
}

function makePublishDecision(
  assessment: TrustAssessment
): PublishDecision {
  const score = assessment.listingTrustScore;
  
  if (score >= 80) {
    return {
      action: 'publish',
      autoPublish: true,
      reason: 'High trust score - auto-published'
    };
  }
  
  if (score >= 60) {
    return {
      action: 'improve',
      autoPublish: false,
      reason: 'Trust score can be improved',
      suggestions: [
        'Add more original photos',
        'Verify your phone number',
        'Join a community'
      ]
    };
  }
  
  return {
    action: 'review',
    autoPublish: false,
    reason: 'Requires manual review',
    reviewerNotes: generateReviewerNotes(assessment)
  };
}
```

### 8.2 Admin Review Queue

**New Page:**
`app/admin/review-queue/page.tsx`

**Shows:**
- Pending listings (score <60)
- All verification checks
- Seller history
- Approve/Reject buttons

---

## Phase 9: Community Trust (Week 9) 🏘️

### 9.1 Community-Based Reporting

**Enhanced Report System:**
```typescript
interface Report {
  id: string
  listingId: string
  reporterId: string
  reporterCommunityId?: string
  reason: ReportReason
  description: string
  status: 'pending' | 'reviewed' | 'actioned'
  verifiedCommunityReport: boolean // Same community as listing
}
```

**Auto-Action Rules:**
- 3 reports from same community → Hide listing
- 5 reports total → Hide listing
- Community members' reports weighted 2x
- Admin can override

### 9.2 Community Trust Contribution

**Sellers in verified communities get:**
- +10 base trust score
- +5 for each successful sale in community
- Higher visibility in community searches

---

## Phase 10: Buyer Protection (Week 10) 🛡️

### 10.1 Post-Sale Reporting

**After "Mark as Sold":**
- Buyer gets notification to confirm purchase
- Can report issues:
  - Fake product
  - Wrong condition
  - Missing items
  - Counterfeit

**Impact:**
- Confirmed reports reduce seller trust by 20 points
- 3 confirmed reports = 30-day ban
- Persistent offenders = permanent ban

---

## Phase 11: Trust Metrics Dashboard (Week 11) 📊

### 11.1 Admin Dashboard

**Show:**
- Total listings published
- Auto-published %
- Manual review %
- Rejected %
- Average trust scores
- Fraud reports per 1000 transactions
- Trust score distribution

### 11.2 Public Trust Badge

**On Homepage:**
```
🛡️ Trust Metrics

✅ 99% of listings verified before publishing
✅ 95% of active sellers are verified
✅ 0.2% fraud rate (vs 8% industry average)
✅ 10,000+ successful transactions
```

---

## Technical Stack Additions

### New Dependencies:
```json
{
  "openai": "^4.0.0", // or
  "@google-cloud/vision": "^4.0.0",
  "@google-cloud/aiplatform": "^3.0.0",
  "sharp": "^0.33.0", // Image processing
  "phash": "^0.1.0", // Perceptual hashing
  "tesseract.js": "^5.0.0", // OCR
  "exif-parser": "^0.1.12" // EXIF data
}
```

### New Environment Variables:
```
OPENAI_API_KEY=
GOOGLE_CLOUD_VISION_KEY=
REVERSE_IMAGE_SEARCH_API_KEY=
TRUST_ENGINE_ENABLED=true
AUTO_PUBLISH_THRESHOLD=80
MANUAL_REVIEW_THRESHOLD=60
```

---

## Database Schema Updates

### New Collections:

**`trust_assessments`:**
```typescript
{
  id: string
  listingId: string
  sellerId: string
  sellerTrustScore: number
  listingTrustScore: number
  riskScore: number
  checks: VerificationCheck[]
  recommendation: string
  reasoning: string[]
  createdAt: Date
}
```

**`category_price_stats`:**
```typescript
{
  categoryId: string
  city: string
  avgPrice: number
  minPrice: number
  maxPrice: number
  sampleSize: number
  updatedAt: Date
}
```

**`verification_codes`:**
```typescript
{
  id: string
  listingId: string
  code: string
  photoUrl?: string
  verified: boolean
  createdAt: Date
  expiresAt: Date
}
```

---

## Success Metrics

### Track Weekly:
1. **Fraud Rate**: Confirmed fraud reports / Total transactions
2. **Auto-Publish Rate**: Auto-published / Total submissions
3. **Manual Review Time**: Avg time to review
4. **User Trust Distribution**: Histogram of user trust scores
5. **Listing Trust Distribution**: Histogram of listing trust scores

### Goal After 3 Months:
- <1% fraud rate
- >90% auto-publish rate
- >85% average listing trust score
- >80% sellers with trust score >60

---

## Priority Order

**Week 1-2:** Phase 1 (Foundation) ⚡
**Week 2-3:** Phase 2 (Pre-Publish Flow) 🚦
**Week 3-4:** Phase 3 (Seller Checks) 👤
**Week 4-5:** Phase 4 (Listing Checks) 📋
**Week 5-6:** Phase 5 (AI Metadata) 🤖
**Week 6:** Phase 6 (Live Verification) 📸
**Week 7-8:** Phase 7 (Category Verification) 🏷️
**Week 8-9:** Phase 8 (Publishing Decision) ⚖️
**Week 9:** Phase 9 (Community Trust) 🏘️
**Week 10:** Phase 10 (Buyer Protection) 🛡️
**Week 11:** Phase 11 (Metrics Dashboard) 📊

---

## Investment Pitch - Trust Engine

**What makes Ownzo different:**

Not just another classifieds app. **Ownzo has a Trust Engine.**

**The Problem:**
- OLX, Facebook Marketplace: 8-12% fraud rate
- Users waste time on fake listings
- No accountability for bad actors

**The Solution:**
- Ownzo Trust Engine: Multi-layer verification
- Every listing scored before publishing
- Auto-reject fake listings
- **Target: <1% fraud rate**

**The Moat:**
- 10+ verification layers
- AI + human review hybrid
- Community-based trust
- Gets smarter with every transaction

**The Traction Metric:**
"We're the **hardest place in India to post a fake listing**."

---

## Notes

This document is a living roadmap. As you implement each phase, update:
1. What worked
2. What didn't
3. New learnings
4. Metric improvements

The Trust Engine is Ownzo's IP. Protect it, improve it, and make it your competitive advantage.
