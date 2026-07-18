# 🚀 Complete Setup and Test Guide - Ownzo Marketplace

This guide will walk you through setting up and testing the application from scratch.

**Time Required:** 60-90 minutes  
**Difficulty:** Beginner-friendly

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Firebase Setup](#3-firebase-setup)
4. [Cloudinary Setup](#4-cloudinary-setup)
5. [Environment Configuration](#5-environment-configuration)
6. [Install Dependencies](#6-install-dependencies)
7. [Run the Application](#7-run-the-application)
8. [Test the Application](#8-test-the-application)
9. [Deploy to Production](#9-deploy-to-production)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### Install Required Software

#### A. Node.js (v20 or higher)
```bash
# Check if installed
node --version  # Should be v20.x.x or higher

# If not installed, download from: https://nodejs.org/
# Or use nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

#### B. Git
```bash
# Check if installed
git --version

# If not installed:
# macOS: Already installed with Xcode Command Line Tools
# Or download from: https://git-scm.com/
```

#### C. Firebase CLI
```bash
# Install globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

#### D. Code Editor (Optional but Recommended)
- Visual Studio Code: https://code.visualstudio.com/

### Create Accounts (Free Tiers Available)

- [ ] Firebase Account: https://firebase.google.com/
- [ ] Cloudinary Account: https://cloudinary.com/
- [ ] Vercel Account (for deployment): https://vercel.com/
- [ ] GitHub Account: https://github.com/

---

## 2. Local Development Setup

### Step 1: Navigate to Project Directory
```bash
# You're already in the project directory
cd /Users/pradeepkumar/Ownzo

# Verify you're in the right place
ls -la
# You should see: package.json, app/, backend/, etc.
```

### Step 2: Check Project Structure
```bash
# List key directories
ls -la

# Expected output should include:
# - app/           (Next.js app directory)
# - backend/       (Backend services and middleware)
# - frontend/      (Frontend components and hooks)
# - shared/        (Shared utilities)
# - firestore.indexes.json
# - firestore.rules
# - package.json
```

---

## 3. Firebase Setup

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Project name: `ownzo-dev` (for development)
4. Disable Google Analytics (optional for dev)
5. Click "Create project"

### Step 2: Enable Authentication

1. In Firebase Console, click "Authentication"
2. Click "Get started"
3. Enable "Google" sign-in:
   - Click on "Google"
   - Toggle "Enable"
   - Add support email
   - Save

4. Enable "Email/Password" sign-in:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Save

### Step 3: Create Firestore Database

1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (we'll deploy rules later)
4. Choose location: `us-central1` (or closest to you)
5. Click "Enable"

### Step 4: Enable Storage

1. In Firebase Console, click "Storage"
2. Click "Get started"
3. Start in test mode
4. Same location as Firestore
5. Click "Done"

### Step 5: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app name: "Ownzo Dev"
5. Copy the Firebase configuration (you'll need this later)

```javascript
// Example configuration (yours will be different)
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ownzo-dev.firebaseapp.com",
  projectId: "ownzo-dev",
  storageBucket: "ownzo-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

### Step 6: Generate Service Account Key

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Click "Generate key"
4. A JSON file will download - **KEEP THIS SECURE!**
5. Open the JSON file, you'll need:
   - `project_id`
   - `client_email`
   - `private_key`

### Step 7: Login to Firebase CLI

```bash
# Login to Firebase
firebase login

# This will open a browser window
# Sign in with your Google account
# Allow Firebase CLI access

# Verify login
firebase projects:list
# You should see your ownzo-dev project
```

### Step 8: Initialize Firebase in Project

```bash
# Select your project
firebase use ownzo-dev

# Verify selection
firebase projects:list
# The selected project will have an asterisk (*)
```

---

## 4. Cloudinary Setup

### Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. Verify your email

### Step 2: Get Cloudinary Credentials

1. Login to Cloudinary Dashboard
2. You'll see your credentials at the top:
   - **Cloud name**: `your-cloud-name`
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxxxxxxxxxxxxxxxxxx`
3. Copy these - you'll need them for environment variables

---

## 5. Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example file
cp .env.example .env.local

# If .env.example doesn't exist, copy from the new template
cp .env.local.example .env.local
```

### Step 2: Edit Environment File

```bash
# Open the file in your editor
code .env.local

# Or use nano
nano .env.local
```

### Step 3: Fill in Environment Variables

Replace the values with your actual credentials:

```bash
# Environment
NODE_ENV=development

# Firebase Configuration (from Step 3.5)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ownzo-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ownzo-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ownzo-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxx

# Firebase Admin SDK (from Step 3.6 - service account JSON)
FIREBASE_PROJECT_ID=ownzo-dev
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ownzo-dev.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Cloudinary Configuration (from Step 4.2)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxx

# CSRF Secret (generate a new one)
CSRF_SECRET=your_development_csrf_secret_min_32_chars_long_random_string

# API Configuration
API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Rate Limiting (lenient for development)
RATE_LIMIT_ENABLED=true
AUTH_RATE_LIMIT_MAX=10
AUTH_RATE_LIMIT_WINDOW_MS=900000
UPLOAD_RATE_LIMIT_MAX=20
UPLOAD_RATE_LIMIT_WINDOW_MS=3600000

# Feature Flags (disabled for development)
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_ANALYTICS=false
SENTRY_ENABLED=false

# Logging
LOG_LEVEL=debug
LOG_TO_FILE=false
```

### Step 4: Generate CSRF Secret

```bash
# Generate a random 32-character string
openssl rand -base64 32

# Copy the output and paste it as CSRF_SECRET in .env.local
```

### Step 5: Format Private Key Correctly

**Important:** The Firebase private key must preserve newlines.

Option A - Manual (if copying from JSON):
```bash
# The private key in the JSON file looks like:
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...\n-----END PRIVATE KEY-----\n"

# In .env.local, keep the \n characters:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...\n-----END PRIVATE KEY-----\n"
```

Option B - Use the JSON file directly (recommended):
```bash
# Instead of copying individual fields, reference the JSON file
# Create a serviceAccountKey.json file in project root
# Copy the entire downloaded JSON into it

# Then update backend/lib/firebase-admin/config.ts to use the file
# (We'll verify this works in testing)
```

---

## 6. Install Dependencies

### Step 1: Check Package.json

```bash
# View package.json to see dependencies
cat package.json
```

### Step 2: Install Node Modules

```bash
# Clean install (recommended)
npm ci

# Or regular install
npm install

# This will take 2-5 minutes
# You should see: added XXX packages
```

### Step 3: Verify Installation

```bash
# Check if node_modules exists
ls -la node_modules | head

# Check for key dependencies
npm list next
npm list react
npm list firebase
npm list zod
```

---

## 7. Run the Application

### Step 1: Deploy Firestore Rules and Indexes (Local Emulator)

For development, we can use Firebase emulators:

```bash
# Initialize Firebase emulators (if not already done)
firebase init emulators

# Select:
# - Firestore
# - Authentication
# - Storage
# Use default ports

# Start emulators (optional for development)
firebase emulators:start
```

**OR** deploy to actual Firebase:

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes (takes 15-30 minutes to build)
firebase deploy --only firestore:indexes

# Check index build status
firebase firestore:indexes
```

### Step 2: Build the Application

```bash
# Run build to check for errors
npm run build

# Expected output:
# ✓ Compiled successfully
# Route (app)                              Size     First Load JS
# ├ ○ /                                    XXX kB         XXX kB
# ...
```

### Step 3: Start Development Server

```bash
# Start the dev server
npm run dev

# Expected output:
# ✓ Ready in X.Xs
# ○ Local:        http://localhost:3000
# ○ Network:      http://192.168.x.x:3000
```

### Step 4: Verify Server is Running

```bash
# In a new terminal window, test the health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","uptime":...}
```

---

## 8. Test the Application

### Test 1: Open the Application

```bash
# Open in browser
open http://localhost:3000

# Or manually navigate to: http://localhost:3000
```

**Expected:** You should see the login page

### Test 2: Check Health Endpoint

```bash
# Test health check
curl http://localhost:3000/api/health | jq

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-07-18T...",
  "uptime": 123.456,
  "services": {
    "api": "ok",
    "database": "ok",
    "storage": "ok"
  }
}
```

### Test 3: Test Categories Endpoint

```bash
# Test categories API
curl http://localhost:3000/api/categories | jq

# Expected: List of categories or empty array
{
  "success": true,
  "data": []
}
```

### Test 4: Test CSRF Token Endpoint

```bash
# Get CSRF token
curl http://localhost:3000/api/auth/csrf-token | jq

# Expected:
{
  "success": true,
  "csrfToken": "..."
}
```

### Test 5: Test Authentication

#### A. Sign Up with Google

1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Select your Google account
4. Allow permissions
5. **Expected:** Redirected to home page

#### B. Verify User in Firebase

1. Go to Firebase Console → Authentication
2. **Expected:** You should see your user listed

### Test 6: Test File Upload

```bash
# Create a test image
echo "Test image content" > test-image.txt

# Upload test file (requires authentication)
# First, sign in through the UI, then get the auth token from browser DevTools

# In browser console:
localStorage.getItem('authToken')

# Then test upload:
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-image.txt"
```

### Test 7: Test Rate Limiting

```bash
# Rapid fire requests to trigger rate limit
for i in {1..15}; do
  curl http://localhost:3000/api/categories
  echo "Request $i"
done

# Expected: After a certain number, you'll get 429 Too Many Requests
```

### Test 8: Test Listings API

#### A. Create Test Categories (via Firebase Console)

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `categories`
4. Document ID: `auto-generate`
5. Add fields:
   - `name` (string): "Electronics"
   - `icon` (string): "laptop"
   - `createdAt` (timestamp): current time

#### B. Test Listings Endpoint

```bash
# Test listings with filters
curl "http://localhost:3000/api/listings?limit=10" | jq

# Expected: Empty array initially
{
  "success": true,
  "data": [],
  "total": 0,
  "hasMore": false
}
```

### Test 9: Create a Test Listing

1. Sign in to the app
2. Click "Create Listing" or go to `/listings/create`
3. Fill in the form:
   - Title: "Test Laptop"
   - Description: "A test laptop for sale"
   - Price: 500
   - Category: Select one
   - Condition: "Good"
   - Upload an image
4. Click "Create"
5. **Expected:** Listing created successfully

### Test 10: Verify in Firestore

1. Go to Firebase Console → Firestore
2. Check `listings` collection
3. **Expected:** Your test listing should appear

### Test 11: Test Search

```bash
# Test search endpoint
curl "http://localhost:3000/api/search?q=laptop" | jq

# Expected: Should return your test listing
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Test Laptop",
      "price": 500,
      ...
    }
  ]
}
```

### Test 12: Test Error Boundaries

```bash
# Open browser DevTools (F12)
# In Console, throw an error:
throw new Error("Test error boundary")

# Expected: Error boundary should catch it and show friendly error UI
# NOT a blank white screen
```

### Test 13: Check for Console Errors

```bash
# Open browser DevTools (F12) → Console tab
# Navigate around the app:
# - Go to home page
# - Go to listings
# - Go to create listing
# - Sign in/out

# Expected: No red errors in console (warnings are ok)
```

### Test 14: Test Responsive Design

```bash
# Open browser DevTools (F12)
# Click device toolbar icon (or press Cmd+Shift+M)
# Switch between different devices:
# - iPhone 12 Pro
# - iPad
# - Desktop

# Expected: UI should adapt to different screen sizes
```

### Test 15: Test Validation

#### A. Test Form Validation

1. Go to create listing form
2. Try to submit with empty title
3. **Expected:** Validation error message

#### B. Test API Validation

```bash
# Test with invalid data
curl -X POST http://localhost:3000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "ab", "price": -100}'

# Expected: 400 Bad Request with validation errors
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {"field": "title", "message": "Title must be at least 3 characters"},
    {"field": "price", "message": "Price must be positive"}
  ]
}
```

---

## 9. Deploy to Production

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

### Quick Deploy Steps:

```bash
# 1. Deploy Firestore
firebase deploy --only firestore:indexes,firestore:rules

# 2. Configure Vercel
vercel login
vercel link

# 3. Add environment variables to Vercel
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# ... (add all variables from .env.production.example)

# 4. Deploy
vercel --prod
```

---

## 10. Troubleshooting

### Issue: "Firebase not initialized"

**Solution:**
```bash
# Check if .env.local exists and has correct values
cat .env.local | grep FIREBASE

# Restart dev server
npm run dev
```

### Issue: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue: "Firebase admin authentication failed"

**Solution:**
```bash
# Check if private key is formatted correctly
# Make sure it includes \n characters
echo $FIREBASE_PRIVATE_KEY

# Or use service account JSON file instead
# Place serviceAccountKey.json in project root
```

### Issue: "CORS error when uploading to Cloudinary"

**Solution:**
1. Go to Cloudinary Settings
2. Add `http://localhost:3000` to allowed origins
3. Restart dev server

### Issue: "Firestore permission denied"

**Solution:**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Or temporarily set rules to test mode (development only):
# In Firebase Console → Firestore → Rules, set:
# allow read, write: if true;
```

### Issue: "Environment validation failed"

**Solution:**
```bash
# Check backend/config/env.ts
# Make sure all required variables are in .env.local

# Test environment validation
node -e "require('./backend/config/env').validateEnv()"
```

### Issue: Build fails with TypeScript errors

**Solution:**
```bash
# Check for type errors
npx tsc --noEmit

# If Zod is missing
npm install zod

# Clear Next.js cache
rm -rf .next
npm run build
```

---

## ✅ Success Checklist

After completing all steps, you should have:

- [ ] Firebase project created and configured
- [ ] Cloudinary account set up
- [ ] Environment variables configured in .env.local
- [ ] All dependencies installed
- [ ] Application running on http://localhost:3000
- [ ] Health endpoint returning healthy status
- [ ] User authentication working (Google sign-in)
- [ ] Can create a test listing
- [ ] Can upload images
- [ ] Rate limiting working
- [ ] Validation working
- [ ] No console errors
- [ ] Firestore rules and indexes deployed

---

## 🎉 You're Ready!

Your Ownzo marketplace is now running locally and fully tested!

### Next Steps:

1. **Explore the app:** Create listings, test features
2. **Review documentation:** Check FIXES_APPLIED.md to see what was fixed
3. **Deploy to production:** Follow DEPLOYMENT_GUIDE.md when ready
4. **Customize:** Add your branding, modify features as needed

### Need Help?

- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment
- Check [FIXES_APPLIED.md](FIXES_APPLIED.md) for technical details
- Check [TROUBLESHOOTING](#10-troubleshooting) section above
- Create a GitHub issue if you encounter problems

---

**Setup Time:** ~60-90 minutes  
**Last Updated:** 2026-07-18  
**Status:** Ready for Development ✅
