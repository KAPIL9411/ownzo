import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'

/**
 * AI Description Generator API
 * Uses GROQ (FREE alternative to OpenAI) to generate product descriptions
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = 'llama-3.1-8b-instant' // Fast, free model

interface DescriptionRequest {
  title: string
  category?: string
  condition?: string
  price?: number
  existingDescription?: string
}

async function generateWithGroq(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ API key not configured')
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that writes compelling product descriptions for a peer-to-peer marketplace in India. 
Write descriptions that are:
- Clear and concise (100-250 words)
- Honest and trustworthy (no exaggeration)
- Include key details buyers care about
- Natural and conversational tone
- Use Indian English (₹ symbol, spellings like "colour", "favourite")
- Focus on condition, features, reason for selling, what's included`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      let errorDetail = ''
      try {
        const errBody = await response.json()
        console.error('[GROQ Error Response]', errBody)
        errorDetail = errBody.error?.message || ''
      } catch {
        errorDetail = await response.text()
        console.error('[GROQ Raw Error]', errorDetail)
      }

      if (response.status === 401) {
        throw new Error('GROQ API key is invalid or expired. Please get a new key from https://console.groq.com')
      }
      if (response.status === 429) {
        throw new Error('AI rate limit reached. Please try again in a minute.')
      }
      throw new Error(errorDetail || `AI service error (${response.status})`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('[GROQ Empty Response]', data)
      throw new Error('AI returned an empty response')
    }

    return content
  } catch (error: any) {
    console.error('[GROQ API Error]', error.message)
    throw error
  }
}

async function handler(req: NextRequest, context: { user: any }) {
  console.log('[AI Description] Request received from user:', context.user?.uid)
  
  try {
    const body: DescriptionRequest = await req.json()
    const { title, category, condition, price, existingDescription } = body

    console.log('[AI Description] Input:', { title, category, condition, price })

    // Validate input
    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: 'Title is required (min 3 characters)' },
        { status: 400 }
      )
    }

    // Check if GROQ API key is configured
    if (!GROQ_API_KEY) {
      console.error('[AI Description] GROQ_API_KEY not configured')
      return NextResponse.json(
        { success: false, message: 'AI service not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Build prompt based on what info we have
    let prompt = ''

    if (existingDescription) {
      // Improve existing description
      prompt = `Improve this product listing description:

Title: ${title}
Category: ${category || 'General'}
Condition: ${condition || 'Used'}
Current Description: ${existingDescription}

Make it more detailed, trustworthy, and appealing to buyers. Keep the same information but present it better.`
    } else {
      // Generate new description
      prompt = `Write a product description for this listing:

Title: ${title}
Category: ${category || 'General'}
Condition: ${condition || 'Used'}
${price ? `Price: ₹${price.toLocaleString()}` : ''}

Create a compelling description that helps buyers understand:
1. What the product is
2. Its condition and features
3. What's included (if applicable)
4. Why it's a good buy

Keep it between 100-250 words. Be honest and specific.`
    }

    console.log('[AI Description] Calling GROQ API...')

    // Generate description using GROQ
    const description = await generateWithGroq(prompt)

    console.log('[AI Description] GROQ response received, length:', description.length)

    // Clean up the generated text
    const cleanedDescription = description
      .trim()
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\n\n+/g, '\n\n') // Normalize line breaks

    // Generate suggestions for improvement
    const suggestions: string[] = []
    if (!price) suggestions.push('Add a price to attract more buyers')
    if (!condition || condition === 'good') suggestions.push('Specify exact condition details')
    if (cleanedDescription.length < 100) suggestions.push('Add more details about the product')

    console.log('[AI Description] Success, returning description')

    return NextResponse.json({
      success: true,
      data: {
        description: cleanedDescription,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      },
    })
  } catch (error: any) {
    console.error('[Generate Description Error]', error)
    console.error('[Error Stack]', error.stack)
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to generate description',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

export const POST = requireAuth(handler)
