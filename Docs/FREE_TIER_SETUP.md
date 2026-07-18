# 🆓 Free Tier Setup - No Credit Card Needed!

**Perfect for:** Students and developers who want to test without spending money  
**Time Required:** 25 minutes  
**Cost:** $0 (100% Free)

---

## 🎯 What You Get for Free

### Firebase Free (Spark Plan)
- ✅ Authentication (10K verifications/month)
- ✅ Firestore Database (1GB storage, 50K reads/day)
- ❌ Storage (requires paid plan) - **We don't need this!**

### Cloudinary Free Tier
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ Image & video uploads
- ✅ Image transformations
- ✅ Auto-format delivery (WebP, AVIF)

**Result:** Everything works perfectly on free tiers! 🎉

---

## 📋 Setup Steps (Free Tier Only)

### STEP 1: Create Firebase Project (10 minutes)

#### A. Create Project (Free - Spark Plan)

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"**
3. Project name: `ownzo-dev`
4. **Disable** Google Analytics (saves quota)
5. Click **"Create project"**
6. ⚠️ **IMPORTANT:** Stay on **Spark (Free) plan** - Don't upgrade!

#### B. Enable Authentication (Free)

1. Click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Enable **"Google"** provider:
   - Toggle "Enable"
   - Add support email
   - Save
4. Enable **"Email/Password"**:
   - Toggle "Enable"
   - Save

**Free Tier Limits:**
- ✅ 10,000 verifications per month
- ✅ Unlimited users
- Perfect for development!

#### C. Create Firestore Database (Free)

1. Click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"**
4. Location: `us-central1` (or closest)
5. Click **"Enable"**

**Free Tier Limits:**
- ✅ 1 GB storage
- ✅ 50,000 document reads per day
- ✅ 20,000 writes per day
- ✅ 20,000 deletes per day
- Perfect for development and small apps!

#### D. ~~Storage~~ **SKIP - NOT NEEDED!**

**Firebase Storage requires paid plan.**  
**We use Cloudinary instead (free 25GB)!** ✅

#### E. Get Firebase Web Config

1. Click gear icon ⚙️ → **"Project settings"**
2. Scroll to **"Your apps"**
3. Click web icon `</>`
4. App nickname: `Ownzo Web`
5. **Don't** check Firebase Hosting
6. Click **"Register app"**
7. **Copy all the config values:**

```javascript
// Save these values for later!
apiKey: "AIzaSy..."
authDomain: "ownzo-dev.firebaseapp.com"
projectId: "ownzo-dev"
storageBucket: "ownzo-dev.appspot.com"  // We won't use this
messagingSenderId: "123456789"
appId: "1:123456789:web:xxx"
```

#### F. Get Service Account Key

1. Still in **Project settings**
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"**
5. JSON file downloads - **KEEP IT SAFE!**
6. You'll need these from the JSON:
   - `project_id`
   - `client_email`
   - `private_key`

---

### STEP 2: Create Cloudinary Account (5 minutes)

#### A. Sign Up (Free Tier)

1. Go to: https://cloudinary.com/users/register/free
2. Fill in:
   - Name
   - Email
   - Cloud name (e.g., "ownzo-dev")
   - Password
3. Click **"Create account"**
4. Verify your email

**Free Tier Includes:**
- ✅ 25 GB storage
- ✅ 25 GB bandwidth per month
- ✅ 25,000 transformations per month
- ✅ Unlimited images
- ✅ Unlimited videos
- Perfect for development and small apps!

#### B. Get Credentials

1. Login to Cloudinary Dashboard
2. At the top, copy these values:
   - **Cloud name**: `your-cloud-name`
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxxxxxxxxxxxxxxxxxx`

---

### STEP 3: Configure Environment (5 minutes)

#### A. Create .env.local

```bash
cd /Users/pradeepkumar/Ownzo
cp .env.local.example .env.local
```

#### B. Edit .env.local

```bash
# Open in your editor
nano .env.local
```

#### C. Fill in Values

**Replace with your actual values:**

```bash
NODE_ENV=development

# Firebase (from Step 1.E)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ownzo-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ownzo-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ownzo-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxx

# Firebase Admin (from Step 1.F - service account JSON)
FIREBASE_PROJECT_ID=ownzo-dev
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ownzo-dev.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Cloudinary (from Step 2.B)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Generate CSRF secret (run: openssl rand -base64 32)
CSRF_SECRET=your_generated_secret_here

# Defaults (keep as-is)
API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_URL=http://localhost:3000/api
RATE_LIMIT_ENABLED=true
AUTH_RATE_LIMIT_MAX=10
AUTH_RATE_LIMIT_WINDOW_MS=900000
UPLOAD_RATE_LIMIT_MAX=20
UPLOAD_RATE_LIMIT_WINDOW_MS=3600000
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_ANALYTICS=false
SENTRY_ENABLED=false
LOG_LEVEL=debug
LOG_TO_FILE=false
```

**Generate CSRF Secret:**
```bash
openssl rand -base64 32
```
Copy the output and paste it as `CSRF_SECRET`

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

### STEP 4: Install and Run (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Install Firebase CLI
npm install -g firebase-tools

# 3. Login to Firebase
firebase login

# 4. Connect to your project
firebase use ownzo-dev

# 5. Deploy Firestore rules
firebase deploy --only firestore:rules

# 6. Start the app!
npm run dev
```

**Open:** http://localhost:3000

---

## ✅ Test Everything Works

### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"healthy",...}
```

### Test 2: Sign In
1. Go to http://localhost:3000
2. Click "Sign in with Google"
3. Sign in with your Google account
4. ✅ Should redirect to home page

### Test 3: Upload an Image
1. Go to http://localhost:3000/listings/create
2. Fill in the form
3. Upload an image
4. ✅ Should upload successfully to Cloudinary

### Test 4: Check Firebase Console
- Go to Firebase Console → Authentication
- ✅ Should see your user

### Test 5: Check Cloudinary
- Go to Cloudinary Dashboard → Media Library
- ✅ Should see your uploaded images

---

## 📊 Free Tier Limits

### When You'll Hit Limits

**Firebase (Free - Spark Plan):**
- **Reads:** 50,000/day = ~1,666 per hour
  - Each page view = ~5-10 reads
  - **Can handle:** ~150-300 page views per hour
- **Writes:** 20,000/day = ~833 per hour
  - Each listing created = ~3-5 writes
  - **Can handle:** ~150-200 listings created per hour
- **Storage:** 1 GB
  - Each listing = ~2 KB
  - **Can handle:** ~500,000 listings

**Cloudinary (Free Tier):**
- **Storage:** 25 GB
  - Each image = ~500 KB (after compression)
  - **Can handle:** ~50,000 images
- **Bandwidth:** 25 GB/month
  - Each image view = ~500 KB
  - **Can handle:** ~50,000 image views per month

### Conclusion
**Free tiers are MORE than enough for:**
- ✅ Development and testing
- ✅ MVP and beta testing
- ✅ Small community (100-500 users)
- ✅ Demo apps
- ✅ Portfolio projects

---

## 💡 Tips to Stay Within Free Tiers

### Reduce Firebase Reads
```javascript
// ❌ Bad: Fetches all documents
const listings = await getDocs(collection(db, 'listings'))

// ✅ Good: Fetch only what you need
const listings = await getDocs(
  query(collection(db, 'listings'), limit(20))
)
```

### Optimize Cloudinary Usage
```javascript
// ✅ Use transformations to reduce file sizes
// These don't count toward your quota!
const optimizedUrl = getOptimizedUrl(imageUrl, 800, 800)

// ✅ Use auto-format to serve WebP/AVIF
// These are smaller and don't increase bandwidth usage
```

### Cache Aggressively
```javascript
// ✅ Cache data in localStorage/sessionStorage
// ✅ Use React Query with long staleTime
// ✅ Implement pagination (already done!)
```

---

## 🚀 When to Upgrade

### Firebase Blaze Plan (Pay-as-you-go)
**Consider when:**
- 50,000+ reads per day
- Need Firebase Storage
- Need Cloud Functions
- Production app with 500+ daily users

**Cost:** ~$25-50/month for medium traffic

### Cloudinary Paid Plan
**Consider when:**
- 25 GB storage not enough
- 25 GB bandwidth not enough
- Need advanced features

**Cost:** Starts at $99/month

---

## 🎉 You're All Set!

Your app is running **100% free** with:
- ✅ Authentication (10K/month)
- ✅ Database (1GB, 50K reads/day)
- ✅ File uploads (25GB storage, 25GB bandwidth)
- ✅ Image optimization (25K transformations)
- ✅ All security features
- ✅ All performance optimizations

**No credit card required!** 💳❌

---

## 📚 Next Steps

1. **Add test categories** (Firebase Console)
2. **Create listings** (http://localhost:3000/listings/create)
3. **Test uploads** (Upload images to Cloudinary)
4. **Monitor usage** (Firebase & Cloudinary dashboards)
5. **Deploy indexes** (optional, improves performance)

---

## 🆘 Troubleshooting

### "Firebase Storage permission denied"
**This is normal!** We don't use Firebase Storage. Ignore this error.

### "Cloudinary upload failed"
1. Check your Cloudinary credentials in .env.local
2. Make sure you verified your email
3. Check Cloudinary Dashboard for errors

### "Quota exceeded"
Check your usage:
- **Firebase:** Console → Usage and billing
- **Cloudinary:** Dashboard → Usage

### Still free tier after testing?
**Yes!** Unless you have thousands of users, you'll stay within free limits.

---

**Setup Time:** 25 minutes  
**Monthly Cost:** $0  
**Perfect for:** Development, Testing, MVPs, Demos  

🎉 **Enjoy your free production-ready marketplace!**
