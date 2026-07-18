# ⚡ QUICKSTART - Get Running in 10 Minutes

**For:** Developers who want to get the app running quickly  
**Time:** 10-15 minutes  
**Prerequisites:** Node.js 20+, Firebase account, Cloudinary account

---

## 🚀 Fast Setup (10 Steps)

### 1. Check Node Version
```bash
node --version
# Should be v20.x.x or higher
```

### 2. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 3. Create Firebase Project
- Go to: https://console.firebase.google.com/
- Click "Add project" → Name it "ownzo-dev"
- Enable **Authentication** (Google + Email/Password)
- Enable **Firestore Database** (test mode)
- Enable **Storage**

### 4. Get Firebase Config
- Firebase Console → Project Settings → Your apps
- Click web icon `</>` → Register app
- Copy the config values

### 5. Get Service Account
- Project Settings → Service Accounts
- Click "Generate new private key"
- Download JSON file (keep it secure!)

### 6. Get Cloudinary Credentials
- Sign up: https://cloudinary.com/
- Dashboard will show: Cloud name, API Key, API Secret

### 7. Create .env.local
```bash
cd /Users/pradeepkumar/Ownzo
cp .env.local.example .env.local
nano .env.local  # Or use your preferred editor
```

**Paste these values** (replace with your actual values):
```bash
NODE_ENV=development

# Firebase (from step 4)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ownzo-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ownzo-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ownzo-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Firebase Admin (from step 5 - service account JSON)
FIREBASE_PROJECT_ID=ownzo-dev
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ownzo-dev.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Cloudinary (from step 6)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Generate CSRF secret
CSRF_SECRET=$(openssl rand -base64 32)

# Defaults (copy as-is)
API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_URL=http://localhost:3000/api
RATE_LIMIT_ENABLED=true
AUTH_RATE_LIMIT_MAX=10
AUTH_RATE_LIMIT_WINDOW_MS=900000
UPLOAD_RATE_LIMIT_MAX=20
UPLOAD_RATE_LIMIT_WINDOW_MS=3600000
```

**Save and exit** (Ctrl+X, then Y, then Enter in nano)

### 8. Install Dependencies
```bash
npm install
# Takes 2-3 minutes
```

### 9. Deploy Firebase Rules (Optional for now)
```bash
# Select your project
firebase use ownzo-dev

# Deploy rules (optional - can do later)
firebase deploy --only firestore:rules

# Skip indexes for now (they take 30 minutes)
```

### 10. Start the App!
```bash
npm run dev
```

**Open:** http://localhost:3000

---

## ✅ Quick Test

### Test 1: Health Check
```bash
# In a new terminal
curl http://localhost:3000/api/health
# Should return: {"status":"healthy",...}
```

### Test 2: Sign In
1. Go to http://localhost:3000
2. Click "Sign in with Google"
3. Select your account
4. Should redirect to home page ✅

### Test 3: Check Firebase
- Firebase Console → Authentication
- You should see your user listed ✅

---

## 🎉 You're Running!

The app is now running on http://localhost:3000

### What's Working:
✅ Authentication (Google Sign-in)  
✅ Database (Firestore)  
✅ File Storage (Cloudinary)  
✅ Rate Limiting  
✅ CSRF Protection  
✅ Input Validation  
✅ Security Rules  

### Next Steps:
1. **Create categories** (Firebase Console → Firestore → Add collection "categories")
2. **Create a listing** (Go to /listings/create in the app)
3. **Test features** (Search, wishlist, offers, chat)

### Full Testing:
See [SETUP_AND_TEST_GUIDE.md](SETUP_AND_TEST_GUIDE.md) for comprehensive testing

---

## 🚨 Quick Troubleshooting

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 in use"
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### "Firebase authentication failed"
- Check FIREBASE_PRIVATE_KEY includes \n characters
- Make sure it's wrapped in quotes: "-----BEGIN...-----\n"

### "Environment validation failed"
- Check all required variables in .env.local
- Make sure no typos in variable names

### Still stuck?
See full guide: [SETUP_AND_TEST_GUIDE.md](SETUP_AND_TEST_GUIDE.md)

---

**Setup Time:** 10-15 minutes  
**Status:** ✅ Ready to Run
