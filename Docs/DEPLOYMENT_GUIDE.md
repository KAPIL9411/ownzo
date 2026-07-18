# Deployment Guide - Ownzo Marketplace

This guide covers deploying the Ownzo marketplace application to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [CI/CD Setup](#cicd-setup)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Accounts
- [x] Firebase account (with Blaze plan for production)
- [x] Vercel account (Pro plan recommended)
- [x] Cloudinary account
- [x] GitHub account
- [ ] Sentry account (optional but recommended)
- [ ] Slack workspace (for notifications)

### Required Tools
```bash
# Node.js 20+
node --version  # Should be v20.x.x

# npm or yarn
npm --version

# Firebase CLI
npm install -g firebase-tools
firebase --version

# Vercel CLI (optional)
npm install -g vercel
```

---

## Environment Setup

### 1. Create Firebase Projects

Create three Firebase projects (recommended):
- `ownzo-dev` - Development
- `ownzo-staging` - Staging
- `ownzo-prod` - Production

For each project:
1. Enable Authentication (Google, Email/Password)
2. Create Firestore database
3. Set up Storage with CORS rules
4. Generate service account key (Settings > Service Accounts)

### 2. Configure Environment Variables

#### Development (.env.local)
```bash
cp .env.local.example .env.local
# Fill in development values
```

#### Production (Vercel Environment Variables)
Add these in Vercel Dashboard > Project > Settings > Environment Variables:

**Firebase (Production)**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (use Vercel's encrypted secrets)

**Cloudinary**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**Security**
- `CSRF_SECRET` (generate: `openssl rand -base64 32`)
- `SESSION_SECRET` (generate: `openssl rand -base64 32`)

**Monitoring**
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

---

## Firebase Configuration

### 1. Deploy Firestore Indexes

```bash
# Login to Firebase
firebase login

# Select your production project
firebase use ownzo-prod

# Deploy indexes (required before first deployment)
firebase deploy --only firestore:indexes

# This will take 15-30 minutes for composite indexes to build
```

### 2. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Configure Storage CORS

Create `cors.json`:
```json
[
  {
    "origin": ["https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS:
```bash
gsutil cors set cors.json gs://ownzo-prod.appspot.com
```

### 4. Set up Firebase Authentication

1. Enable Google Sign-In
2. Add authorized domains (your-domain.com)
3. Configure OAuth consent screen
4. Set up email templates

---

## Vercel Deployment

### 1. Connect Repository

1. Go to Vercel Dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select framework: Next.js

### 2. Configure Build Settings

**Framework Preset:** Next.js  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm ci`  
**Node Version:** 20.x

### 3. Environment Variables

Add all environment variables from the previous section.

**Important:** For `FIREBASE_PRIVATE_KEY`, replace `\n` with actual newlines:
```bash
# Use Vercel CLI to add (preserves newlines)
vercel env add FIREBASE_PRIVATE_KEY production
# Paste the entire private key including -----BEGIN/END-----
```

### 4. Deploy

#### Option A: Automatic (via GitHub)
```bash
git push origin main
# Vercel will auto-deploy
```

#### Option B: Manual (via CLI)
```bash
vercel --prod
```

---

## CI/CD Setup

### 1. GitHub Secrets Configuration

Go to GitHub > Repository > Settings > Secrets and add:

**Firebase**
- `FIREBASE_TOKEN` (get via `firebase login:ci`)
- `STAGING_FIREBASE_PROJECT_ID`
- `PROD_FIREBASE_PROJECT_ID`

**Vercel**
- `VERCEL_TOKEN` (from Vercel Account Settings)
- `VERCEL_ORG_ID` (from Vercel project settings)
- `VERCEL_PROJECT_ID` (from Vercel project settings)

**Staging Environment Variables**
- All `STAGING_*` prefixed variables

**Production Environment Variables**
- All `PROD_*` prefixed variables

**Monitoring**
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SLACK_WEBHOOK` (for deployment notifications)

**Optional**
- `CODECOV_TOKEN` (for code coverage)
- `SNYK_TOKEN` (for security scanning)

### 2. Branch Strategy

- `main` - Production (auto-deploy on merge)
- `develop` - Staging (auto-deploy on merge)
- `feature/*` - Feature branches (run CI only)

### 3. Workflow Overview

**CI Pipeline** (runs on all PRs)
- Linting
- Type checking
- Unit tests
- Build verification
- Security scanning

**Staging Deployment** (on push to develop)
- Run tests
- Build application
- Deploy Firestore rules/indexes
- Deploy to Vercel staging
- Run smoke tests
- Notify on Slack

**Production Deployment** (on push to main)
- Run all tests
- Security audit
- Build application
- Create backup tag
- Deploy Firestore rules/indexes
- Deploy to Vercel production
- Run health checks
- Create Sentry release
- Notify on Slack

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health endpoint
curl https://your-domain.com/api/health

# Check detailed health (requires auth)
curl https://your-domain.com/api/health/detailed \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test key endpoints
curl https://your-domain.com/api/categories
curl https://your-domain.com/api/listings?limit=5
```

### 2. Monitor Firestore Indexes

```bash
# Check index status
firebase firestore:indexes --project ownzo-prod

# Should show all indexes as "READY"
# If "CREATING", wait 15-30 minutes
```

### 3. Set up Custom Domain

1. Vercel Dashboard > Project > Settings > Domains
2. Add your domain
3. Configure DNS records:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```
4. Wait for SSL certificate (automatic)

### 4. Configure Rate Limiting (Redis)

For production with multiple instances:

```bash
# Deploy Redis (e.g., on Railway, Upstash, or Redis Cloud)
# Add REDIS_URL to Vercel environment variables
# Set REDIS_ENABLED=true
```

---

## Monitoring & Maintenance

### 1. Set up Monitoring

**Vercel Analytics**
- Automatically enabled
- View in Vercel Dashboard

**Sentry Error Tracking**
```bash
# Already configured via environment variables
# View errors at sentry.io
```

**Uptime Monitoring**
- Use UptimeRobot or Pingdom
- Monitor: `/api/health` endpoint
- Alert on: Status code != 200

### 2. Set up Alerts

**Slack Notifications**
- Deployment success/failure
- Error rate spikes (Sentry)
- Downtime alerts (UptimeRobot)

**Email Alerts**
- Vercel deployment failures
- Firebase quota warnings
- Cloudinary usage alerts

### 3. Regular Maintenance

**Weekly:**
- Review error logs (Sentry)
- Check database performance
- Monitor API latency

**Monthly:**
- Review and rotate secrets
- Update dependencies
- Run security audit
- Clean up orphaned data

**Quarterly:**
- Review Firebase costs
- Optimize database indexes
- Performance audit
- Security review

---

## Rollback Procedures

### Immediate Rollback (Vercel)

```bash
# Via Vercel Dashboard
1. Go to Deployments
2. Find last stable deployment
3. Click "..." > "Promote to Production"

# Via CLI
vercel rollback
```

### Rollback Firestore Rules

```bash
# List previous versions
firebase firestore:rules:list --project ownzo-prod

# Rollback to specific version
firebase firestore:rules:release <ruleset-id> --project ownzo-prod
```

### Rollback with Git

```bash
# Create hotfix from backup tag
git checkout backup-YYYYMMDD-HHMMSS
git checkout -b hotfix/rollback
git push origin hotfix/rollback

# Merge to main (triggers deployment)
```

### Emergency Procedures

**If application is down:**
1. Check Vercel status (status.vercel.com)
2. Check Firebase status (status.firebase.google.com)
3. Review recent deployments
4. Rollback to last known good deployment
5. Check error logs in Sentry
6. Investigate and fix issue
7. Deploy fix

**If database is corrupted:**
1. Use Firebase automatic backups
2. Export backup: `firebase firestore:export gs://backup-bucket`
3. Restore: `firebase firestore:import gs://backup-bucket`

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security audit clean
- [ ] Environment variables configured
- [ ] Firestore indexes deployed
- [ ] Firestore rules deployed
- [ ] Database backup created
- [ ] Monitoring configured
- [ ] Alert channels tested

### Post-Deployment
- [ ] Health check passing
- [ ] Key endpoints working
- [ ] Authentication working
- [ ] File uploads working
- [ ] Database queries performing well
- [ ] No console errors
- [ ] Sentry receiving events
- [ ] Analytics tracking
- [ ] Team notified

---

## Troubleshooting

### Build Failures

**Error: Environment variable missing**
```bash
# Check all required env vars are set in Vercel
vercel env ls
```

**Error: TypeScript compilation failed**
```bash
# Run locally to see errors
npm run build
npx tsc --noEmit
```

### Runtime Errors

**Error: Firebase permission denied**
- Check Firestore rules are deployed
- Verify user has correct authentication

**Error: Rate limit exceeded**
- Review rate limiting configuration
- Consider implementing Redis

**Error: CSRF token invalid**
- Check CSRF_SECRET is consistent across instances
- Clear browser cookies and retry

### Performance Issues

**Slow queries**
- Verify Firestore indexes are built
- Check index status: `firebase firestore:indexes`

**High latency**
- Enable Vercel Edge Functions
- Implement Redis caching
- Review database queries

---

## Support

For issues or questions:
- Create GitHub issue
- Contact: support@ownzo.com
- Slack: #engineering channel

---

**Last Updated:** 2026-07-18  
**Version:** 1.0.0
