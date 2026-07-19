# Vercel Environment Variables Setup

Copy these environment variables to your Vercel project settings.

## 📍 How to Add in Vercel:
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable below
4. Set the environment: **Production**, **Preview**, and **Development** (select all three)

---

## 🔥 Firebase Configuration (Frontend)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDW0ad5EKVx7BEgT8AKyDViTPfapwL4pd4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ownzo-68cc6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ownzo-68cc6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ownzo-68cc6.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=97690045585
NEXT_PUBLIC_FIREBASE_APP_ID=1:97690045585:web:f0ccccc8e4519db9c48330
```

---

## 🔐 Firebase Admin SDK (Backend)

```bash
FIREBASE_PROJECT_ID=ownzo-68cc6
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ownzo-68cc6.iam.gserviceaccount.com
```

**⚠️ FIREBASE_PRIVATE_KEY** (Special handling required):
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDmw/SBpIPs7g5Q
1zFPkc9+s3fiUyIxp/5uXa8h6KMPWUJeJ6cygtHipQkSMa8EZM3d41Ff4cYSOMSF
RCVaHuXzZbT1cD7r9OkjxSVDOjR4RBh4QMf4GOM9oulJK3OjuJvXQB0+pL72kQfc
lQony8ZprLV9bfQbFTKoGebckFFtI/Cwf+WC+7BIlWrIe7Eg/4tN/x7wE2hSr9sh
05idua7WT6YMr4v51TvDzhbCKQ+uJ2puT3SuuYZrd2oAePo5RRu/h6wJVQV+kSxe
K6yAQ+2PcX0WO/A2Hp3JIpVztIkvrxcxZhviBc7G5v8OkeFeqJqcD4R7v3g2GvTx
jpeW/yuRAgMBAAECggEAA8hrO1jUD3qTjNW06ZCtWG60D2dnecLpk9ZApwtQ6PvV
768yDszq3ePwsyCnYCi64Iv3wIegn0SDoYpNcR3CjUE55zAbh/Na2GBEonEo0l6O
EXfrufBxK93TednsKl8+BsL2om6W8XnNKYYz8BUSFUIPM5WC2T15YsdnQRmzNq5x
K9RQxlAoiZFLPfSSfEUytqtggIU5Ojjkpe+imT3IP5wHG8CU3ciUhI1CExFWia9V
pxAb1ApCTYEZp/jakJfP2az7o9emU+1PkX1RxCIE2eK4fcEx+kagkXO+GrKUvNPm
4s0vp2IxQocJ9L02YEdu907eT5R6fI34NXvkjDQgQQKBgQD8adMzpIkiisksIW7A
gUBFz2wiLdFhvkzceYEJddQUtb6dc5DqAEBX17p6PWnIUJkrCllAoV2kcFoRkXRD
tHCzHraYvWqnH67HggVr0ytJg1SXqM+lrLaF//aVT4qFptYHXQXBXObjE88HTFQn
WpyKOrbUMFOnRKiGvITPnMSMeQKBgQDqC2JI32qlegFtnXvgdT+h+0Gcb47ky6P/
pr7ulGK+uukwDCChQKTIpYR9YlXkEtfgncN5W7wRsd1JkC19szS64UX/zHEy3Wvt
NTdZMP/xMhpDwV/2yR+cfjI46Fl89rRvDmwAJx0FGq1q54hczsurAskr8DUS3Icj
b42gPWyh2QKBgGH3QL2ecosxinrSTwXwJF3z72gkmEtzbKl1jxt42+Nd1qmNnQT1
LAPr+rhO9auFfK0zywhGmO2lnY+MAK/2bHdYyE3n1mke5tsQH8KFpxtVGZPzNQR8
UCsZ+T5iLMVKx278L6uovwQLQCL5AQB1LqSHvUYFq7IT98Szjmh10+MhAoGBALgF
32/BC4+1EK5pp19jkXcBoiMorEhFvltjdrkMv1+Mg5Gd14Iy295QFo6n5TUBg/A+
29XuRT/8hCw1Sy+M2qcePfXVgCQoaZYHw89DcdrqNDCWOahHl61qpH6OYt6Y9GJm
CpFML8s1oKlwB45Bo26BMEB2DKUZ9L/uFIOsCGBxAoGACRrWMdSvu0Oi9zeHsxf4
kee9tFE9RSewfj3CZmE0+MYZng8ZybXgh15QlhYwjx7qpnelDEEYHmPJr/TuehGG
irU7zcSL5oq4RA8dcahwXfmYDluT6X5fZUQPFGva496Gcc+coF0TbLff39ec/bVE
HZAND0CCxAMDO+82vKXpN6E=
-----END PRIVATE KEY-----
```

**📝 Note:** When pasting the private key in Vercel, paste it EXACTLY as shown above (with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines included). Vercel will handle the newlines automatically.

---

## ☁️ Cloudinary Configuration

```bash
CLOUDINARY_CLOUD_NAME=owxvjtwh
CLOUDINARY_API_KEY=377718628869688
CLOUDINARY_API_SECRET=EU_BQPlzwuodG5TWdVMFMqHgBQw
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=owxvjtwh
```

---

## 🔒 Security & App Configuration

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://www.ownzo.in/api
CSRF_ENABLED=true
CSRF_SECRET=3a238c59de5e8239403dca8e6b82ceff06352cf0de32237987e40e9784a58461
RATE_LIMIT_ENABLED=true
```

**⚠️ IMPORTANT:** Use your custom domain (www.ownzo.in) instead of the Vercel domain!

---

## 🤖 Trust Engine - FREE Configuration

```bash
TRUST_ENGINE_ENABLED=true
TRUST_ENGINE_MIN_PHOTOS_GENERAL=3
TRUST_ENGINE_MIN_PHOTOS_HIGH_VALUE=5
TRUST_ENGINE_HIGH_VALUE_THRESHOLD=5000
TRUST_ENGINE_AUTO_PUBLISH_THRESHOLD=80
TRUST_ENGINE_SUGGEST_IMPROVEMENTS_THRESHOLD=60
TRUST_ENGINE_REQUIRE_REVIEW_THRESHOLD=40
TRUST_ENGINE_ENABLE_PRICE_VALIDATION=true
TRUST_ENGINE_ENABLE_CATEGORY_VERIFICATION=true
```

---

## 🆓 FREE AI Services (No Cost!)

### GROQ (OpenAI Alternative - FREE & Fast)
```bash
GROQ_API_KEY=your_groq_api_key_here
```
**🔄 Get your key:** https://console.groq.com (2 minutes, no credit card)
**📝 Current key in `.env.local`** - Copy from your local file

### Hugging Face (Google Cloud Vision Alternative)
```bash
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```
**🔄 Get key:** https://huggingface.co (Free, 30,000 requests/month)
**📝 Current key in `.env.local`** - Copy from your local file

### SerpAPI (Reverse Image Search)
```bash
SERPAPI_API_KEY=your_serpapi_key_here
```
**🔄 Get key:** https://serpapi.com (Free, 100 searches/month)
**📝 Current key in `.env.local`** - Copy from your local file

### Enable AI Features
```bash
TRUST_ENGINE_ENABLE_AI_CONTENT_ANALYSIS=true
TRUST_ENGINE_ENABLE_AI_PHOTO_ANALYSIS=true
TRUST_ENGINE_ENABLE_REVERSE_IMAGE_SEARCH=true
```

---

## 🎯 Optional - Redis & Email (Leave Empty for Free Tier)

```bash
REDIS_ENABLED=false
REDIS_URL=
RESEND_API_KEY=
```

---

## ✅ Checklist After Adding Variables

- [ ] All environment variables added to Vercel
- [ ] `NEXT_PUBLIC_API_URL` updated with your actual Vercel domain
- [ ] `FIREBASE_PRIVATE_KEY` pasted correctly (with BEGIN/END lines)
- [ ] Selected **Production**, **Preview**, and **Development** for all variables
- [ ] Clicked **Save** for each variable
- [ ] Redeploy your app from Vercel dashboard

---

## 🚀 After Deployment

1. **Set Admin Role**: Go to Firebase Console → Firestore → `users` collection → Find your user → Add field `role` with value `admin`

2. **Test Admin Panel**: Visit `https://your-app.vercel.app/admin/listings`

3. **Create Test Listing**: Create a listing and it should appear in admin panel for approval if trust score < 95

---

## 🆘 Troubleshooting

**If you get Firebase errors:**
- Double-check `FIREBASE_PRIVATE_KEY` is pasted correctly with BEGIN/END lines
- Ensure all Firebase variables match your Firebase Console exactly

**If images fail to upload:**
- Verify Cloudinary credentials are correct
- Check Cloudinary dashboard for usage limits

**If AI features don't work:**
- Get new API keys from the free providers (links above)
- Ensure `TRUST_ENGINE_ENABLE_*` variables are set to `true`

**If rate limiting is too strict:**
- Set `RATE_LIMIT_ENABLED=false` temporarily
- Or increase limits in `backend/middleware/rate-limit.ts`
