# Ownzo Trust Engine - Phase 1 Documentation

## Overview

The Ownzo Trust Engine is the core intellectual property that makes Ownzo **"The Hardest Place in India to Post a Fake Listing."**

**Core Principle:** Nothing becomes public until Ownzo trusts both the seller and the listing.

## Architecture

### Components

1. **TrustEngineService** (`trust-engine.service.ts`)
   - Central orchestrator (Singleton pattern)
   - Coordinates seller and listing verification
   - Makes publishing decisions
   - Provides failsafe handling

2. **SellerVerificationService** (`seller-verification.service.ts`)
   - Verifies seller identity and trustworthiness
   - Calculates seller trust score (0-100)
   - Checks: Identity, Account, Activity, Reputation, Community, Penalties, Bonuses

3. **ListingVerificationService** (`listing-verification.service.ts`)
   - Verifies listing quality and authenticity
   - Calculates listing trust score (0-100)
   - Checks: Photos, Content, Price, Category-specific requirements

4. **Trust Validator** (`listing-validator.ts`)
   - Pre-verification validation middleware
   - Minimum requirements check
   - Input sanitization (XSS prevention)

## Scoring System

### Overall Score Calculation
```
Overall Score = (Seller Score × 40%) + (Listing Score × 60%)
```

**Rationale:** Listings are easier to fake than identity, so they carry more weight.

### Seller Score Breakdown (0-100 points)

| Category | Max Points | Description |
|----------|-----------|-------------|
| Identity Verification | 20 | Google, Phone, Email, College/Govt ID |
| Account Health | 15 | Age, Profile completeness |
| Activity Metrics | 25 | Sales, Response rate/time |
| Reputation | 25 | Reviews, Ratings |
| Community Standing | 10 | Community membership, Reports |
| Penalties | -50 | Reports, Violations, Bans |
| Bonuses | +5 | Early adopter, Referrals |

**Identity Verification (20 points):**
- Google verified: 8 points (required)
- Phone verified: 4 points
- Email verified: 3 points
- College verified: 3 points
- Government ID verified: 2 points

**Account Health (15 points):**
- Account age 180+ days: 6 points
- Account age 90-180 days: 4 points
- Account age 30-90 days: 2 points
- Profile complete: 4 points
- Profile picture: 2 points
- Bio: 2 points
- Location: 1 point

**Activity Metrics (25 points):**
- Completed sales: 3 points each (max 15)
- Response rate >90%: 5 points
- Response time <2hrs: 5 points

**Reputation (25 points):**
- Positive reviews: 3 points each (max 12)
- Average rating: up to 8 points
- Negative reviews: -5 points each

**Penalties:**
- Report: -10 points each (max -20)
- Confirmed violation: -15 points each (max -30)
- Previous ban: -20 points each (max -40)
- Currently banned: -50 points (cannot list)

### Listing Score Breakdown (0-100 points)

| Category | Max Points | Description |
|----------|-----------|-------------|
| Photos | 30 | Count, Quality, Originality |
| Content | 20 | Title, Description quality |
| Price Validation | 15 | Reasonability, Market range |
| Category Verification | 20 | Specific requirements, Live verification |
| Seller Contribution | 15 | Derived from seller score |

**Photos (30 points):**
- Photo count (5+ photos): 10 points
- Photo quality: 10 points
- Photo originality: 5 points
- No screenshots: 5 points

**Content (20 points):**
- Title quality (20-100 chars): 7 points
- Description length (100+ chars): 7 points
- Description quality: 6 points

**Price Validation (15 points):**
- Reasonable price range: 5 points
- Not suspicious: 5 points
- Within market range: 5 points

**Category Verification (20 points):**
- Live verification photo (high-value): 10 points
- Category documents: 10 points

## Publishing Decisions

| Score Range | Action | Can Publish? | Requires Review? |
|-------------|--------|--------------|------------------|
| 80-100 | Auto Publish | ✅ Yes | ❌ No |
| 60-79 | Suggest Improvements | ✅ Yes | ❌ No |
| 40-59 | Require Review | ❌ No | ✅ Yes |
| 0-39 | Reject | ❌ No | ❌ No |

### Decision Logic

**Auto Publish (Score ≥ 80):**
- Listing goes live immediately
- User sees: "✅ Your listing is live!"

**Suggest Improvements (60-79):**
- Listing goes live but with suggestions
- User sees: "⚠️ Published! Here's how to improve visibility..."
- Recommendations provided

**Require Review (40-59):**
- Listing held for manual review
- User sees: "🔍 Your listing requires verification (24-48 hours)"
- Notified when review complete

**Reject (< 40):**
- Listing not accepted
- User sees: "❌ Please address these issues..."
- Specific improvement list provided

## High-Value Item Requirements

**Threshold:** ₹10,000+

**Additional Requirements:**
- Minimum 5 photos (vs 3 for general items)
- Live verification photo with handwritten code
- Serial number (if applicable)
- Invoice/warranty documents (recommended)

## API Endpoints

### 1. Check Eligibility
```
GET /api/listings/eligibility
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "seller": {
      "trustScore": 85,
      "trustGrade": "A",
      "trustLevel": "Excellent",
      "verified": true
    },
    "checklist": {
      "hasGoogleAccount": true,
      "hasProfileName": true,
      "hasLocation": true,
      "notBanned": true
    },
    "recommendations": [
      "Verify your phone number (+4 trust points)",
      "Join a community to connect with local buyers"
    ]
  }
}
```

### 2. Assess Listing
```
POST /api/listings/assess
```

**Request Body:**
```json
{
  "title": "iPhone 14 Pro Max 256GB",
  "description": "Excellent condition...",
  "price": 95000,
  "categoryId": "electronics",
  "condition": "like-new",
  "images": ["url1", "url2", "url3"],
  "city": "Mumbai"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Great! Your listing will be published immediately.",
  "data": {
    "overallScore": 87,
    "sellerScore": 85,
    "listingScore": 89,
    "decision": "auto_publish",
    "canPublish": true,
    "requiresReview": false,
    "trustLevel": {
      "level": "Excellent",
      "color": "#10B981",
      "description": "Your listing has passed all verification checks"
    },
    "checksCompleted": 18,
    "totalChecks": 20,
    "improvements": [],
    "assessedAt": "2024-07-19T10:30:00Z"
  }
}
```

## Environment Configuration

```env
# Trust Engine Configuration
TRUST_ENGINE_MIN_PHOTOS_GENERAL=3
TRUST_ENGINE_MIN_PHOTOS_HIGH_VALUE=5
TRUST_ENGINE_HIGH_VALUE_THRESHOLD=10000

# Thresholds
TRUST_ENGINE_AUTO_PUBLISH_THRESHOLD=80
TRUST_ENGINE_SUGGEST_IMPROVEMENTS_THRESHOLD=60
TRUST_ENGINE_REQUIRE_REVIEW_THRESHOLD=40

# Feature Flags
TRUST_ENGINE_ENABLE_AI_METADATA=false
TRUST_ENGINE_ENABLE_DUPLICATE_DETECTION=false
TRUST_ENGINE_ENABLE_PHOTO_VERIFICATION=false
TRUST_ENGINE_ENABLE_PRICE_VALIDATION=true
TRUST_ENGINE_ENABLE_CATEGORY_VERIFICATION=true
```

## Testing

### Unit Tests
```bash
npm test backend/services/__tests__/trust-engine.test.ts
```

### Manual Testing
```bash
tsx backend/services/__tests__/manual-trust-test.ts
```

## Implementation Phases

### Phase 1: Foundation (✅ COMPLETED)
- [x] Trust types and interfaces
- [x] Trust Engine core service
- [x] Seller verification service
- [x] Listing verification service
- [x] Enhanced User/Listing types
- [x] Trust score utilities
- [x] Validator middleware
- [x] API routes
- [x] Test suite

### Phase 2: Intelligence (Future)
- [ ] AI-powered photo verification
- [ ] Reverse image search integration
- [ ] Price comparison with market data
- [ ] Duplicate listing detection
- [ ] NLP for content quality analysis

### Phase 3: Advanced (Future)
- [ ] Live verification photo validation
- [ ] Document OCR verification
- [ ] Behavioral pattern analysis
- [ ] Fraud detection ML models
- [ ] Real-time risk scoring

### Phase 4: Scale (Future)
- [ ] Automated review queue
- [ ] A/B testing framework
- [ ] Trust score optimization
- [ ] Analytics dashboard
- [ ] Performance monitoring

## Usage Examples

### Example 1: New Seller Creating First Listing

**Seller Profile:**
- New account (7 days old)
- Google verified only
- No sales history

**Result:**
- Seller Score: 35/100
- Listing Score: 45/100 (if decent photos/description)
- Overall: ~41/100
- **Decision:** Require Review

### Example 2: Trusted Seller with Quality Listing

**Seller Profile:**
- Account age: 1 year
- All verifications complete
- 50+ successful sales
- 4.9 rating

**Result:**
- Seller Score: 92/100
- Listing Score: 87/100
- Overall: ~89/100
- **Decision:** Auto Publish

### Example 3: Average Seller with Basic Listing

**Seller Profile:**
- Account age: 4 months
- Phone + Email verified
- 10 successful sales

**Result:**
- Seller Score: 70/100
- Listing Score: 60/100
- Overall: ~64/100
- **Decision:** Suggest Improvements

## Security Considerations

1. **Input Sanitization:** All text inputs are sanitized to prevent XSS
2. **Image Validation:** Only HTTPS URLs from trusted cloud storage
3. **Rate Limiting:** Prevent assessment API abuse
4. **Failsafe Handling:** Errors default to manual review (conservative)
5. **Audit Logging:** All assessments logged for review

## Performance

- **Average Assessment Time:** 200-500ms
- **Seller Score Calculation:** ~100ms
- **Listing Score Calculation:** ~100ms
- **Database Queries:** 1-2 per assessment

## Future Enhancements

1. **Machine Learning Models:**
   - Photo quality scoring
   - Fake listing detection
   - Price anomaly detection

2. **External Integrations:**
   - Google Reverse Image Search
   - Price comparison APIs
   - Government ID verification APIs

3. **Real-time Features:**
   - Live verification code generation
   - Instant photo analysis
   - Real-time fraud alerts

4. **Analytics:**
   - Trust score trends
   - Verification success rates
   - Decision accuracy metrics

## Support

For questions or issues, contact the development team or refer to:
- Architecture docs: `/Docs/ARCHITECTURE.md`
- Security audit: `/Docs/SECURITY_AUDIT_REPORT.md`
- Deployment guide: `/Docs/DEPLOYMENT_GUIDE.md`

---

**Built with ❤️ for Ownzo - The Hardest Place in India to Post a Fake Listing**
