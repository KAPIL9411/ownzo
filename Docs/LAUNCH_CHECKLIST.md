# 🚀 Ownzo Launch Checklist

Use this checklist to ensure everything is ready before going live.

---

## ✅ Pre-Launch (Complete Before Deployment)

### Code & Build
- [x] TypeScript: Zero errors (`npm run type-check`)
- [x] Production build: Successful (`npm run build`)
- [x] Linting: Passing (`npm run lint`)
- [x] Error pages: 404, 500, error boundary
- [x] Loading states: All pages have loading.tsx
- [x] Security headers: Configured in next.config.js
- [x] Rate limiting: Active on all APIs
- [x] Input sanitization: XSS protection enabled

### Environment Setup
- [ ] Firebase project created (production)
- [ ] Firebase Auth enabled (Google OAuth)
- [ ] Firestore database created
- [ ] Firestore security rules deployed
- [ ] Firestore indexes deployed
- [ ] Firebase Storage configured
- [ ] Cloudinary account setup
- [ ] Cloudinary upload preset created
- [ ] Resend account created (for emails)
- [ ] Domain purchased and configured

### Environment Variables (Production)
```bash
# Copy these to your hosting platform

# Firebase (Production)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=  # Use secret manager!

# Cloudinary (Production)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Resend)
RESEND_API_KEY=

# Security
CSRF_SECRET=  # Generate: openssl rand -base64 32

# App
NEXT_PUBLIC_APP_URL=https://ownzo.in
NODE_ENV=production

# Optional but Recommended
NEXT_PUBLIC_GA_ID=  # Google Analytics
SENTRY_DSN=  # Error tracking
```

### Security
- [x] Security headers configured
- [x] HTTPS enforced (via hosting)
- [x] Rate limiting enabled
- [x] Input sanitization active
- [x] CSRF protection enabled
- [ ] Firebase rules restricted to production
- [ ] API keys secured (not in code)
- [ ] Sensitive data encrypted

### Legal & Compliance
- [x] Privacy Policy page created
- [x] Terms of Service page created
- [ ] Privacy Policy reviewed by legal
- [ ] Terms reviewed by legal
- [ ] Company address added to legal pages
- [ ] Support email configured

### SEO & Analytics
- [x] Meta tags on all pages
- [x] OpenGraph tags configured
- [x] Twitter card tags added
- [x] Sitemap.xml generated
- [x] Robots.txt configured
- [x] PWA manifest added
- [ ] Google Analytics ID added
- [ ] Google Search Console setup
- [ ] Submit sitemap to Google

---

## 🧪 Testing Checklist

### Manual Testing (Critical Flows)
- [ ] **User Registration**
  - [ ] Sign up with Google
  - [ ] Email verification works
  - [ ] Profile created successfully
  
- [ ] **Authentication**
  - [ ] Login with Google
  - [ ] Logout works
  - [ ] Session persists correctly
  - [ ] Protected routes redirect to login
  
- [ ] **Create Listing**
  - [ ] All 4 steps work
  - [ ] Image upload successful
  - [ ] Video upload successful (if added)
  - [ ] Listing appears in feed
  
- [ ] **Browse & Search**
  - [ ] Homepage loads correctly
  - [ ] Search works with results
  - [ ] Filters work (price, category, location)
  - [ ] Pagination works
  
- [ ] **Messaging**
  - [ ] Start chat from listing
  - [ ] Send messages
  - [ ] Receive messages
  - [ ] Real-time updates work
  
- [ ] **Offers**
  - [ ] Make offer on listing
  - [ ] Seller receives notification
  - [ ] Accept/reject offer works
  - [ ] Counter offer works
  
- [ ] **Buy Requests**
  - [ ] Create buy request
  - [ ] Edit buy request
  - [ ] Delete buy request
  - [ ] Respond to buy request
  
- [ ] **Community**
  - [ ] View communities
  - [ ] Join community (request)
  - [ ] Admin approve request
  - [ ] View community members
  
- [ ] **Profile & Reviews**
  - [ ] View own profile
  - [ ] Edit profile
  - [ ] View other user's profile
  - [ ] Leave review
  - [ ] View reviews
  
- [ ] **Product Passport**
  - [ ] Create passport
  - [ ] Add service record
  - [ ] View as buyer
  
- [ ] **Analytics**
  - [ ] View listing analytics
  - [ ] Chart renders correctly

### Cross-Browser Testing
- [ ] Chrome (Desktop)
- [ ] Safari (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (iOS)
- [ ] Chrome (Android)

### Mobile Responsiveness
- [ ] Homepage mobile-friendly
- [ ] Listing detail responsive
- [ ] Create listing on mobile
- [ ] Chat on mobile
- [ ] Search on mobile
- [ ] Navigation works on mobile

### Performance Testing
- [ ] Homepage loads < 3 seconds
- [ ] Listing detail loads < 2 seconds
- [ ] Images optimized
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth scrolling

---

## 🌐 Deployment Steps

### 1. Choose Hosting Platform
- [ ] **Option A: Vercel** (Recommended for MVP)
  - [ ] Connect GitHub repo
  - [ ] Configure environment variables
  - [ ] Set production domain
  - [ ] Deploy
  
- [ ] **Option B: AWS/VPS**
  - [ ] Provision server
  - [ ] Setup Node.js environment
  - [ ] Configure Nginx/Apache
  - [ ] Setup SSL certificate
  - [ ] Deploy code
  - [ ] Configure PM2/systemd

### 2. DNS Configuration
- [ ] Add A records for domain
- [ ] Add CNAME for www
- [ ] Verify DNS propagation
- [ ] Test domain access

### 3. SSL Certificate
- [ ] Install SSL certificate
- [ ] Force HTTPS redirect
- [ ] Test HTTPS access
- [ ] Verify SSL rating (A+ on ssllabs.com)

### 4. Post-Deployment Verification
- [ ] Health check passes: `curl https://ownzo.in/api/health`
- [ ] All pages load correctly
- [ ] No 404s in browser console
- [ ] Firebase connection working
- [ ] Cloudinary uploads working
- [ ] Email notifications sending

---

## 📊 Monitoring Setup

### Error Tracking
- [ ] **Sentry** (Recommended)
  - [ ] Create Sentry project
  - [ ] Add SENTRY_DSN to env
  - [ ] Test error reporting
  - [ ] Configure alerts
  
### Analytics
- [ ] **Google Analytics**
  - [ ] Create GA4 property
  - [ ] Add tracking ID to env
  - [ ] Verify tracking working
  - [ ] Setup key events

### Uptime Monitoring
- [ ] **UptimeRobot** (Free option)
  - [ ] Add website monitor
  - [ ] Configure email alerts
  - [ ] Set check interval (5 min)

### Performance Monitoring
- [ ] Google PageSpeed Insights baseline
- [ ] Setup performance budget
- [ ] Monitor Core Web Vitals

---

## 🎯 Launch Day Tasks

### Morning (T-0)
- [ ] Final production build
- [ ] Deploy to production
- [ ] Run smoke tests (all critical flows)
- [ ] Verify monitoring is active
- [ ] Verify error tracking works
- [ ] Check all environment variables

### Launch
- [ ] Announce on social media
- [ ] Send launch email (if applicable)
- [ ] Post on ProductHunt
- [ ] Share in relevant communities
- [ ] Monitor error logs actively

### Evening (T+8 hours)
- [ ] Check analytics (user signups)
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Respond to user feedback
- [ ] Fix critical bugs if any

---

## 🛠️ Post-Launch (First Week)

### Day 1-3
- [ ] Monitor error rates daily
- [ ] Check user feedback
- [ ] Fix critical bugs
- [ ] Respond to support emails
- [ ] Track key metrics (signups, listings)

### Day 4-7
- [ ] Analyze user behavior
- [ ] Identify drop-off points
- [ ] Plan quick wins/fixes
- [ ] Setup automated backups
- [ ] Document any issues

### Week 2
- [ ] Review analytics
- [ ] Plan iteration 1 features
- [ ] Optimize based on data
- [ ] Gather user testimonials

---

## 🚨 Emergency Contacts

```
Technical Issues:
- Developer: [Your Email]
- Hosting: [Hosting Support]

Service Outages:
- Firebase: https://status.firebase.google.com
- Cloudinary: https://status.cloudinary.com
- Vercel: https://www.vercel-status.com

Domain/DNS:
- Registrar: [Domain Provider]
- DNS: [DNS Provider]
```

---

## 📈 Success Metrics (Week 1)

### Target Goals
- [ ] 100+ user signups
- [ ] 50+ listings created
- [ ] 20+ transactions initiated
- [ ] < 1% error rate
- [ ] < 3s average page load
- [ ] > 50% mobile traffic
- [ ] < 24hr support response time

### Track Daily
- New users
- New listings
- Messages sent
- Offers made
- Page views
- Error rate
- Performance score

---

## 🎉 You're Ready!

Once all critical items are checked off, you're ready to launch!

**Good luck with your launch! 🚀**

For issues, check:
1. [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
2. [README.md](./README.md) - General documentation
3. [Docs/](./Docs/) - Detailed documentation

**Support**: support@ownzo.in
