import { z } from 'zod'

/**
 * Zod schemas for review validation
 */

export const createReviewSchema = z.object({
  listingId: z
    .string()
    .min(1, 'Listing ID is required'),
  
  sellerId: z
    .string()
    .min(1, 'Seller ID is required'),
  
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5'),
  
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must not exceed 1000 characters')
    .trim()
    .optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
