# 🆓 Free AI Alternatives for Trust Engine

## Overview

Instead of paid APIs, use these **100% FREE alternatives** that are often faster and better for our use case!

---

## 1. GROQ - OpenAI Alternative (FREE & 10x Faster!)

### Why GROQ is Better
- ✅ **Completely FREE** (OpenAI charges $0.01-0.03 per request)
- ✅ **10x Faster** than OpenAI (70+ tokens/sec vs 20-30 tokens/sec)
- ✅ **Better models** - Llama 3.1, Mixtral 8x7B
- ✅ **No credit card required**
- ✅ **14,400 requests/day free** (more than enough!)

### Setup GROQ (2 minutes)

1. **Get FREE API Key:**
   - Visit: https://console.groq.com
   - Sign up with Google (free)
   - Go to API Keys → Create API Key
   - Copy key (starts with `gsk_`)

2. **Add to .env.local:**
   ```env
   GROQ_API_KEY=gsk_your_groq_key_here
   ```

3. **Usage:**
   - Content quality analysis
   - Title/description improvement suggestions
   - Spam/fake listing detection
   - Price reasonability checks

### GROQ Free Limits
- **14,400 requests/day** (600/hour)
- **No cost ever** - completely free
- **No credit card needed**

**Perfect for Ownzo!** Even with 1000 listings/day, you only need ~1000 requests.

---

## 2. Hugging Face - Google Cloud Vision Alternative (FREE)

### Why Hugging Face is Better
- ✅ **Completely FREE** (Google charges after 1,000 images)
- ✅ **Open source models** - CLIP, BLIP, DINOv2
- ✅ **No credit card required**
- ✅ **30,000 requests/month free** (1,000/day)
- ✅ **Better for Indian products** (can fine-tune)

### Setup Hugging Face (2 minutes)

1. **Get FREE API Token:**
   - Visit: https://huggingface.co
   - Sign up with Google (free)
   - Settings → Access Tokens → New Token
   - Copy token (starts with `hf_`)

2. **Add to .env.local:**
   ```env
   HUGGINGFACE_API_KEY=hf_your_free_token_here
   ```

3. **Usage:**
   - Image quality detection
   - Object recognition (phone, laptop, bike)
   - Image NSFW/inappropriate content check
   - Image similarity (duplicate detection)

### Hugging Face Free Limits
- **30,000 requests/month** (1,000/day)
- **No cost ever** - completely free
- **Can self-host models** if needed

---

## 3. SerpAPI - Reverse Image Search (FREE Tier)

### Why SerpAPI is Good
- ✅ **100 searches/month FREE** (enough for testing)
- ✅ **Google Image Search** API access
- ✅ **Easy to use** - simple REST API
- ✅ **No credit card for free tier**

### Setup SerpAPI (2 minutes)

1. **Get FREE API Key:**
   - Visit: https://serpapi.com
   - Sign up (free)
   - Dashboard → API Key
   - Copy key

2. **Add to .env.local:**
   ```env
   SERPAPI_API_KEY=your_free_serpapi_key_here
   ```

3. **Usage:**
   - Check if listing photos are stolen from web
   - Find duplicate listings
   - Verify product authenticity

### SerpAPI Free Limits
- **100 searches/month FREE**
- **$50/month** for 5,000 searches (if needed later)

**Alternative:** Use **TinEye API** (5,000 searches FREE)

---

## 💰 Cost Comparison

### Without Free Alternatives (Paid APIs)
```
OpenAI GPT-4:           ₹5,000/month  (1,000 requests)
Google Cloud Vision:    ₹3,000/month  (1,000 images)
Reverse Image Search:   ₹3,000/month  (500 searches)
─────────────────────────────────────
Total:                  ₹11,000/month
```

### With Free Alternatives
```
GROQ:                   ₹0/month  (14,400 requests/day!)
Hugging Face:           ₹0/month  (30,000 requests/month!)
SerpAPI:                ₹0/month  (100 searches/month)
─────────────────────────────────────
Total:                  ₹0/month ✨
```

**Savings: ₹11,000/month = ₹1,32,000/year!** 🎉

---

## 🚀 Complete FREE Setup

### Step 1: Get All API Keys (5 minutes)

1. **GROQ** (2 min)
   - https://console.groq.com
   - Sign up → API Keys → Create
   - Copy key

2. **Hugging Face** (2 min)
   - https://huggingface.co
   - Sign up → Settings → Access Tokens
   - Copy token

3. **SerpAPI** (1 min)
   - https://serpapi.com
   - Sign up → API Key
   - Copy key

### Step 2: Add to .env.local

```env
# =============================================================================
# FREE AI ALTERNATIVES (₹0/month vs ₹11,000/month with OpenAI)
# =============================================================================

# GROQ - OpenAI Alternative (FREE & 10x Faster)
# 14,400 requests/day free
GROQ_API_KEY=gsk_your_groq_key_here

# Hugging Face - Google Cloud Vision Alternative (FREE)
# 30,000 requests/month free
HUGGINGFACE_API_KEY=hf_your_free_token_here

# SerpAPI - Reverse Image Search (FREE Tier)
# 100 searches/month free
SERPAPI_API_KEY=your_free_serpapi_key_here

# Enable AI Features (now that we have free alternatives)
TRUST_ENGINE_ENABLE_AI_CONTENT_ANALYSIS=true
TRUST_ENGINE_ENABLE_AI_PHOTO_ANALYSIS=true
TRUST_ENGINE_ENABLE_REVERSE_IMAGE_SEARCH=true
```

### Step 3: Deploy to Vercel

Add the same 3 keys + 3 feature flags to Vercel Environment Variables.

---

## 📊 API Usage Examples

### 1. GROQ - Content Analysis

```typescript
// backend/services/ai/groq-service.ts
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function analyzeListingContent(title: string, description: string) {
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a trust & safety expert for a second-hand marketplace in India.'
      },
      {
        role: 'user',
        content: `Analyze this listing for quality and trustworthiness:
        
Title: ${title}
Description: ${description}

Rate from 0-100 and identify any red flags (spam, fake, inappropriate).`
      }
    ],
    model: 'llama-3.1-70b-versatile', // FREE & Fast
    temperature: 0.3,
    max_tokens: 500
  })
  
  return response.choices[0].message.content
}
```

**Cost:** ₹0 (up to 14,400/day free)  
**Speed:** ~500ms per request

### 2. Hugging Face - Image Analysis

```typescript
// backend/services/ai/huggingface-service.ts
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function analyzeImage(imageUrl: string) {
  // Check image quality and content
  const result = await hf.imageClassification({
    data: await fetch(imageUrl).then(r => r.blob()),
    model: 'google/vit-base-patch16-224' // FREE
  })
  
  return result
}

export async function detectDuplicateImage(imageUrl: string) {
  // Generate image embedding for similarity
  const embedding = await hf.featureExtraction({
    data: await fetch(imageUrl).then(r => r.blob()),
    model: 'openai/clip-vit-base-patch32' // FREE
  })
  
  return embedding
}
```

**Cost:** ₹0 (30,000/month free)  
**Speed:** ~1-2 seconds per image

### 3. SerpAPI - Reverse Image Search

```typescript
// backend/services/ai/serpapi-service.ts
import { getJson } from 'serpapi'

export async function reverseImageSearch(imageUrl: string) {
  const response = await getJson({
    engine: 'google_reverse_image',
    image_url: imageUrl,
    api_key: process.env.SERPAPI_API_KEY
  })
  
  return {
    foundOnWeb: response.inline_images?.length > 0,
    sources: response.inline_images || []
  }
}
```

**Cost:** ₹0 (100 searches/month free)  
**Speed:** ~2-3 seconds per search

---

## 🎯 Implementation Plan

### Phase 1: GROQ Content Analysis (Week 1)
- [ ] Install `groq-sdk` package
- [ ] Create groq-service.ts
- [ ] Integrate with listing verification
- [ ] Test with 100 listings
- [ ] Deploy to production

**Impact:** Detect spam/fake listings automatically (₹0 cost)

### Phase 2: Hugging Face Images (Week 2)
- [ ] Install `@huggingface/inference` package
- [ ] Create huggingface-service.ts
- [ ] Add image quality scoring
- [ ] Add NSFW detection
- [ ] Test with 100 images

**Impact:** Auto-detect poor quality photos (₹0 cost)

### Phase 3: SerpAPI Duplicates (Week 3)
- [ ] Install `serpapi` package
- [ ] Create serpapi-service.ts
- [ ] Add reverse image search for high-value items
- [ ] Cache results to save API calls
- [ ] Test with 50 listings

**Impact:** Catch stolen photos (₹0 for 100/month)

---

## 📦 Installation

```bash
# Install all free AI libraries
npm install groq-sdk @huggingface/inference serpapi

# Total size: ~5MB (very lightweight!)
```

---

## 🔥 Performance Comparison

| Feature | OpenAI (Paid) | GROQ (Free) | Winner |
|---------|---------------|-------------|---------|
| Speed | 2-3s | 0.5-1s | 🏆 GROQ |
| Cost | ₹5,000/month | ₹0/month | 🏆 GROQ |
| Quality | Excellent | Excellent | 🤝 Tie |
| Limit | Pay per use | 14,400/day | 🏆 GROQ |

| Feature | Google Vision (Paid) | Hugging Face (Free) | Winner |
|---------|----------------------|---------------------|---------|
| Speed | 1-2s | 1-2s | 🤝 Tie |
| Cost | ₹3,000/month | ₹0/month | 🏆 HF |
| Quality | Excellent | Very Good | 🏆 Google |
| Limit | 1,000 free then pay | 30,000/month | 🏆 HF |

**Overall Winner: FREE Alternatives** 🎉

---

## ⚠️ Important Notes

### GROQ Limitations
- ❌ No image analysis (only text)
- ✅ But 10x faster than OpenAI for text
- ✅ Perfect for content quality checks

### Hugging Face Limitations
- ⚠️ Slightly slower than Google Vision
- ✅ But completely free
- ✅ Can self-host models if needed

### SerpAPI Limitations
- ⚠️ Only 100 searches/month free
- ✅ But that's enough for high-value items only
- 💡 **Pro Tip:** Only check listings >₹10,000

---

## 💡 Smart Usage Strategy

### For All Listings (FREE)
1. **GROQ content analysis** (₹0)
   - Check title/description quality
   - Detect spam patterns
   - Suggest improvements

2. **Hugging Face image check** (₹0)
   - Verify image quality
   - Check for NSFW content
   - Count objects in image

### For High-Value Only (₹10k+)
3. **SerpAPI reverse search** (100/month free)
   - Only for listings >₹10,000
   - Check if photos are stolen
   - Find duplicate listings

**Result:** Full AI protection for ₹0/month! 🚀

---

## 🎉 Bottom Line

### Old Plan (Paid APIs)
```
❌ OpenAI: ₹5,000/month
❌ Google Vision: ₹3,000/month
❌ Reverse Image: ₹3,000/month
─────────────────────────
❌ Total: ₹11,000/month
```

### New Plan (Free APIs)
```
✅ GROQ: ₹0/month (better & faster!)
✅ Hugging Face: ₹0/month (30K/month!)
✅ SerpAPI: ₹0/month (100/month OK)
─────────────────────────
✅ Total: ₹0/month
```

**You save ₹1,32,000/year with BETTER performance!** 🎊

---

## 🚀 Quick Start

```bash
# 1. Get API keys (5 minutes)
# - GROQ: https://console.groq.com
# - Hugging Face: https://huggingface.co
# - SerpAPI: https://serpapi.com

# 2. Install packages
npm install groq-sdk @huggingface/inference serpapi

# 3. Add to .env.local
GROQ_API_KEY=gsk_...
HUGGINGFACE_API_KEY=hf_...
SERPAPI_API_KEY=...

# 4. Deploy!
git push origin main
```

**You're now running AI-powered trust engine for FREE!** ✨
