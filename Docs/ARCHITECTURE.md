# Ownzo - Architecture Documentation

## Overview

Ownzo follows a clean architecture pattern that separates frontend and backend concerns, making it **mobile-ready from day one**.

## Folder Structure (Improved)

```
ownzo/
├── frontend/              # 🎨 Frontend Layer
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components (Button, Card, Input, etc.)
│   │   └── layout/      # Layout components (Header, Footer, etc.)
│   ├── services/        # API client services (talk to backend)
│   │   ├── api.service.ts         # Base HTTP client with interceptors
│   │   ├── auth.service.ts        # Authentication
│   │   ├── listing.service.ts     # Listings CRUD
│   │   ├── category.service.ts    # Categories
│   │   ├── chat.service.ts        # Chat & messaging
│   │   ├── offer.service.ts       # Offers
│   │   ├── review.service.ts      # Reviews
│   │   ├── wishlist.service.ts    # Wishlist
│   │   ├── notification.service.ts # Notifications
│   │   ├── buyrequest.service.ts  # Buy requests
│   │   └── community.service.ts   # Communities
│   ├── store/           # Global state management (Zustand)
│   │   ├── auth.store.ts          # Authentication state
│   │   └── ui.store.ts            # UI state (modals, menus, etc.)
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.ts             # Auth hook with Firebase integration
│   └── lib/             # Frontend utilities
│       ├── firebase/    # Firebase client configuration
│       │   └── config.ts
│       ├── utils.ts     # Helper functions (formatting, etc.)
│       └── react-query.tsx        # React Query provider
│
├── backend/              # 🔧 Backend Layer
│   ├── repositories/    # Data access layer (talks to Firestore)
│   │   ├── user.repository.ts
│   │   ├── listing.repository.ts
│   │   ├── category.repository.ts
│   │   ├── review.repository.ts
│   │   ├── wishlist.repository.ts
│   │   ├── offer.repository.ts
│   │   ├── chat.repository.ts
│   │   ├── notification.repository.ts
│   │   ├── buyrequest.repository.ts
│   │   └── community.repository.ts
│   ├── middleware/      # API middleware
│   │   ├── auth.ts              # JWT verification
│   │   ├── validators.ts        # Zod validation schemas
│   │   └── error-handler.ts     # Error handling
│   └── lib/             # Backend utilities
│       ├── firebase-admin/      # Firebase Admin SDK
│       │   ├── config.ts        # Admin initialization
│       │   └── auth.ts          # Token verification
│       └── cloudinary/          # Cloudinary integration
│           ├── config.ts        # Cloudinary setup
│           └── upload.ts        # Upload utilities
│
├── shared/              # 📦 Shared Layer
│   └── types/          # TypeScript types used by both frontend & backend
│       └── index.ts    # All interfaces (User, Listing, etc.)
│
├── app/                 # 🚀 Next.js App Router
│   ├── api/            # REST API endpoints (backend routes)
│   │   ├── auth/       # Authentication endpoints
│   │   ├── users/      # User management
│   │   ├── listings/   # Listings CRUD
│   │   ├── categories/ # Categories
│   │   ├── chat/       # Chat creation
│   │   ├── messages/   # Messaging
│   │   ├── offers/     # Offers
│   │   ├── reviews/    # Reviews
│   │   ├── wishlist/   # Wishlist
│   │   ├── buy-request/ # Buy requests
│   │   ├── community/  # Communities
│   │   ├── notifications/ # Notifications
│   │   ├── search/     # Search
│   │   └── upload/     # File upload
│   ├── (auth)/         # Authentication pages (login, signup)
│   │   └── login/
│   ├── (main)/         # Main application pages (protected)
│   │   ├── listings/
│   │   ├── buy-requests/
│   │   ├── chat/
│   │   ├── profile/
│   │   ├── wishlist/
│   │   └── notifications/
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
│
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── next.config.js      # Next.js configuration
├── .env.example        # Environment variables template
├── README.md           # Getting started guide
├── DEPLOYMENT.md       # Deployment instructions
├── ARCHITECTURE.md     # This file
└── PROJECT_SUMMARY.md  # Complete project documentation
```

## Layer Responsibilities

### Frontend Layer (`frontend/`)
**Purpose:** User interface and client-side logic

**Responsibilities:**
- React components and UI
- Client-side routing
- State management (Zustand)
- Data fetching (React Query)
- Form handling and validation
- Firebase client authentication
- API calls to backend

**Never does:**
- Direct database access
- Business logic calculations
- Trust score computation
- Token verification

### Backend Layer (`backend/`)
**Purpose:** Business logic and data access

**Responsibilities:**
- API endpoint handlers
- Authentication & authorization
- Database operations (Firestore)
- Business logic (trust score, etc.)
- Data validation (Zod)
- Image upload (Cloudinary)
- Push notifications (FCM)

**Never does:**
- UI rendering
- Client-side state management
- Direct user interaction

### Shared Layer (`shared/`)
**Purpose:** Code used by both frontend and backend

**Contents:**
- TypeScript interfaces
- Type definitions
- Enums
- Constants

## Data Flow

### 1. User Action (Frontend)
```
User clicks "Create Listing"
  ↓
Frontend Form (React Hook Form + Zod validation)
  ↓
ListingService.createListing() called
```

### 2. API Request (Frontend Service)
```
ListingService.createListing()
  ↓
ApiService.post('/api/listings', data)
  ↓
Axios interceptor adds JWT token
  ↓
HTTP POST to backend
```

### 3. API Handler (Backend)
```
POST /api/listings route handler
  ↓
Middleware: requireAuth() verifies JWT
  ↓
Middleware: validateRequest() checks data with Zod
  ↓
ListingRepository.createListing()
  ↓
Firestore.collection('listings').add()
```

### 4. Response Flow
```
Firestore returns listing data
  ↓
Repository returns formatted listing
  ↓
API handler returns JSON response
  ↓
Frontend receives response
  ↓
React Query updates cache
  ↓
UI automatically re-renders
```

## Why This Architecture?

### 1. Mobile-Ready
- React Native app can use same REST APIs
- No backend rewrite needed
- Consistent business logic

### 2. Separation of Concerns
- Frontend: UI/UX
- Backend: Business logic
- Shared: Common types

### 3. Type Safety
- Shared types ensure frontend/backend consistency
- Catch errors at compile time
- Better IDE autocomplete

### 4. Scalability
- Backend can be deployed independently
- Frontend can be static
- Easy to add microservices later

### 5. Security
- All business logic on backend
- No secrets in frontend
- Token verification on every request

### 6. Testability
- Frontend components testable in isolation
- Backend logic testable without UI
- API endpoints testable independently

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  1. User clicks "Sign in with Google"                      │
│  2. Firebase Auth SDK handles OAuth                        │
│  3. Receive ID Token from Firebase                         │
│  4. Send token to backend: POST /api/auth/login            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│  5. Verify token with Firebase Admin SDK                   │
│  6. Get/create user in Firestore                          │
│  7. Return user data + token                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  8. Store token in Zustand store                           │
│  9. Store persists to localStorage                         │
│  10. Include token in all API requests (Authorization)     │
└─────────────────────────────────────────────────────────────┘
```

## Future: Mobile App Integration

```
┌─────────────────────┐
│   Web (Next.js)     │
│   - Browse listings │
│   - Chat            │
│   - Profiles        │
└──────────┬──────────┘
           │
           │ Same REST APIs
           │
           ▼
┌─────────────────────────────────┐
│   Backend API (Next.js)         │
│   ✅ Already mobile-ready       │
└──────────┬──────────────────────┘
           │
           │ Same REST APIs
           │
           ▼
┌─────────────────────┐
│ Mobile (React Native│
│   - Push notifications
│   - Camera integration
│   - Offline support │
└─────────────────────┘
```

**No backend changes needed!**

## Key Design Patterns

### 1. Repository Pattern
Encapsulates data access logic
```typescript
// backend/repositories/listing.repository.ts
export class ListingRepository {
  async getListingById(id: string): Promise<Listing | null> {
    // Firestore logic here
  }
}
```

### 2. Service Pattern
Encapsulates API calls
```typescript
// frontend/services/listing.service.ts
export class ListingService {
  static async getListingById(id: string) {
    return ApiService.get(`/listings/${id}`)
  }
}
```

### 3. Middleware Pattern
Separates cross-cutting concerns
```typescript
// backend/middleware/auth.ts
export function requireAuth(handler: Function) {
  return async (req, context) => {
    // Verify JWT
    return handler(req, { ...context, user })
  }
}
```

### 4. Store Pattern
Centralized state management
```typescript
// frontend/store/auth.store.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

## Environment Variables

### Frontend (Public)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

### Backend (Secret)
- `FIREBASE_PRIVATE_KEY`
- `CLOUDINARY_API_SECRET`
- All Admin SDK credentials

## Deployment

### Vercel (Recommended)
- Automatic CI/CD from GitHub
- Frontend served via CDN
- API routes run as serverless functions
- Environment variables managed in dashboard

### Alternative: Docker
```dockerfile
# Can containerize if needed
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Conclusion

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Mobile-ready from day one
- ✅ Type safety across the stack
- ✅ Scalable and maintainable
- ✅ Easy to test
- ✅ Secure by default

The folder structure matches the TRD specification perfectly, with clear boundaries between frontend, backend, and shared code.
