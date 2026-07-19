# 🚀 Trust Engine Quick Start - FREE Tier (No API Keys Required)

## ⚡ 5-Minute Setup

### Step 1: Copy Environment File (30 seconds)

```bash
cd /Users/pradeepkumar/Downloads/ownzo-main
cp .env.example .env.local
```

### Step 2: Add Firebase Config (2 minutes)

Edit `.env.local` and add your **existing** Firebase credentials:

```env
# Firebase (You already have this)
NEXT_PUBLIC_FIREBASE_API_KEY=your_existing_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_existing_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_existing_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_existing_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_existing_sender
NEXT_PUBLIC_FIREBASE_APP_ID=your_existing_app_id
FIREBASE_SERVICE_ACCOUNT_KEY=your_existing_service_account_json

# CSRF (You already have this)
CSRF_SECRET=your_existing_csrf_secret
```

### Step 3: Enable Trust Engine (1 minute)

Add these lines to `.env.local`:

```env
# ============================================
# TRUST ENGINE - FREE TIER (NO API KEYS NEEDED)
# ============================================
TRUST_ENGINE_ENABLED=true
TRUST_ENGINE_MIN_PHOTOS_GENERAL=3
TRUST_ENGINE_MIN_PHOTOS_HIGH_VALUE=5
TRUST_ENGINE_HIGH_VALUE_THRESHOLD=10000
TRUST_ENGINE_AUTO_PUBLISH_THRESHOLD=80
TRUST_ENGINE_SUGGEST_IMPROVEMENTS_THRESHOLD=60
TRUST_ENGINE_REQUIRE_REVIEW_THRESHOLD=40
TRUST_ENGINE_ENABLE_PRICE_VALIDATION=true
TRUST_ENGINE_ENABLE_CATEGORY_VERIFICATION=true
```

**That's it!** No API keys, no credit cards, no external services. ✅

### Step 4: Test Locally (1 minute)

```bash
npm run dev
```

Visit: http://localhost:3000

### Step 5: Deploy to Vercel (1 minute)

Add the same environment variables to Vercel:

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable from Step 3
5. Redeploy

---

## ✅ What You Get for FREE

### 1. Seller Trust Scoring
- ✅ Identity verification (Google, phone, email)
- ✅ Account age calculation
- ✅ Profile completeness check
- ✅ Sales history tracking
- ✅ Review/rating analysis
- ✅ Community membership
- ✅ Report/violation penalties

### 2. Listing Verification
- ✅ Photo count validation (3-5 photos)
- ✅ Title/description quality checks
- ✅ Price reasonability check
- ✅ Category-specific requirements
- ✅ High-value item detection
- ✅ Image URL validation

### 3. Publishing Decisions
- ✅ 80-100: Auto-publish immediately
- ✅ 60-79: Publish with improvement suggestions
- ✅ 40-59: Hold for manual review (24-48h)
- ✅ 0-39: Reject with specific feedback

### 4. API Endpoints
- ✅ `GET /api/listings/eligibility` - Check seller status
- ✅ `POST /api/listings/assess` - Assess listing

---

## 🧪 Test the Trust Engine

### Test 1: Check Your Eligibility

```bash
# Replace YOUR_TOKEN with actual Firebase auth token
curl -X GET http://localhost:3000/api/listings/eligibility \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "seller": {
      "trustScore": 75,
      "trustGrade": "B",
      "trustLevel": "Very Good"
    },
    "recommendations": [
      "Verify your phone number (+4 trust points)",
      "Join a community to connect with local buyers"
    ]
  }
}
```

### Test 2: Assess a Listing

```bash
curl -X POST http://localhost:3000/api/listings/assess \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 14 Pro Max 256GB - Excellent Condition",
    "description": "Selling my iPhone 14 Pro Max in excellent condition. Only 6 months old, comes with original box and all accessories. Battery health 100%. No scratches. Reason for selling: Upgrading to iPhone 15.",
    "price": 95000,
    "categoryId": "electronics",
    "condition": "like-new",
    "images": [
      "https://firebasestorage.googleapis.com/img1.jpg",
      "https://firebasestorage.googleapis.com/img2.jpg",
      "https://firebasestorage.googleapis.com/img3.jpg",
      "https://firebasestorage.googleapis.com/img4.jpg"
    ],
    "city": "Mumbai"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ Great! Your listing will be published immediately.",
  "data": {
    "overallScore": 87,
    "sellerScore": 75,
    "listingScore": 95,
    "decision": "auto_publish",
    "canPublish": true,
    "trustLevel": {
      "level": "Excellent",
      "description": "Your listing has passed all verification checks"
    }
  }
}
```

---

## 📊 Sample Scenarios

### Scenario 1: New Seller (Low Score)
**Profile:**
- New account (7 days)
- Google verified only
- No sales history

**Listing:**
- 1 photo
- Short description
- Price: ₹5,000

**Result:**
- Seller Score: ~35/100
- Listing Score: ~40/100
- Overall: ~38/100
- **Decision: Reject** ❌
- Feedback: "Add more photos, improve description, verify phone"

### Scenario 2: Good Seller + Decent Listing
**Profile:**
- Account age: 4 months
- Phone + Email verified
- 10 successful sales
- 4.5 rating

**Listing:**
- 3 photos
- Good description
- Price: ₹8,000

**Result:**
- Seller Score: ~70/100
- Listing Score: ~75/100
- Overall: ~73/100
- **Decision: Suggest Improvements** ⚠️
- Feedback: "Listing published! Add 2 more photos for better visibility"

### Scenario 3: Trusted Seller + Quality Listing
**Profile:**
- Account age: 1 year
- All verifications complete
- 50+ sales
- 4.9 rating

**Listing:**
- 5 photos
- Detailed description
- Price: ₹95,000

**Result:**
- Seller Score: ~92/100
- Listing Score: ~95/100
- Overall: ~94/100
- **Decision: Auto Publish** ✅
- Message: "Your listing is live!"

---

## 🎯 Integration with Listing Creation

Update your listing creation flow:

```typescript
// pages/listings/create.tsx or app/(main)/listings/create/page.tsx

const handleSubmit = async (listingData) => {
  // Step 1: Validate input
  // Step 2: Upload images to Firebase Storage
  // Step 3: Assess with Trust Engine
  
  const assessment = await fetch('/api/listings/assess', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify(listingData)
  }).then(r => r.json())
  
  // Step 4: Handle decision
  if (assessment.data.decision === 'auto_publish') {
    // Create listing with status: 'active'
    // Show success: "Your listing is live!"
  } else if (assessment.data.decision === 'suggest_improvements') {
    // Create listing with status: 'active'
    // Show warning with improvements
  } else if (assessment.data.decision === 'require_review') {
    // Create listing with status: 'pending_review'
    // Show: "Your listing will be reviewed in 24-48 hours"
  } else {
    // Don't create listing
    // Show errors and improvements
  }
}
```

---

## 💡 Pro Tips

### 1. Show Real-time Feedback
As users type, show:
- ✅ Title length: 45/100 chars (Good!)
- ⚠️ Description: 35 chars (Add 15 more)
- ✅ Photos: 4 uploaded (Excellent!)
- ⚠️ High-value item: Add verification photo

### 2. Pre-check Before Submit
```typescript
const checkEligibility = async () => {
  const response = await fetch('/api/listings/eligibility')
  const data = await response.json()
  
  if (!data.data.eligible) {
    // Show blockers
    // Don't allow listing creation
  }
}
```

### 3. Guide Users
Show trust score prominently:
```
Your Trust Score: 75/100 (B)
└─ Verify phone: +4 points
└─ Join community: +5 points
└─ Complete 5 more sales: +10 points
```

---

## 🆓 Cost Breakdown

| Component | Service | Free Limit | Cost |
|-----------|---------|------------|------|
| Trust Engine | Next.js API | Unlimited | **₹0** |
| Seller Scoring | Firestore Reads | 50K/day | **₹0** |
| Listing Scoring | Pure Logic | Unlimited | **₹0** |
| Database | Firestore | 50K reads/day | **₹0** |
| Storage | Firebase Storage | 5GB + 1GB/day | **₹0** |
| Hosting | Vercel | 100GB bandwidth | **₹0** |
| Auth | Firebase Auth | 50K MAU | **₹0** |

**Total Monthly Cost: ₹0** 🎉

---

## ⚠️ When to Upgrade

You'll need to add paid features when:

1. **You have revenue** (₹50,000+/month)
2. **Users demand it** ("Can you detect fake photos?")
3. **Competition requires it** (Others offer AI features)

Until then, **the free tier is more than enough!** ✨

---

## 📚 Next Steps

1. ✅ Test locally (5 minutes)
2. ✅ Deploy to Vercel (5 minutes)
3. ✅ Integrate with listing creation (30 minutes)
4. ✅ Add UI feedback (1 hour)
5. ✅ Launch and monitor (ongoing)

---

## 🆘 Troubleshooting

### Issue: "Seller not found"
**Solution:** Make sure user exists in Firestore `users` collection

### Issue: "Trust score is 0"
**Solution:** User needs to complete profile (name, city, photo)

### Issue: "Assessment fails"
**Solution:** Check Firebase connection, ensure service account key is valid

### Issue: "All listings rejected"
**Solution:** Lower thresholds in .env (e.g., AUTO_PUBLISH_THRESHOLD=70)

---

## ✅ You're Ready!

The Trust Engine is now running **100% FREE** with:
- ✅ No API keys needed
- ✅ No external services
- ✅ No credit cards
- ✅ No monthly costs

**Just Firebase + Vercel + Your code** 🚀

Start building "The Hardest Place in India to Post a Fake Listing"! 💪
