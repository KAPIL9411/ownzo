# 🚀 Ownzo Deployment Guide

Complete guide to deploy Ownzo to production.

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Ensure these are set in your hosting platform:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=  # Use secret manager!

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
RESEND_API_KEY=

# Security
CSRF_SECRET=  # Generate: openssl rand -base64 32

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Optional
NEXT_PUBLIC_GA_ID=  # Google Analytics
SENTRY_DSN=  # Error tracking
```

### 2. Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (if not done)
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

### 3. Domain & DNS

```
Add these DNS records:

A     @         your-server-ip
A     www       your-server-ip
CNAME *         your-domain.com
```

---

## 🌐 Deployment Options

### Option A: Vercel (Recommended)

**Why Vercel:**
- Optimized for Next.js
- Automatic deployments
- Edge functions
- Free SSL
- CDN included

**Steps:**

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel

# Production
vercel --prod
```

4. **Set Environment Variables**
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# ... add all others
```

5. **Configure Domain**
```bash
vercel domains add your-domain.com
```

**vercel.json** (optional):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["bom1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

### Option B: AWS (EC2 + S3)

**Architecture:**
- EC2: Run Next.js server
- S3: Store static assets
- CloudFront: CDN
- Route 53: DNS
- RDS: (Optional) Database

**Steps:**

1. **Launch EC2 Instance**
```bash
# t3.medium recommended
# Ubuntu 22.04 LTS
# Open ports: 22, 80, 443
```

2. **Setup Server**
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

3. **Clone & Build**
```bash
cd /var/www
sudo git clone https://github.com/your-repo/ownzo.git
cd ownzo

# Copy .env
sudo nano .env.production.local
# Paste all environment variables

# Install dependencies
sudo npm ci

# Build
sudo npm run build
```

4. **Setup PM2**
```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ownzo',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ownzo',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}

# Start
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

5. **Configure Nginx**
```nginx
# /etc/nginx/sites-available/ownzo
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ownzo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Setup SSL with Certbot**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

### Option C: Firebase Hosting + Cloud Run

**Steps:**

1. **Build for production**
```bash
npm run build
```

2. **Dockerize** (Dockerfile):
```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

3. **Deploy to Cloud Run**
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/ownzo
gcloud run deploy ownzo \
  --image gcr.io/PROJECT-ID/ownzo \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## 🔍 Post-Deployment

### 1. Verify Deployment

```bash
# Check health
curl https://your-domain.com/api/health

# Should return:
# {"status":"healthy","timestamp":"..."}

# Test critical flows
1. Create account ✓
2. Login ✓
3. Create listing ✓
4. Upload image ✓
5. Send message ✓
6. Make offer ✓
```

### 2. Setup Monitoring

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs

# sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

**Google Analytics:**
```typescript
// Already added in app/layout.tsx
// Just set NEXT_PUBLIC_GA_ID in env
```

### 3. Setup Backups

**Firestore:**
```bash
# Automated daily backups
gcloud firestore export gs://your-backup-bucket \
  --collection-ids=users,listings,chats

# Schedule with Cloud Scheduler
```

**Code:**
```bash
# GitHub Actions backup
git push origin main --force
```

---

## 🛠️ CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run type-check
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... add all secrets
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 Performance Optimization

### 1. Enable Caching
```nginx
# Nginx cache static assets
location /_next/static {
    alias /var/www/ownzo/.next/static;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Enable Compression
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

### 3. CDN Setup
```bash
# Cloudflare (Free):
1. Add site to Cloudflare
2. Update nameservers
3. Enable Auto Minify
4. Enable Brotli
5. Set caching rules
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working
```bash
# Vercel: Redeploy after adding
vercel --prod

# EC2: Restart PM2
pm2 restart all
```

### Firebase Connection Issues
```bash
# Check firestore rules
firebase firestore:rules:get

# Verify service account
cat serviceAccount.json
```

### 502 Bad Gateway
```bash
# Check PM2 status
pm2 status
pm2 logs

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

---

## 🔒 Security Checklist

- [x] HTTPS enabled
- [x] Security headers configured
- [x] Rate limiting active
- [x] Input sanitization enabled
- [x] CSRF protection enabled
- [x] Environment variables secured
- [x] Database rules configured
- [x] Firestore indexes optimized
- [x] Error logging setup
- [x] Backups automated

---

## 📈 Scaling Strategy

### Phase 1: 0-1000 users
- Single EC2 t3.medium OR Vercel Hobby
- Firebase free tier
- Cloudinary free tier

### Phase 2: 1000-10,000 users
- Scale to t3.large or multiple instances
- Firebase Blaze plan
- Cloudinary paid plan
- Add Redis for caching

### Phase 3: 10,000+ users
- Load balancer
- Multiple app servers
- Read replicas
- CDN optimization
- Microservices architecture

---

## ✅ Launch Day Checklist

**T-1 Day:**
- [ ] All tests passing
- [ ] Production build successful
- [ ] Environment variables set
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Backups scheduled
- [ ] Support email active

**Launch Day:**
- [ ] Deploy to production
- [ ] Smoke test all features
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Announce launch
- [ ] Monitor user feedback

**T+1 Day:**
- [ ] Review analytics
- [ ] Check error rates
- [ ] Verify backups
- [ ] Plan iterations

---

## 📞 Support

If you encounter issues:
1. Check logs: `pm2 logs` or Vercel dashboard
2. Verify environment variables
3. Check Firebase console
4. Review error tracking (Sentry)
5. Contact: devops@ownzo.in

---

**You're ready to launch! 🚀**
