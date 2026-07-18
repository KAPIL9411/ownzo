import { z } from 'zod'

/**
 * Zod schemas for user validation
 */

export const createUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  
  photoURL: z
    .string()
    .url('Invalid photo URL')
    .optional(),
  
  phoneNumber: z
    .string()
    .regex(/^[\d\s\-+()]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .optional(),
  
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .trim()
    .optional(),
  
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters')
    .trim()
    .optional(),
  
  communityId: z
    .string()
    .optional(),
})

export const updateUserSchema = createUserSchema.partial()

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
