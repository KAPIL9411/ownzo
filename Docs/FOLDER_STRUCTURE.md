# Ownzo - Complete Folder Structure

## Final Project Structure (As Per TRD)

```
ownzo/
│
├── frontend/                    # 🎨 FRONTEND LAYER
│   │
│   ├── components/             # React UI Components
│   │   ├── ui/                 # shadcn/ui reusable components
│   │   │   ├── button.tsx      # Button component
│   │   │   ├── card.tsx        # Card component
│   │   │   ├── badge.tsx       # Badge component
│   │   │   └── input.tsx       # Input component
│   │   │
│   │   └── layout/             # Layout components
│   │       └── Header.tsx      # Application header with nav
│   │
│   ├── services/               # Frontend API Services
│   │   ├── api.service.ts      # Base HTTP client (Axios with interceptors)
│   │   ├── auth.service.ts     # Authentication API calls
│   │   ├── listing.service.ts  # Listings CRUD operations
│   │   ├── category.service.ts # Categories operations
│   │   ├── review.service.ts   # Reviews operations
│   │   ├── offer.service.ts    # Offers operations
│   │   ├── wishlist.service.ts # Wishlist operations
│   │   ├── chat.service.ts     # Chat operations
│   │   ├── notification.service.ts # Notifications
│   │   ├── buyrequest.service.ts   # Buy requests
│   │   └── community.service.ts    # Communities
│   │
│   ├── store/                  # Global State Management (Zustand)
│   │   ├── auth.store.ts       # Authentication state
│   │   └── ui.store.ts         # UI state (modals, menus)
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   └── useAuth.ts          # Authentication hook
│   │
│   └── lib/                    # Frontend Utilities
│       ├── firebase/           # Firebase Client SDK
│       │   └── config.ts       # Firebase initialization
│       ├── utils.ts            # Helper functions
│       └── react-query.tsx     # React Query provider
│
├── backend/                    # 🔧 BACKEND LAYER
│   │
│   ├── repositories/           # Data Access Layer (Firestore)
│   │   ├── user.repository.ts          # User CRUD operations
│   │   ├── listing.repository.ts       # Listing CRUD operations
│   │   ├── category.repository.ts      # Category operations
│   │   ├── review.repository.ts        # Review operations
│   │   ├── wishlist.repository.ts      # Wishlist operations
│   │   ├── offer.repository.ts         # Offer operations
│   │   ├── chat.repository.ts          # Chat operations
│   │   ├── notification.repository.ts  # Notification operations
│   │   ├── buyrequest.repository.ts    # Buy request operations
│   │   └── community.repository.ts     # Community operations
│   │
│   ├── middleware/             # API Middleware
│   │   ├── auth.ts             # JWT token verification
│   │   ├── validators.ts       # Zod validation schemas
│   │   └── error-handler.ts    # Centralized error handling
│   │
│   └── lib/                    # Backend Utilities
│       ├── firebase-admin/     # Firebase Admin SDK
│       │   ├── config.ts       # Admin SDK initialization
│       │   └── auth.ts         # Token verification utilities
│       │
│       └── cloudinary/         # Cloudinary Integration
│           ├── config.ts       # Cloudinary setup
│           └── upload.ts       # Upload utilities
│
├── shared/                     # 📦 SHARED LAYER
│   └── types/                  # TypeScript Type Definitions
│       └── index.ts            # All interfaces (User, Listing, etc.)
│
├── app/                        # 🚀 NEXT.JS APP ROUTER
│   │
│   ├── api/                    # Backend REST API Endpoints
│   │   │
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── login/route.ts       # POST /api/auth/login
│   │   │   ├── logout/route.ts      # POST /api/auth/logout
│   │   │   └── profile/route.ts     # GET /api/auth/profile
│   │   │
│   │   ├── users/              # User management endpoints
│   │   │   ├── [id]/route.ts        # GET /api/users/:id
│   │   │   └── profile/route.ts     # GET, PATCH /api/users/profile
│   │   │
│   │   ├── listings/           # Listing endpoints
│   │   │   ├── [id]/route.ts        # GET, PATCH, DELETE /api/listings/:id
│   │   │   ├── my/route.ts          # GET /api/listings/my
│   │   │   └── route.ts             # GET, POST /api/listings
│   │   │
│   │   ├── categories/         # Category endpoints
│   │   │   └── route.ts             # GET /api/categories
│   │   │
│   │   ├── search/             # Search endpoint
│   │   │   └── route.ts             # GET /api/search
│   │   │
│   │   ├── offers/             # Offer endpoints
│   │   │   ├── [id]/route.ts        # PATCH /api/offers/:id
│   │   │   └── route.ts             # GET, POST /api/offers
│   │   │
│   │   ├── reviews/            # Review endpoints
│   │   │   └── route.ts             # GET, POST /api/reviews
│   │   │
│   │   ├── wishlist/           # Wishlist endpoints
│   │   │   └── route.ts             # GET, POST, DELETE /api/wishlist
│   │   │
│   │   ├── chat/               # Chat endpoints
│   │   │   └── route.ts             # GET, POST /api/chat
│   │   │
│   │   ├── messages/           # Message endpoints
│   │   │   └── route.ts             # GET, POST /api/messages
│   │   │
│   │   ├── buy-request/        # Buy request endpoints
│   │   │   ├── [id]/route.ts        # PATCH, DELETE /api/buy-request/:id
│   │   │   └── route.ts             # GET, POST /api/buy-request
│   │   │
│   │   ├── community/          # Community endpoints
│   │   │   └── route.ts             # GET /api/community
│   │   │
│   │   ├── notifications/      # Notification endpoints
│   │   │   └── route.ts             # GET, PATCH /api/notifications
│   │   │
│   │   └── upload/             # File upload endpoint
│   │       └── route.ts             # POST /api/upload
│   │
│   ├── (auth)/                 # Authentication Pages
│   │   └── login/
│   │       └── page.tsx             # Login page
│   │
│   ├── (main)/                 # Main Application Pages (Protected)
│   │   ├── layout.tsx               # Main layout with header
│   │   ├── page.tsx                 # Home page
│   │   │
│   │   ├── listings/
│   │   │   ├── [id]/page.tsx        # Listing detail page
│   │   │   └── create/page.tsx      # Create listing page
│   │   │
│   │   ├── buy-requests/
│   │   │   └── page.tsx             # Buy requests page
│   │   │
│   │   ├── chat/
│   │   │   └── page.tsx             # Chat page
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx             # User profile page
│   │   │
│   │   ├── wishlist/
│   │   │   └── page.tsx             # Wishlist page
│   │   │
│   │   └── notifications/
│   │       └── page.tsx             # Notifications page
│   │
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global CSS styles
│
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.js              # Next.js configuration
├── postcss.config.js           # PostCSS configuration
├── .gitignore                  # Git ignore rules
├── .env.example                # Environment variables template
├── vercel.json                 # Vercel deployment config
│
├── README.md                   # Getting started guide
├── DEPLOYMENT.md               # Deployment instructions
├── ARCHITECTURE.md             # Architecture documentation
├── PROJECT_SUMMARY.md          # Complete project summary
└── FOLDER_STRUCTURE.md         # This file
```

## File Count by Layer

- **Frontend**: 29 files
  - Components: 5
  - Services: 10
  - Store: 2
  - Hooks: 1
  - Lib: 3
  - Pages: 8

- **Backend**: 28 files
  - API Routes: 13
  - Repositories: 10
  - Middleware: 3
  - Lib: 2

- **Shared**: 1 file
  - Types: 1

- **Total Code Files**: 76+

## Key Benefits of This Structure

### 1. Clear Separation
- Frontend code in `frontend/`
- Backend code in `backend/`
- Shared code in `shared/`

### 2. Mobile Ready
- All backend logic in API routes
- Frontend services can be reused by React Native
- No business logic in frontend

### 3. Type Safety
- Shared types in `shared/types/`
- Used by both frontend and backend
- Compile-time type checking

### 4. Scalability
- Easy to add new features
- Each layer independent
- Can split into microservices later

### 5. Maintainability
- Clear file organization
- Easy to find code
- Consistent naming conventions

## Import Path Examples

### Frontend importing shared types
```typescript
import { User, Listing } from '@/shared/types'
```

### Frontend importing components
```typescript
import { Button } from '@/frontend/components/ui/button'
```

### Frontend importing services
```typescript
import { ListingService } from '@/frontend/services/listing.service'
```

### Backend importing repositories
```typescript
import { listingRepository } from '@/backend/repositories/listing.repository'
```

### Backend importing middleware
```typescript
import { requireAuth } from '@/backend/middleware/auth'
```

### API route importing both
```typescript
import { Listing } from '@/shared/types'
import { listingRepository } from '@/backend/repositories/listing.repository'
```

## Environment Variable Organization

### Frontend (Public - prefixed with NEXT_PUBLIC_)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```

### Backend (Private - no prefix)
```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
CLOUDINARY_API_SECRET
```

## Naming Conventions

### Files
- Components: PascalCase (e.g., `Header.tsx`)
- Services: camelCase with suffix (e.g., `listing.service.ts`)
- Repositories: camelCase with suffix (e.g., `user.repository.ts`)
- Middleware: kebab-case (e.g., `error-handler.ts`)
- Types: camelCase (e.g., `index.ts`)

### Folders
- Frontend folders: lowercase (e.g., `services/`, `components/`)
- Backend folders: lowercase (e.g., `repositories/`, `middleware/`)
- Next.js routes: kebab-case (e.g., `buy-request/`)

### Code
- Classes: PascalCase (e.g., `ListingService`)
- Functions: camelCase (e.g., `createListing`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_URL`)
- Interfaces: PascalCase (e.g., `User`, `Listing`)

## Migration Notes

This structure was reorganized from the initial flat structure to follow the TRD specification:

**Before:**
```
ownzo/
├── components/
├── services/
├── store/
├── hooks/
├── lib/
├── types/
├── repositories/
└── middleware/
```

**After:**
```
ownzo/
├── frontend/
│   ├── components/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   └── lib/
├── backend/
│   ├── repositories/
│   ├── middleware/
│   └── lib/
└── shared/
    └── types/
```

All imports were automatically updated using the `smart_relocate` tool to maintain functionality while improving organization.

## Conclusion

This folder structure provides:
- ✅ Clear separation of concerns
- ✅ Follows TRD specifications exactly
- ✅ Mobile-ready architecture
- ✅ Type safety across layers
- ✅ Easy to navigate and maintain
- ✅ Scalable for future growth

Perfect for a production-ready marketplace platform! 🚀
