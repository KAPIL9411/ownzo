# Ownzo - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Firebase account
- Cloudinary account
- Vercel account (for deployment)

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and follow the setup wizard
3. Name your project (e.g., "ownzo-marketplace")

### 1.2 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Google** sign-in provider
4. Add authorized domains (your Vercel domain)

### 1.3 Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose a location close to your users

### 1.4 Set Firestore Security Rules

Go to **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Listings
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.sellerId;
    }
    
    // Categories (read-only)
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    
    // Wishlist
    match /wishlist/{wishlistId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.buyerId || 
         request.auth.uid == resource.data.sellerId);
    }
    
    // Messages
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Offers
    match /offers/{offerId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.sellerId;
    }
    
    // Buy Requests
    match /buyRequests/{requestId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read, update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Communities
    match /communities/{communityId} {
      allow read: if true;
    }
  }
}
```

### 1.5 Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Under "Your apps", click the web icon (</>)
3. Register your app
4. Copy the config values (apiKey, authDomain, etc.)

### 1.6 Generate Service Account

1. Go to **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values:
   - `project_id`
   - `private_key`
   - `client_email`

## Step 2: Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account
3. From the Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: Local Development

### 3.1 Clone and Install

```bash
cd ownzo
npm install
```

### 3.2 Configure Environment Variables

Create `.env.local` file:

```bash
# Firebase Frontend
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Backend (Admin SDK)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# App
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3.3 Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 4.2 Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (same as `.env.local`)
5. Click "Deploy"

### 4.3 Add Environment Variables in Vercel

In Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add all variables from `.env.local`
3. Make sure to properly format `FIREBASE_PRIVATE_KEY`:
   - Keep the quotes
   - Keep `\n` for newlines
   - It should look like: `"-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----\n"`

### 4.4 Update Firebase Authorized Domains

1. Go to Firebase Console > Authentication > Settings
2. Under "Authorized domains", add your Vercel domain:
   - `your-app.vercel.app`
   - Any custom domains

## Step 5: Seed Initial Data

### 5.1 Seed Categories

Categories are automatically seeded on first API call to `/api/categories`

Alternatively, you can manually add categories in Firestore:

```javascript
// Collection: categories
[
  { name: 'Electronics', icon: '📱', slug: 'electronics' },
  { name: 'Furniture', icon: '🛋️', slug: 'furniture' },
  { name: 'Books', icon: '📚', slug: 'books' },
  // ... add more
]
```

### 5.2 Create Communities (Optional)

```javascript
// Collection: communities
[
  { 
    name: 'Mumbai University',
    type: 'college',
    city: 'Mumbai',
    college: 'Mumbai University',
    members: 0,
    verified: true,
    createdAt: new Date()
  }
]
```

## Step 6: Testing

### Test Authentication
1. Go to `/login`
2. Sign in with Google
3. Verify user is created in Firestore `users` collection

### Test Listing Creation
1. Click "Sell" in header
2. Upload images (tests Cloudinary)
3. Fill form and submit
4. Verify listing appears in Firestore `listings` collection

### Test Chat
1. Create a listing
2. Sign in with different account
3. Click "Chat with Seller" on listing
4. Send message
5. Verify chat appears in both accounts

## Step 7: Monitoring

### Firebase Console
- Monitor Firestore reads/writes
- Check Authentication users
- View logs in Functions (if using)

### Vercel Dashboard
- Monitor deployment logs
- Check function execution times
- View real-time logs

### Cloudinary Dashboard
- Monitor storage usage
- View transformation usage
- Check bandwidth

## Troubleshooting

### Firebase Auth Not Working
- Check authorized domains in Firebase Console
- Verify environment variables are correct
- Check browser console for errors

### Images Not Uploading
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper CORS configuration

### API Errors
- Check Vercel function logs
- Verify Firebase Admin SDK credentials
- Ensure Firestore security rules allow operation

### Build Errors
- Run `npm run build` locally first
- Check TypeScript errors
- Verify all dependencies are in `package.json`

## Performance Optimization

### 1. Enable Caching
Already configured in `lib/react-query.tsx`

### 2. Optimize Images
Cloudinary automatically optimizes images with transformations

### 3. Firestore Indexes
Create indexes for common queries in Firebase Console

### 4. CDN
Vercel automatically provides CDN

## Security Checklist

- [x] Firestore security rules implemented
- [x] API authentication required for protected routes
- [x] Environment variables secured
- [x] No secrets in client-side code
- [x] Firebase Admin SDK on server only
- [x] Input validation with Zod
- [x] XSS protection (React automatic)
- [x] CORS configured properly

## Mobile App (Future)

When building React Native app:
1. Use the same REST API endpoints
2. Add mobile OAuth redirect URLs to Firebase
3. Store tokens securely (AsyncStorage/Keychain)
4. No backend changes required!

## Support

For issues:
1. Check Firebase Console logs
2. Check Vercel deployment logs
3. Review Firestore security rules
4. Verify environment variables

## Next Steps

1. Set up custom domain in Vercel
2. Enable Firebase Analytics
3. Set up error tracking (Sentry)
4. Add email notifications (SendGrid)
5. Implement search with Algolia
6. Add payment gateway (Razorpay)
7. Build React Native mobile app

## Production Checklist

Before going live:
- [ ] Test all user flows
- [ ] Verify Firestore security rules
- [ ] Set up monitoring and alerts
- [ ] Configure custom domain
- [ ] Add privacy policy and terms
- [ ] Test mobile responsiveness
- [ ] Set up SSL certificate
- [ ] Configure email notifications
- [ ] Add error tracking
- [ ] Test payment flow (if implemented)
- [ ] Create backup strategy
- [ ] Set up staging environment
