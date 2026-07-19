# Vercel Environment Variables Configuration

## 🚀 Required Environment Variables for Production

Add these to your Vercel project: **Project Settings → Environment Variables**

---

## 1️⃣ Firebase Configuration (Frontend)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDW0ad5EKVx7BEgT8AKyDViTPfapwL4pd4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ownzo-68cc6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ownzo-68cc6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ownzo-68cc6.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=97690045585
NEXT_PUBLIC_FIREBASE_APP_ID=1:97690045585:web:f0ccccc8e4519db9c48330
```

---

## 2️⃣ Firebase Admin SDK (Backend)

```env
FIREBASE_PROJECT_ID=ownzo-68cc6
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ownzo-68cc6.iam.gserviceaccount.com
```

**FIREBASE_PRIVATE_KEY** (⚠️ Use exactly as shown, including quotes):
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDmw/SBpIPs7g5Q\n1zFPkc9+s3fiUyIxp/5uXa8h6KMPWUJeJ6cygtHipQkSMa8EZM3d41Ff4cYSOMSF\nRCVaHuXzZbT1cD7r9OkjxSVDOjR4RBh4QMf4GOM9oulJK3OjuJvXQB0+pL72kQfc\nlQony8ZprLV9bfQbFTKoGebckFFtI/Cwf+WC+7BIlWrIe7Eg/4tN/x7wE2hSr9sh\n05idua7WT6YMr4v51TvDzhbCKQ+uJ2puT3SuuYZrd2oAePo5RRu/h6wJVQV+kSxe\nK6yAQ+2PcX0WO/A2Hp3JIpVztIkvrxcxZhviBc7G5v8OkeFeqJqcD4R7v3g2GvTx\njpeW/yuRAgMBAAECggEAA8hrO1jUD3qTjNW06ZCtWG60D2dnecLpk9ZApwtQ6PvV\n768yDszq3ePwsyCnYCi64Iv3wIegn0SDoYpNcR3CjUE55zAbh/Na2GBEonEo0l6O\nEXfrufBxK93TednsKl8+BsL2om6W8XnNKYYz8BUSFUIPM5WC2T15YsdnQRmzNq5x\nK9RQxlAoiZFLPfSSfEUytqtggIU5Ojjkpe+imT3IP5wHG8CU3ciUhI1CExFWia9V\npxAb1ApCTYEZp/jakJfP2az7o9emU+1PkX1RxCIE2eK4fcEx+kagkXO+GrKUvNPm\n4s0vp2IxQocJ9L02YEdu907eT5R6fI34NXvkjDQgQQKBgQD8adMzpIkiisksIW7A\ngUBFz2wiLdFhvkzceYEJddQUtb6dc5DqAEBX17p6PWnIUJkrCllAoV2kcFoRkXRD\ntHCzHraYvWqnH67HggVr0ytJg1SXqM+lrLaF//aVT4qFptYHXQXBXObjE88HTFQn\nWpyKOrbUMFOnRKiGvITPnMSMeQKBgQDqC2JI32qlegFtnXvgdT+h+0Gcb47ky6P/\npr7ulGK+uukwDCChQKTIpYR9YlXkEtfgncN5W7wRsd1JkC19szS64UX/zHEy3Wvt\nNTdZMP/xMhpDwV/2yR+cfjI46Fl89rRvDmwAJx0FGq1q54hczsurAskr8DUS3Icj\nb42gPWyh2QKBgGH3QL2ecosxinrSTwXwJF3z72gkmEtzbKl1jxt42+Nd1qmNnQT1\nLAPr+rhO9auFfK0zywhGmO2lnY+MAK/2bHdYyE3n1mke5tsQH8KFpxtVGZPzNQR8\nUCsZ+T5iLMVKx278L6uovwQLQCL5AQB1LqSHvUYFq7IT98Szjmh10+MhAoGBALgF\n32/BC4+1EK5pp19jkXcBoiMorEhFvltjdrkMv1+Mg5Gd14Iy295QFo6n5TUBg/A+\n29XuRT/8hCw1Sy+M2qcePfXVgCQoaZYHw89DcdrqNDCWOahHl61qpH6OYt6Y9GJm\nCpFML8s1oKlwB45Bo26BMEB2DKUZ9L/uFIOsCGBxAoGACRrWMdSvu0Oi9zeHsxf4\nkee9tFE9RSewfj3CZmE0+MYZng8ZybXgh15QlhYwjx7qpnelDEEYHmPJr/TuehGG\nirU7zcSL5oq4RA8dcahwXfmYDluT6X5fZUQPFGva496Gcc+coF0TbLff39ec/bVE\nHZAND0CCxAMDO+82vKXpN6E=\n-----END PRIVATE KEY-----\n"
```

---

## 3️⃣ Cloudinary (Image Storage)

```env
CLOUDINARY_CLOUD_NAME=owxvjtwh
CLOUDINARY_API_KEY=377718628869688
CLOUDINARY_API_SECRET=EU_BQPlzwuodG5TWdVMFMqHgBQw
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=owxvjtwh
```

---

## 4️⃣ App Configuration

**⚠️ CRITICAL - Use your CUSTOM DOMAIN, NOT Vercel domain:**

```env
NEXT_PUBLIC_API_URL=https://www.ownzo.in/api
NODE_ENV=production
```

**Important:**
- ✅ Use: `https://www.ownzo.in/api` (your custom domain)
- ❌ Don't use: `https://ownzo.vercel.app/api` (Vercel domain)
- This ensures proper CORS and API routing

---

## 5️⃣ Rate Limiting (IMPORTANT - Fixes 429 Error)

```env
RATE_LIMIT_ENABLED=false
```

**Note:** Set to `false` initially for smooth launch. Enable later in production with proper Redis setup.

---

## 6️⃣ CSRF Protection

```env
CSRF_ENABLED=false
CSRF_SECRET=3a238c59de5e8239403dca8e6b82ceff06352cf0de32237987e40e9784a58461
```

**Note:** Disabled for now due to custom domain. Can enable after proper CORS/CSRF configuration.

---

## 7️⃣ Trust Engine Configuration

```env
TRUST_ENGINE_ENABLED=true
TRUST_ENGINE_MIN_PHOTOS_GENERAL=3
TRUST_ENGINE_MIN_PHOTOS_HIGH_VALUE=5
TRUST_ENGINE_HIGH_VALUE_THRESHOLD=5000
TRUST_ENGINE_AUTO_PUBLISH_THRESHOLD=95
TRUST_ENGINE_SUGGEST_IMPROVEMENTS_THRESHOLD=60
TRUST_ENGINE_REQUIRE_REVIEW_THRESHOLD=40
TRUST_ENGINE_ENABLE_PRICE_VALIDATION=true
TRUST_ENGINE_ENABLE_CATEGORY_VERIFICATION=true
```

---

## 8️⃣ AI Services (Free Tier)

### GROQ (OpenAI Alternative - FREE)
```env
GROQ_API_KEY=your_groq_api_key_here
```
**Get your key:** https://console.groq.com (Free, no credit card required)

### Hugging Face (Image Analysis)
```env
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```
**Get your key:** https://huggingface.co (Free, 30,000 requests/month)

### SerpAPI (Reverse Image Search)
```env
SERPAPI_API_KEY=your_serpapi_key_here
```
**Get your key:** https://serpapi.com (Free tier: 100 searches/month)

### Enable AI Features
```env
TRUST_ENGINE_ENABLE_AI_CONTENT_ANALYSIS=true
TRUST_ENGINE_ENABLE_AI_PHOTO_ANALYSIS=true
TRUST_ENGINE_ENABLE_REVERSE_IMAGE_SEARCH=true
```

---

## 9️⃣ Optional/Empty Variables (Not Needed)

```env
OPENAI_API_KEY=
GOOGLE_CLOUD_VISION_KEY=
REVERSE_IMAGE_SEARCH_API_KEY=
REDIS_ENABLED=false
REDIS_URL=
```

---

## 📋 How to Add These to Vercel

### Method 1: Web Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `ownzo` project
3. Click **Settings** → **Environment Variables**
4. For each variable above:
   - Click **Add New**
   - Enter **Key** (e.g., `RATE_LIMIT_ENABLED`)
   - Enter **Value** (e.g., `false`)
   - Select **Production**, **Preview**, and **Development** environments
   - Click **Save**

### Method 2: Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd /Users/pradeepkumar/Downloads/ownzo-main
vercel link

# Add environment variables one by one
vercel env add RATE_LIMIT_ENABLED production
# When prompted, enter: false

# Or bulk import from file
vercel env pull .env.vercel
```

---

## 🔄 After Adding Variables

1. **Redeploy** your application:
   - Either push a new commit to GitHub
   - Or go to Vercel → Deployments → Click "Redeploy"

2. **Verify** it works:
   - Visit https://www.ownzo.in
   - Try logging in
   - Should NOT see 429 errors anymore

---

## 🐛 Troubleshooting

### Still Getting 429 Errors?
- ✅ Verify `RATE_LIMIT_ENABLED=false` is set in Vercel
- ✅ Make sure you selected **Production** environment
- ✅ Redeploy after adding the variable
- ✅ Clear browser cache and cookies

### CORS Errors?
- ✅ Check `NEXT_PUBLIC_API_URL` matches your domain
- ✅ Verify custom domain is connected in Vercel
- ✅ Wait 5-10 minutes for DNS propagation

### Login Not Working?
- ✅ Verify all Firebase variables are set correctly
- ✅ Check Firebase console: Authentication → Settings → Authorized domains
- ✅ Add `www.ownzo.in` and `ownzo.in` to authorized domains

### Images Not Uploading?
- ✅ Verify all Cloudinary variables are set
- ✅ Check Cloudinary dashboard for quota limits

---

## 🔒 Security Notes

### Variables to NEVER Share Publicly:
- ❌ `FIREBASE_PRIVATE_KEY`
- ❌ `CLOUDINARY_API_SECRET`
- ❌ `GROQ_API_KEY`
- ❌ `HUGGINGFACE_API_KEY`
- ❌ `SERPAPI_API_KEY`
- ❌ `CSRF_SECRET`

### Variables Safe to Share (Public):
- ✅ All `NEXT_PUBLIC_*` variables (these are embedded in client-side code)
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

---

## 📊 Production Checklist

Once variables are added and deployed:

- [ ] Login works without 429 errors
- [ ] Image upload works
- [ ] Listings creation works
- [ ] Trust scores are calculated
- [ ] Notifications are sent
- [ ] Admin panel is accessible (set your user `role=admin` in Firestore)
- [ ] Custom domain (www.ownzo.in) loads correctly
- [ ] HTTPS is working

---

## 🎯 Critical Variables for Launch

**Minimum required to fix 429 error:**
```env
RATE_LIMIT_ENABLED=false
NEXT_PUBLIC_API_URL=https://www.ownzo.in/api
NODE_ENV=production
```

**Full production setup requires all variables above.**

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel Function Logs: Dashboard → Project → Deployments → Latest → Functions
2. Check Browser Console for client-side errors
3. Verify all environment variables are set correctly
4. Make sure you redeployed after adding variables

---

**Last Updated:** July 19, 2026
**Status:** Ready for Production 🚀
