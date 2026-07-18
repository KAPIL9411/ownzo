import { z } from 'zod'

/**
 * Zod schemas for buy request validation
 */

export const createBuyRequestSchema = z.object({
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
  
  categoryId: z
    .string()
    .min(1, 'Category is required'),
  
  maxPrice: z
    .number()
    .positive('Max price must be positive')
    .max(10000000, 'Max price must not exceed 10,000,000')
    .multipleOf(0.01, 'Price must have at most 2 decimal places')
    .optional(),
  
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters')
    .trim(),
  
  urgency: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Invalid urgency level' }),
  }).optional(),
})

export const updateBuyRequestSchema = createBuyRequestSchema.partial().extend({
  status: z.enum(['active', 'fulfilled', 'cancelled']).optional(),
})

export type CreateBuyRequestInput = z.infer<typeof createBuyRequestSchema>
export type UpdateBuyRequestInput = z.infer<typeof updateBuyRequestSchema>
