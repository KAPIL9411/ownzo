import { z } from 'zod'

// 🔒 SECURITY: Custom price validator to prevent floating-point manipulation
// Rejects: scientific notation (1e-100), extremely small values, unreasonable prices
const MIN_PRICE = 10 // Minimum ₹10
const MAX_PRICE = 100_000_000 // Maximum ₹10 crore (reasonable for marketplace)

const priceValidator = z.number()
  .refine((val) => {
    // Reject NaN, Infinity, -Infinity
    if (!Number.isFinite(val)) return false
    
    // Reject negative numbers and zero
    if (val <= 0) return false
    
    // Reject extremely small numbers (scientific notation bypass)
    if (val < MIN_PRICE) return false
    
    // Reject unreasonably high prices
    if (val > MAX_PRICE) return false
    
    // Reject numbers with more than 2 decimal places
    const rounded = Math.round(val * 100) / 100
    if (Math.abs(val - rounded) > 0.001) return false
    
    return true
  }, {
    message: `Price must be between ₹${MIN_PRICE} and ₹${MAX_PRICE.toLocaleString()} with max 2 decimal places`,
  })

// User Validators
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
  bio: z.string().max(500).optional(),
  location: z.object({
    city: z.string(),
    locality: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
})

// Listing Validators
export const createListingSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  categoryId: z.string(),
  price: priceValidator, // 🔒 SECURITY FIX: Use custom validator
  negotiable: z.boolean(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  city: z.string(),
  locality: z.string().optional(),
  communityId: z.string().optional(),
  images: z.array(z.string().url()).min(1).max(10),
  video: z.string().url().optional(),
})

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['active', 'sold', 'expired', 'deleted']).optional(),
})

export const listingFiltersSchema = z.object({
  categoryId: z.string().optional(),
  city: z.string().optional(),
  communityId: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['recent', 'price-low', 'price-high', 'popular']).optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
})

// Offer Validators
export const createOfferSchema = z.object({
  listingId: z.string(),
  offerPrice: priceValidator, // 🔒 SECURITY FIX: Use custom validator
  message: z.string().max(500).optional(),
})

export const updateOfferSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'counter']),
  counterPrice: priceValidator.optional(), // 🔒 SECURITY FIX: Use custom validator
})

// Review Validators
export const createReviewSchema = z.object({
  listingId: z.string(),
  sellerId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(500),
})

// Buy Request Validators
export const createBuyRequestSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  categoryId: z.string(),
  budget: priceValidator, // 🔒 SECURITY FIX: Use custom validator
  negotiable: z.boolean(),
  city: z.string(),
  locality: z.string().optional(),
  communityId: z.string().optional(),
})

export const updateBuyRequestSchema = createBuyRequestSchema.partial().extend({
  status: z.enum(['active', 'fulfilled', 'expired', 'deleted']).optional(),
})

// Message Validators
export const sendMessageSchema = z.object({
  chatId: z.string(),
  message: z.string().min(1).max(1000),
  type: z.enum(['text', 'image', 'offer']).default('text'),
  imageUrl: z.string().url().optional(),
})

// Upload Validators
export const uploadImageSchema = z.object({
  image: z.string(), // base64 string
  folder: z.string().optional(),
})

export function validateRequest<T>(schema: z.ZodSchema<T>, data: any): T {
  return schema.parse(data)
}
