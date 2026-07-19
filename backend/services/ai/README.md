# AI Services - FREE Implementation

## Overview

This directory contains integrations for **FREE AI alternatives** that save ₹11,000/month compared to paid APIs.

---

## 🎯 Services

### 1. GROQ Service (`groq.service.ts`)
**Replaces:** OpenAI GPT-4 (saves ₹5,000/month)

**Features:**
- Content quality analysis
- Spam/fake detection
- Title/description improvement suggestions
- Price reasonability checks

**Free Limits:**
- 14,400 requests/day
- Unlimited forever (no credit card)

---

### 2. Hugging Face Service (`huggingface.service.ts`)
**Replaces:** Google Cloud Vision (saves ₹3,000/month)

**Features:**
- Image quality scoring
- NSFW content detection
- Object recognition
- Duplicate image detection

**Free Limits:**
- 30,000 requests/month
- Unlimited with self-hosted models

---

### 3. SerpAPI Service (`serpapi.service.ts`)
**Replaces:** Paid reverse image search (saves ₹3,000/month)

**Features:**
- Reverse image search
- Find stolen photos
- Detect duplicate listings

**Free Limits:**
- 100 searches/month
- Use only for high-value items (₹10k+)

---

## 📦 Installation

```bash
npm install groq-sdk @huggingface/inference serpapi
```

---

## 🚀 Quick Start

### 1. Get API Keys (5 minutes - All FREE)

**GROQ:**
1. Visit: https://console.groq.com
2. Sign up with Google
3. API Keys → Create API Key
4. Copy key (starts with `gsk_`)

**Hugging Face:**
1. Visit: https://huggingface.co
2. Sign up with Google
3. Settings → Access Tokens → New Token
4. Copy token (starts with `hf_`)

**SerpAPI:**
1. Visit: https://serpapi.com
2. Sign up
3. Dashboard → API Key
4. Copy key

### 2. Add to .env.local

```env
GROQ_API_KEY=gsk_your_key_here
HUGGINGFACE_API_KEY=hf_your_token_here
SERPAPI_API_KEY=your_serpapi_key_here

TRUST_ENGINE_ENABLE_AI_CONTENT_ANALYSIS=true
TRUST_ENGINE_ENABLE_AI_PHOTO_ANALYSIS=true
TRUST_ENGINE_ENABLE_REVERSE_IMAGE_SEARCH=true
```

### 3. Deploy

```bash
git add .
git commit -m "Add FREE AI services"
git push origin main
```

---

## 💡 Usage Examples

### Example 1: Analyze Listing Content (GROQ)

```typescript
import { analyzeListingContent } from '@/backend/services/ai/groq.service'

const result = await analyzeListingContent(
  'iPhone 14 Pro Max',
  'Excellent condition, only 6 months old...'
)

// Returns:
// {
//   qualityScore: 85,
//   isSpam: false,
//   isFake: false,
//   suggestions: ['Add more details about warranty', 'Mention battery health'],
//   redFlags: []
// }
```

### Example 2: Check Image Quality (Hugging Face)

```typescript
import { analyzeImageQuality } from '@/backend/services/ai/huggingface.service'

const result = await analyzeImageQuality(
  'https://firebase.com/image.jpg'
)

// Returns:
// {
//   qualityScore: 90,
//   isNSFW: false,
//   detectedObjects: ['phone', 'hand', 'table'],
//   confidence: 0.95
// }
```

### Example 3: Detect Duplicate Photo (SerpAPI)

```typescript
import { reverseImageSearch } from '@/backend/services/ai/serpapi.service'

const result = await reverseImageSearch(
  'https://firebase.com/suspicious-image.jpg'
)

// Returns:
// {
//   foundOnWeb: true,
//   sources: [
//     { url: 'https://olx.in/...', title: 'iPhone for sale' },
//     { url: 'https://amazon.in/...', title: 'iPhone Product' }
//   ],
//   isDuplicate: true
// }
```

---

## 🎯 Integration with Trust Engine

### Update `listing-verification.service.ts`

```typescript
import { analyzeListingContent } from '@/backend/services/ai/groq.service'
import { analyzeImageQuality } from '@/backend/services/ai/huggingface.service'
import { reverseImageSearch } from '@/backend/services/ai/serpapi.service'

// In verifyContent() method:
if (this.config.enableAIContentAnalysis && process.env.GROQ_API_KEY) {
  const aiAnalysis = await analyzeListingContent(
    listingData.title,
    listingData.description
  )
  
  contentScore += aiAnalysis.qualityScore * 0.2 // Bonus up to 20 points
  
  if (aiAnalysis.isSpam || aiAnalysis.isFake) {
    checks.push({
      type: 'listing_ai_content_check',
      passed: false,
      score: -20,
      weight: 25,
      message: 'AI detected potential spam or fake content',
      details: aiAnalysis.redFlags.join(', '),
      timestamp: new Date(),
    })
  }
}

// In verifyPhotos() method:
if (this.config.enableAIPhotoAnalysis && process.env.HUGGINGFACE_API_KEY) {
  const imageQuality = await analyzeImageQuality(listingData.images[0])
  
  if (imageQuality.isNSFW) {
    checks.push({
      type: 'listing_photo_appropriate',
      passed: false,
      score: -50,
      weight: 30,
      message: 'Inappropriate image detected',
      timestamp: new Date(),
    })
  }
  
  qualityScore = Math.round(imageQuality.qualityScore / 10) // 0-10 points
}

// For high-value items only:
if (listingData.price >= 10000 && 
    this.config.enableReverseImageSearch && 
    process.env.SERPAPI_API_KEY) {
  
  const reverseSearch = await reverseImageSearch(listingData.images[0])
  
  if (reverseSearch.isDuplicate) {
    checks.push({
      type: 'listing_original_photos',
      passed: false,
      score: -30,
      weight: 25,
      message: 'Photo appears to be copied from web',
      details: `Found on: ${reverseSearch.sources[0]?.url}`,
      timestamp: new Date(),
    })
  }
}
```

---

## 📊 Performance & Costs

| Service | Speed | Monthly Cost | Requests/Month |
|---------|-------|--------------|----------------|
| GROQ | 0.5-1s | ₹0 | 432,000 (14.4K/day) |
| Hugging Face | 1-2s | ₹0 | 30,000 |
| SerpAPI | 2-3s | ₹0 | 100 |

**Total:** ₹0/month for AI-powered trust engine! 🎉

---

## 🔥 Best Practices

### 1. Cache Results
```typescript
// Cache GROQ analysis for 24 hours
const cacheKey = `groq:${title}:${description}`
const cached = await redis.get(cacheKey)
if (cached) return cached

const result = await analyzeListingContent(title, description)
await redis.set(cacheKey, result, 86400) // 24 hours
```

### 2. Use SerpAPI Wisely
```typescript
// Only for high-value items (₹10k+)
if (price >= 10000) {
  const reverseSearch = await reverseImageSearch(imageUrl)
  // Use only 3-4 searches per day = ~100/month
}
```

### 3. Batch Requests
```typescript
// Analyze multiple images at once
const results = await Promise.all(
  images.map(img => analyzeImageQuality(img))
)
```

### 4. Fallback to Basic Checks
```typescript
// If AI fails, use basic validation
try {
  const aiResult = await analyzeListingContent(title, description)
  return aiResult.qualityScore
} catch (error) {
  console.error('AI analysis failed, using basic checks')
  return basicTitleCheck(title) + basicDescriptionCheck(description)
}
```

---

## 🎯 Deployment Checklist

- [ ] Get all 3 API keys (5 min)
- [ ] Add to `.env.local`
- [ ] Install npm packages: `groq-sdk @huggingface/inference serpapi`
- [ ] Create service files (groq.service.ts, huggingface.service.ts, serpapi.service.ts)
- [ ] Integrate with listing-verification.service.ts
- [ ] Test locally with 10 listings
- [ ] Add to Vercel environment variables
- [ ] Deploy and monitor

---

## 🆘 Troubleshooting

### GROQ API Error
**Error:** `Invalid API key`
**Fix:** Verify key starts with `gsk_` and is from https://console.groq.com

### Hugging Face Timeout
**Error:** `Request timeout`
**Fix:** Use smaller models or self-host: `facebook/detr-resnet-50` (lightweight)

### SerpAPI Limit Reached
**Error:** `Monthly limit exceeded`
**Fix:** Use only for items >₹10,000 (3-4 checks per day max)

---

## 📚 Resources

- **GROQ Docs:** https://console.groq.com/docs
- **Hugging Face Docs:** https://huggingface.co/docs/api-inference
- **SerpAPI Docs:** https://serpapi.com/docs

---

## ✅ Summary

With these **FREE AI alternatives**, you get:
- ✅ Better performance (GROQ is 10x faster)
- ✅ Zero monthly costs (₹11,000 savings)
- ✅ Higher limits (14K/day vs 1K/month)
- ✅ No credit card required
- ✅ No vendor lock-in

**Start using AI for FREE today!** 🚀
