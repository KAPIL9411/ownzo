import { z } from 'zod'

/**
 * Zod schemas for listing validation
 * Provides runtime type safety and validation
 */

export const createListingSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim(),
  
  price: z
    .number()
    .positive('Price must be positive')
    .max(10000000, 'Price must not exceed 10,000,000')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  
  categoryId: z
    .string()
    .min(1, 'Category is required'),
  
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor'], {
    errorMap: () => ({ message: 'Invalid condition value' }),
  }),
  
  images: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  
  negotiable: z
    .boolean({
      required_error: 'Negotiable field is required',
      invalid_type_error: 'Negotiable must be a boolean',
    }),
  
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters')
    .trim(),
  
  communityId: z
    .string()
    .optional(),
  
  tags: z
    .array(z.string().max(30, 'Tag must not exceed 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  
  // Trust Engine fields
  status: z.enum(['draft', 'pending_review', 'active', 'rejected']).optional().default('active'),
  trustScore: z.number().min(0).max(100).optional(),
  verificationStatus: z.enum(['verified', 'pending', 'unverified', 'rejected']).optional(),
  riskScore: z.number().min(0).max(100).optional(),
})

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['draft', 'pending_review', 'active', 'rejected', 'sold', 'deleted']).optional(),
})

export const listingFiltersSchema = z.object({
  categoryId: z.string().optional(),
  city: z.string().optional(),
  communityId: z.string().optional(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  sortBy: z.enum(['recent', 'newest', 'price-low', 'price-high', 'popular']).optional(),
  limit: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
  cursor: z.string().optional(),
  search: z.string().optional(),
})

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
export type ListingFilters = z.infer<typeof listingFiltersSchema>
