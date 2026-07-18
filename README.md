# 🎓 Ownzo - Your Campus Marketplace

A hyperlocal marketplace platform built for college communities. Buy, sell, and trade with your classmates safely and easily.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Features

### Core Marketplace
- 🛍️ **Buy & Sell Listings** - Create, browse, and manage product listings
- 💬 **Real-time Chat** - In-app messaging between buyers and sellers
- 💰 **Make Offers** - Negotiate prices with offer/counter-offer system
- 📦 **Buy Requests** - Post what you're looking for, let sellers come to you
- ⭐ **Reviews & Ratings** - Build trust through user reviews
- 🔍 **Smart Search** - Find exactly what you need with filters

### Trust & Safety
- ✅ **Email Verification** - Verified student accounts
- 🏘️ **Community-Based** - Join your campus community
- 🛡️ **Trust Scores** - Reputation system based on transactions
- 🚩 **Report System** - Flag inappropriate content
- 🔒 **Secure Authentication** - Google OAuth integration

### Advanced Features
- 📊 **Seller Analytics** - Track views, saves, and engagement
- 📜 **Product Passport** - Ownership history and warranties
- 📧 **Email Notifications** - Stay updated on offers and messages
- 📹 **Video Support** - Add product videos to listings
- 💸 **Negotiable Pricing** - Enable price negotiations
- 📍 **Location-Based** - Find items near your campus

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Firebase account
- Cloudinary account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ownzo.git
cd ownzo

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Required Environment Variables

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Resend)
RESEND_API_KEY=

# Security
CSRF_SECRET=
```

See `.env.local.example` for complete list.

---

## 📁 Project Structure

```
ownzo/
├── app/                      # Next.js 15 app directory
│   ├── (main)/              # Main app pages
│   │   ├── listings/        # Listing pages
│   │   ├── buy-requests/    # Buy request pages
│   │   ├── chat/            # Messaging
│   │   ├── community/       # Community features
│   │   └── profile/         # User profiles
│   ├── (auth)/              # Auth pages
│   ├── admin/               # Admin dashboard
│   └── api/                 # API routes
├── backend/                 # Backend logic
│   ├── lib/                 # Firebase, email, utils
│   ├── middleware/          # Auth, rate-limit, sanitize
│   ├── models/              # Type definitions
│   └── repositories/        # Data access layer
├── frontend/                # Frontend components
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API service layer
│   └── lib/                 # Utilities
├── shared/                  # Shared types & constants
└── public/                  # Static assets
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Maps**: Leaflet

### Backend
- **Runtime**: Node.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Cloudinary
- **Email**: Resend
- **File Upload**: Cloudinary Widget

### Infrastructure
- **Hosting**: Vercel / AWS
- **CDN**: Cloudflare
- **Monitoring**: Sentry (optional)
- **Analytics**: Google Analytics (optional)

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript check

# Testing
npm test             # Run tests (when added)
```

---

## 🔐 Security Features

- **Rate Limiting** - Prevent abuse and DDoS
- **Input Sanitization** - XSS protection
- **CSRF Protection** - Secure forms
- **Security Headers** - CSP, HSTS, X-Frame-Options
- **Authentication** - Secure JWT-based auth
- **Data Encryption** - Sensitive data encrypted
- **Content Moderation** - Report & flag system

---

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - How to deploy to production
- [Architecture Overview](./Docs/ARCHITECTURE.md) - System design
- [Setup Guide](./Docs/QUICKSTART.md) - Detailed setup

---

## 🚢 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ownzo)

### Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

- Email: support@ownzo.in
- Issues: [GitHub Issues](https://github.com/yourusername/ownzo/issues)

---

## 🗺️ Roadmap

- [x] Core marketplace functionality
- [x] Real-time chat
- [x] Offer system
- [x] Product passport
- [x] Email notifications
- [x] Analytics dashboard
- [ ] Mobile apps (iOS/Android)
- [ ] Payment integration
- [ ] Shipping integration
- [ ] Advanced search (Algolia)

---

**⭐ Star this repo if you find it useful!**
