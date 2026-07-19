# 🚀 Split Deployment Guide: Vercel + Railway

Deploy your frontend to Vercel and backend API to Railway for better scalability.

---

## 🎯 Why Split Deployment?

**Benefits:**
- 🔄 **Independent Scaling** - Scale frontend and backend separately
- 💰 **Cost Optimization** - Railway's generous free tier for APIs
- ⚡ **Better Performance** - Vercel's edge network for frontend
- 🛠️ **Easier Debugging** - Isolated logs and monitoring
- 🔐 **Better Security** - Separate environments for sensitive operations

**Drawbacks:**
- ⚙️ **More Complex Setup** - Two deployments instead of one
- 🔌 **CORS Configuration** - Need to handle cross-origin requests
- 📝 **More Environment Variables** - Need to configure both platforms

**Verdict:** Worth it if you plan to scale or want professional architecture.

---

## ⚠️ IMPORTANT: Current State

Your app currently uses **Next.js API Routes** (all in `/app/api`). To split:

### Option A: Keep as Monolith (Easiest - RECOMMENDED FOR MVP)
Deploy everything to Vercel. Next.js handles both frontend AND backend.

**Pros:** 
- ✅ No code changes needed
- ✅ Deploy in 5 minutes
- ✅ Perfect for MVP/launch

**Cons:**
- ❌ Can't scale frontend/backend independently
- ❌ Vercel's serverless functions have cold starts

### Option B: Split Architecture (Best for Scale)
Extract API routes to Express.js on Railway, keep pages on Vercel.

**Pros:**
- ✅ Independent scaling
- ✅ No serverless cold starts on Railway
- ✅ Professional architecture

**Cons:**
- ❌ Requires refactoring API routes
- ❌ More complex deployment
- ❌ Takes 2-3 hours to set up

---

## 🚦 Recommendation

**For Launch (Now):**
→ Use **Option A** (Deploy everything to Vercel)

**After Launch (When you have users):**
→ Migrate to **Option B** (Split deployment)

**This guide covers Option B** in case you want to do it now or later.

---

## 📋 Option A: Quick Deploy (Monolith to Vercel)

This is what you should do for launch:

### Step 1: Vercel Setup (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from root directory
cd /Users/pradeepkumar/Ownzo
vercel

# When prompted:
# - Set up and deploy: Y
# - Which scope: [Your account]
# - Link to existing project: N
# - Project name: ownzo
# - Directory: ./
# - Override settings: N

# Deploy to production
vercel --prod
```

### Step 2: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add ALL from `.env.local.example`:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Email
RESEND_API_KEY=xxx

# Security
CSRF_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://ownzo.vercel.app
NODE_ENV=production
```

### Step 3: Redeploy

```bash
vercel --prod
```

### Step 4: Test

```bash
curl https://ownzo.vercel.app/api/health
# Should return: {"status":"healthy"}
```

**Done! ✅ Your entire app is live on Vercel.**

---

## 📋 Option B: Split Deployment (Advanced)

Only do this if you want professional architecture NOW.

### Architecture

```
Frontend (Vercel):          Backend (Railway):
- Pages (/app/(main)/*)     - API routes (/api/*)
- Layouts                   - Express.js server
- Client components         - Firebase Admin
- Static assets             - Business logic
                            - Cron jobs
```

### ⚠️ Prerequisites

This requires **significant refactoring**:
1. Convert 42 Next.js API routes to Express routes
2. Update frontend to call Railway backend
3. Handle CORS properly
4. Maintain two deployments

**Time Estimate:** 3-5 hours

---

## 🔧 Step-by-Step: Split Deployment

### Phase 1: Prepare Backend (Railway)

#### 1. Install Express Dependencies

```bash
cd /Users/pradeepkumar/Ownzo
npm install express cors helmet express-rate-limit
```

#### 2. Create Express Server

I've created `/server.js` as a starting point. Now you need to:

**Convert Next.js API Routes to Express:**

Example conversion:

**Before** (`app/api/health/route.ts`):
```typescript
export async function GET() {
  return NextResponse.json({ status: 'healthy' })
}
```

**After** (Express route):
```javascript
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' })
})
```

#### 3. Create Express Routes Structure

```bash
mkdir -p backend/routes
```

Create files:
- `backend/routes/auth.js`
- `backend/routes/listings.js`
- `backend/routes/offers.js`
- `backend/routes/chat.js`
- ... (one for each API group)

#### 4. Update package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "server": "node server.js",
    "server:dev": "nodemon server.js"
  }
}
```

#### 5. Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to new project
railway link

# Add environment variables (Railway dashboard)
# Then deploy
railway up
```

**Railway Environment Variables:**
```bash
# Same as Vercel EXCEPT:
FRONTEND_URL=https://ownzo.vercel.app  # Your Vercel domain
PORT=4000  # Railway will override this
NODE_ENV=production
```

---

### Phase 2: Update Frontend (Vercel)

#### 1. Update API Service

Change all API calls to point to Railway:

**Before** (`frontend/services/api.service.ts`):
```typescript
const API_BASE = '/api'  // Relative URL
```

**After**:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
```

#### 2. Remove API Routes from Next.js

```bash
# Backup first
mv app/api app/api_backup

# Or delete
rm -rf app/api
```

#### 3. Update Environment Variables

Add to Vercel:
```bash
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app/api
```

#### 4. Deploy to Vercel

```bash
vercel --prod
```

---

### Phase 3: Testing

#### 1. Test Backend (Railway)

```bash
curl https://your-railway-app.railway.app/health
# Should return: {"status":"healthy"}

curl https://your-railway-app.railway.app/api/test
# Should return: {"message":"Backend API is running!"}
```

#### 2. Test Frontend (Vercel)

Visit: `https://ownzo.vercel.app`

Check browser console for errors:
- CORS errors? → Fix Railway CORS config
- 404 errors? → Check API_URL is correct
- Network errors? → Check Railway is running

#### 3. Test Full Flow

1. Sign up / Login
2. Create listing
3. Browse listings
4. Send message
5. Make offer

All should work through Railway backend.

---

## 🐛 Troubleshooting

### CORS Errors

**Error:** "Access to fetch at 'https://railway...' from origin 'https://vercel...' has been blocked by CORS"

**Fix:** In `server.js`:
```javascript
const allowedOrigins = [
  'https://ownzo.vercel.app',
  'https://your-custom-domain.com'
]
```

### Railway Not Starting

**Check logs:**
```bash
railway logs
```

**Common issues:**
- Missing environment variables
- Port already in use
- Build failures

### Vercel 404 on API Calls

**Error:** API calls return 404

**Fix:** Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel dashboard

### Firebase Connection Issues

**Railway side:**
- Verify `FIREBASE_PRIVATE_KEY` is properly escaped
- Check Firebase Admin SDK initialization

**Vercel side:**
- Frontend should only use Firebase Client SDK
- No admin operations on frontend

---

## 💰 Cost Comparison

### Option A: Vercel Monolith
```
Vercel Hobby (Free):
- 100GB bandwidth
- Unlimited requests
- Serverless functions
- Custom domains

Cost: $0/month → $20/month (Pro) when you scale
```

### Option B: Vercel + Railway Split
```
Vercel Hobby (Free):
- Just static pages
- Lower bandwidth usage

Railway Free Tier:
- $5 free credit/month
- Up to 500 hours
- 512MB RAM
- 1GB storage

Cost: $0/month → $5-10/month when you scale
```

**Winner for MVP:** Option A (simpler, free)  
**Winner at Scale:** Option B (cheaper, more control)

---

## 📊 Deployment Comparison

| Feature | Vercel Monolith | Vercel + Railway |
|---------|----------------|------------------|
| Setup Time | 10 minutes | 3-5 hours |
| Complexity | Low | Medium |
| Scalability | Good | Excellent |
| Cost (MVP) | Free | Free |
| Cost (Scale) | $20/month | $5-10/month |
| Cold Starts | Yes (functions) | No (always on) |
| Separate Logs | No | Yes |
| Rollback | Frontend only | Frontend + Backend |

---

## ✅ My Recommendation

**For Launch (Week 1-4):**
1. Deploy monolith to Vercel (Option A)
2. Get users and feedback
3. Focus on product-market fit

**After PMF (Month 2+):**
1. If growing, migrate to split (Option B)
2. Better scaling and cost control
3. More professional architecture

**Why?**
- Splitting now = 3-5 hours of work
- Splitting later = Same 3-5 hours
- No benefit until you have traffic
- Launch speed > perfect architecture

---

## 🚀 Quick Commands

### Deploy Monolith (RECOMMENDED)
```bash
# Deploy everything to Vercel
vercel --prod
```

### Deploy Split (Advanced)
```bash
# Deploy backend to Railway
railway up

# Deploy frontend to Vercel
vercel --prod
```

---

## 📞 Need Help?

**Railway Issues:**
- Docs: https://docs.railway.app
- Community: https://discord.gg/railway

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/next.js/discussions

**This Project:**
- Check logs first
- Verify environment variables
- Test API endpoints directly
- Check CORS configuration

---

## 🎯 Final Checklist

### If Going Monolith (Vercel Only):
- [ ] Install Vercel CLI
- [ ] Run `vercel --prod`
- [ ] Add all environment variables
- [ ] Test `/api/health`
- [ ] Test critical flows
- [ ] Go live! 🚀

### If Going Split (Vercel + Railway):
- [ ] Convert API routes to Express
- [ ] Deploy backend to Railway
- [ ] Update frontend API URLs
- [ ] Deploy frontend to Vercel
- [ ] Configure CORS
- [ ] Test both separately
- [ ] Test integrated flows
- [ ] Go live! 🚀

---

**Ready to deploy? Let me know which option you choose and I'll help you through it!**
