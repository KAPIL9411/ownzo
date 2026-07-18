import { z } from 'zod'

/**
 * Zod schemas for offer validation
 */

export const createOfferSchema = z.object({
  listingId: z
    .string()
    .min(1, 'Listing ID is required'),
  
  offerPrice: z
    .number()
    .positive('Offer price must be positive')
    .max(10000000, 'Offer price must not exceed 10,000,000')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  
  message: z
    .string()
    .max(500, 'Message must not exceed 500 characters')
    .trim()
    .optional(),
})

export const updateOfferStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid offer status' }),
  }),
})

export type CreateOfferInput = z.infer<typeof createOfferSchema>
export type UpdateOfferStatusInput = z.infer<typeof updateOfferStatusSchema>
