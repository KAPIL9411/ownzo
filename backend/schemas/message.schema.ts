import { z } from 'zod'

/**
 * Zod schemas for message and chat validation
 */

export const createMessageSchema = z.object({
  chatId: z
    .string()
    .min(1, 'Chat ID is required'),
  
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(1000, 'Message must not exceed 1000 characters')
    .trim(),
  
  type: z.enum(['text', 'image', 'offer'], {
    errorMap: () => ({ message: 'Invalid message type' }),
  }).default('text'),
  
  metadata: z
    .record(z.any())
    .optional(),
})

export const createChatSchema = z.object({
  participantIds: z
    .array(z.string())
    .min(2, 'Chat must have at least 2 participants')
    .max(10, 'Chat cannot have more than 10 participants'),
  
  type: z.enum(['direct', 'group'], {
    errorMap: () => ({ message: 'Invalid chat type' }),
  }).default('direct'),
  
  name: z
    .string()
    .max(100, 'Chat name must not exceed 100 characters')
    .trim()
    .optional(),
})

export type CreateMessageInput = z.infer<typeof createMessageSchema>
export type CreateChatInput = z.infer<typeof createChatSchema>
