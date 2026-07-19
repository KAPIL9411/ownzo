/**
 * AI Description Generator Service
 * Uses GROQ API (FREE) to generate product descriptions
 * Uses ApiService so the Firebase auth token is sent automatically
 */

import { ApiService } from './api.service'

export interface DescriptionInput {
  title: string
  category?: string
  condition?: string
  price?: number
  existingDescription?: string
}

export interface DescriptionResult {
  description: string
  suggestions?: string[]
}

export class AIDescriptionService {
  /**
   * Generate product description using AI.
   * Uses ApiService so the Bearer token is attached automatically.
   */
  static async generateDescription(input: DescriptionInput): Promise<DescriptionResult> {
    const response = await ApiService.post<{ success: boolean; data: DescriptionResult; message?: string }>(
      '/ai/generate-description',
      input
    )

    if (!response.success) {
      throw new Error(response.message || 'Failed to generate description')
    }

    return response.data
  }

  /**
   * Improve an existing description.
   */
  static async improveDescription(
    currentDescription: string,
    context: DescriptionInput
  ): Promise<DescriptionResult> {
    return this.generateDescription({
      ...context,
      existingDescription: currentDescription,
    })
  }
}
