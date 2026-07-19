// User Types
export type UserRole = 'user' | 'admin' | 'moderator'

export interface User {
  id: string
  name: string
  email: string
  photoURL?: string
  phone?: string
  phoneNumber?: string
  bio?: string
  city?: string
  role?: UserRole
  trustScore: number
  rating?: number
  reviewCount?: number
  listingCount?: number
  verified: boolean
  isVerified?: boolean
  verificationType?: 'email' | 'phone' | 'student' | 'government'
  communityId?: string
  isBanned?: boolean
  banReason?: string
  reportCount?: number
  location?: Location
  createdAt: Date
  updatedAt: Date
  
  // Trust Engine - Enhanced verification fields
  phoneVerified?: boolean
  emailVerified?: boolean
  collegeVerified?: boolean
  governmentIdVerified?: boolean
  lastActiveAt?: Date
  accountAge?: number // Calculated field - days since account creation
}

export interface Location {
  city: string
  locality?: string
  latitude?: number
  longitude?: number
}

// Listing Types
export interface Listing {
  id: string
  sellerId: string
  seller?: User
  title: string
  description: string
  categoryId: string
  category?: Category
  price: number
  negotiable: boolean
  status: ListingStatus
  condition: ProductCondition
  city: string
  locality?: string
  communityId?: string
  community?: Community
  images: string[]
  video?: string
  views: number
  wishlistCount: number
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  soldAt?: Date  // 🔒 ADDED: Track when listing was sold (for race condition prevention)
  
  // Trust Engine - Verification & Trust fields
  trustScore?: number // Overall trust score (0-100)
  verificationStatus: VerificationStatus // Current verification state
  verificationChecks?: string[] // Array of passed verification check types
  riskScore?: number // Risk assessment score (0-100, lower is better)
  publishedAt?: Date // When listing was actually published (after verification)
  verificationCode?: string // Code for live verification photos (high-value items)
  categorySpecificData?: CategorySpecificData // Additional data for category-specific verification
}

export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'sold' | 'expired' | 'deleted' | 'rejected'
export type VerificationStatus = 'unverified' | 'pending' | 'checking' | 'verified' | 'needs_improvement' | 'rejected'

// Category-specific data for verification
export interface CategorySpecificData {
  verificationPhoto?: string // Live verification photo with handwritten code
  invoice?: string // Invoice/bill for warranty verification
  serialNumber?: string // For electronics, vehicles, etc.
  specifications?: Record<string, any> // Category-specific specs
}
export type ProductCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor'

// Category Types
export interface Category {
  id: string
  name: string
  icon: string
  slug: string
  imageUrl?: string
  subLabel?: string
}

// Review Types
export interface Review {
  id: string
  listingId: string
  listing?: Listing
  buyerId: string
  buyer?: User
  sellerId: string
  seller?: User
  rating: number
  comment: string
  createdAt: Date
}

// Wishlist Types
export interface Wishlist {
  id: string
  userId: string
  listingId: string
  listing?: Listing
  createdAt: Date
}

// Chat Types
export interface Chat {
  id: string
  listingId: string
  listing?: Listing
  buyerId: string
  buyer?: User
  sellerId: string
  seller?: User
  lastMessage?: string
  lastMessageAt?: Date
  unreadCount?: number
  createdAt: Date
  updatedAt: Date
}

// Message Types
export interface Message {
  id: string
  chatId: string
  senderId: string
  sender?: User
  message: string
  type: MessageType
  imageUrl?: string
  createdAt: Date
  read: boolean
}

export type MessageType = 'text' | 'image' | 'offer'

// Offer Types
export interface Offer {
  id: string
  listingId: string
  listing?: Listing
  buyerId: string
  buyer?: User
  sellerId: string
  seller?: User
  offerPrice: number
  status: OfferStatus
  message?: string
  createdAt: Date
  updatedAt: Date
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'counter'

// Community Types
export interface Community {
  id: string
  name: string
  type: CommunityType
  city: string
  college?: string
  description?: string
  members: number
  verified: boolean
  requiresApproval?: boolean   // admin-controlled — join needs approval
  createdAt: Date
}

export interface CommunityJoinRequest {
  id: string
  communityId: string
  community?: Community
  userId: string
  user?: User
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  createdAt: Date
  reviewedAt?: Date
  reviewedBy?: string
}

export type CommunityType = 'college' | 'apartment' | 'society' | 'locality'

// Admin types
export interface AdminStats {
  totalUsers: number
  totalListings: number
  totalCommunities: number
  totalBuyRequests: number
  activeListings: number
  pendingListings: number
  bannedUsers: number
  pendingJoinRequests: number
  verifiedUsers: number
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  referenceId?: string
  imageUrl?: string
  read: boolean
  createdAt: Date
}

export type NotificationType =
  | 'message'
  | 'offer'
  | 'review'
  | 'listing'
  | 'system'

// Buy Request Types (Reverse Marketplace)
export interface BuyRequest {
  id: string
  userId: string
  user?: User
  title: string
  description: string
  categoryId: string
  category?: Category
  budget: number
  negotiable: boolean
  city: string
  locality?: string
  communityId?: string
  community?: Community
  status: BuyRequestStatus
  responseCount: number
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

export type BuyRequestStatus = 'active' | 'fulfilled' | 'expired' | 'deleted'

// Product Passport Types
export interface ProductPassport {
  id: string
  listingId: string
  invoiceURL?: string
  warrantyTill?: Date
  ownershipDuration?: number // in months
  serviceHistory?: ServiceRecord[]
  purchaseDate?: Date
  originalPrice?: number
}

export interface ServiceRecord {
  date: Date
  description: string
  cost?: number
  serviceProvider?: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  nextCursor?: string
}

// Filter Types
export interface ListingFilters {
  categoryId?: string
  city?: string
  communityId?: string
  minPrice?: number
  maxPrice?: number
  condition?: ProductCondition
  search?: string
  sortBy?: 'recent' | 'price-low' | 'price-high' | 'popular' | 'newest'
  page?: number
  limit?: number
  cursor?: string
}

export interface BuyRequestFilters {
  categoryId?: string
  city?: string
  communityId?: string
  minBudget?: number
  maxBudget?: number
  search?: string
  page?: number
  limit?: number
}

// Form Types
export interface CreateListingInput {
  title: string
  description: string
  categoryId: string
  price: number
  negotiable: boolean
  condition: ProductCondition
  city: string
  locality?: string
  communityId?: string
  images: string[]
  video?: string
  categorySpecificData?: CategorySpecificData
  // Trust Engine fields — set by the assess flow before submission
  status?: ListingStatus
  trustScore?: number
  verificationStatus?: VerificationStatus
  riskScore?: number
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  status?: ListingStatus
}

export interface CreateOfferInput {
  listingId: string
  offerPrice: number
  message?: string
}

export interface CreateReviewInput {
  listingId: string
  sellerId: string
  rating: number
  comment: string
}

export interface CreateBuyRequestInput {
  title: string
  description: string
  categoryId: string
  budget: number
  negotiable: boolean
  city: string
  locality?: string
  communityId?: string
}

export interface UpdateProfileInput {
  name?: string
  phone?: string
  bio?: string
  location?: Location
}

// Auth Types
export interface LoginResponse {
  user: User
  token: string
}

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}
