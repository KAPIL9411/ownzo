/**
 * Listing Validator Middleware
 * Validates minimum requirements before listing creation/update
 * This is a lightweight check before the heavy Trust Engine assessment
 */

import { NextRequest, NextResponse } from 'next/server'
import { CreateListingInput } from '@/shared/types'

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings?: string[]
}

/**
 * Minimum requirements for listing submission
 */
const MIN_REQUIREMENTS = {
  TITLE_MIN_LENGTH: 5,         // matches frontend schema
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 2000,
  MIN_PRICE: 1,
  MAX_PRICE: 100000000,
  MIN_PHOTOS: 1,
  MAX_PHOTOS: 10,
  HIGH_VALUE_THRESHOLD: 5000,  // matches frontend HIGH_VALUE_THRESHOLD
  MIN_PHOTOS_HIGH_VALUE: 3,    // matches frontend MIN_PHOTOS_HIGH_VALUE
  PREMIUM_THRESHOLD: 10000,    // matches frontend PREMIUM_THRESHOLD
  MIN_PHOTOS_PREMIUM: 5,       // matches frontend MIN_PHOTOS_PREMIUM
}

/**
 * Validate listing input before submission
 */
export function validateListingInput(input: CreateListingInput): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  // Validate title
  if (!input.title || input.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title is required',
      code: 'TITLE_REQUIRED',
    })
  } else if (input.title.length < MIN_REQUIREMENTS.TITLE_MIN_LENGTH) {
    errors.push({
      field: 'title',
      message: `Title must be at least ${MIN_REQUIREMENTS.TITLE_MIN_LENGTH} characters`,
      code: 'TITLE_TOO_SHORT',
    })
  } else if (input.title.length > MIN_REQUIREMENTS.TITLE_MAX_LENGTH) {
    errors.push({
      field: 'title',
      message: `Title must not exceed ${MIN_REQUIREMENTS.TITLE_MAX_LENGTH} characters`,
      code: 'TITLE_TOO_LONG',
    })
  }

  // Validate description
  if (!input.description || input.description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'Description is required',
      code: 'DESCRIPTION_REQUIRED',
    })
  } else if (input.description.length < MIN_REQUIREMENTS.DESCRIPTION_MIN_LENGTH) {
    errors.push({
      field: 'description',
      message: `Description must be at least ${MIN_REQUIREMENTS.DESCRIPTION_MIN_LENGTH} characters`,
      code: 'DESCRIPTION_TOO_SHORT',
    })
  } else if (input.description.length > MIN_REQUIREMENTS.DESCRIPTION_MAX_LENGTH) {
    errors.push({
      field: 'description',
      message: `Description must not exceed ${MIN_REQUIREMENTS.DESCRIPTION_MAX_LENGTH} characters`,
      code: 'DESCRIPTION_TOO_LONG',
    })
  }

  // Check for better description
  if (input.description && input.description.length < 50) {
    warnings.push('Adding more details to your description will improve trust score')
  }

  // Validate category
  if (!input.categoryId || input.categoryId.trim().length === 0) {
    errors.push({
      field: 'categoryId',
      message: 'Category is required',
      code: 'CATEGORY_REQUIRED',
    })
  }

  // Validate price
  if (typeof input.price !== 'number' || isNaN(input.price)) {
    errors.push({
      field: 'price',
      message: 'Price must be a valid number',
      code: 'PRICE_INVALID',
    })
  } else if (input.price < MIN_REQUIREMENTS.MIN_PRICE) {
    errors.push({
      field: 'price',
      message: `Price must be at least ₹${MIN_REQUIREMENTS.MIN_PRICE}`,
      code: 'PRICE_TOO_LOW',
    })
  } else if (input.price > MIN_REQUIREMENTS.MAX_PRICE) {
    errors.push({
      field: 'price',
      message: `Price must not exceed ₹${MIN_REQUIREMENTS.MAX_PRICE.toLocaleString('en-IN')}`,
      code: 'PRICE_TOO_HIGH',
    })
  }

  // Validate condition
  const validConditions = ['new', 'like-new', 'good', 'fair', 'poor']
  if (!input.condition || !validConditions.includes(input.condition)) {
    errors.push({
      field: 'condition',
      message: 'Condition must be one of: new, like-new, good, fair, poor',
      code: 'CONDITION_INVALID',
    })
  }

  // Validate location
  if (!input.city || input.city.trim().length === 0) {
    errors.push({
      field: 'city',
      message: 'City is required',
      code: 'CITY_REQUIRED',
    })
  }

  // Validate images
  if (!input.images || !Array.isArray(input.images)) {
    errors.push({
      field: 'images',
      message: 'At least one image is required',
      code: 'IMAGES_REQUIRED',
    })
  } else if (input.images.length < MIN_REQUIREMENTS.MIN_PHOTOS) {
    errors.push({
      field: 'images',
      message: `At least ${MIN_REQUIREMENTS.MIN_PHOTOS} photo is required`,
      code: 'IMAGES_INSUFFICIENT',
    })
  } else if (input.images.length > MIN_REQUIREMENTS.MAX_PHOTOS) {
    errors.push({
      field: 'images',
      message: `Maximum ${MIN_REQUIREMENTS.MAX_PHOTOS} photos allowed`,
      code: 'IMAGES_TOO_MANY',
    })
  }

  // High-value item special requirements
  if (input.price >= MIN_REQUIREMENTS.HIGH_VALUE_THRESHOLD) {
    const isPremium = input.price >= MIN_REQUIREMENTS.PREMIUM_THRESHOLD
    const requiredPhotos = isPremium
      ? MIN_REQUIREMENTS.MIN_PHOTOS_PREMIUM
      : MIN_REQUIREMENTS.MIN_PHOTOS_HIGH_VALUE

    if (input.images && input.images.length < requiredPhotos) {
      warnings.push(
        isPremium
          ? `Items above ₹${MIN_REQUIREMENTS.PREMIUM_THRESHOLD.toLocaleString('en-IN')} require at least ${MIN_REQUIREMENTS.MIN_PHOTOS_PREMIUM} photos`
          : `Items above ₹${MIN_REQUIREMENTS.HIGH_VALUE_THRESHOLD.toLocaleString('en-IN')} require at least ${MIN_REQUIREMENTS.MIN_PHOTOS_HIGH_VALUE} photos`
      )
    }

    // Check for verification photo
    if (!input.categorySpecificData?.verificationPhoto) {
      warnings.push(
        'A live verification photo is required for this item. Please upload one showing you holding the item with "Ownzo" written on paper.'
      )
    }
  }

  // Check photo quality recommendations
  if (input.images && input.images.length < 3) {
    warnings.push('Adding 3+ photos will significantly improve your listing trust score')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Middleware function for Next.js API routes
 */
export async function validateListingMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await req.json()

    // Validate the input
    const validation = validateListingInput(body as CreateListingInput)

    // If validation fails, return error response
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      )
    }

    // If there are warnings, include them in the request for the handler
    if (validation.warnings) {
      // Attach warnings to request (can be accessed by the handler)
      ;(req as any).validationWarnings = validation.warnings
    }

    // Proceed to the actual handler
    return handler(req)
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request format',
        error: error.message,
      },
      { status: 400 }
    )
  }
}

/**
 * Check if seller meets minimum requirements to create listings
 */
export interface SellerRequirements {
  canCreateListing: boolean
  reason?: string
  missingRequirements?: string[]
}

export function checkSellerRequirements(user: any): SellerRequirements {
  const missing: string[] = []

  // Must have Google verification (baseline)
  if (!user.email) {
    missing.push('Google account verification required')
  }

  // Must have profile name
  if (!user.name || user.name.trim().length === 0) {
    missing.push('Profile name is required')
  }

  // Cannot be banned
  if (user.isBanned) {
    return {
      canCreateListing: false,
      reason: 'Your account is currently banned. Contact support for assistance.',
    }
  }

  // Note: city is NOT a hard requirement — the listing itself carries the location.
  // A missing city on the profile reduces the trust score but does not block listing.

  if (missing.length > 0) {
    return {
      canCreateListing: false,
      reason: 'Please complete your profile to create listings',
      missingRequirements: missing,
    }
  }

  return {
    canCreateListing: true,
  }
}

/**
 * Sanitize listing input to prevent XSS and injection attacks
 */
export function sanitizeListingInput(input: CreateListingInput): CreateListingInput {
  return {
    ...input,
    title: sanitizeString(input.title),
    description: sanitizeString(input.description),
    city: sanitizeString(input.city),
    locality: input.locality ? sanitizeString(input.locality) : undefined,
    // Images and other fields are validated separately
  }
}

/**
 * Basic string sanitization
 */
function sanitizeString(str: string): string {
  if (!str) return ''
  
  // Remove any HTML tags
  let sanitized = str.replace(/<[^>]*>/g, '')
  
  // Remove script-like content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Trim and normalize whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ')
  
  return sanitized
}

/**
 * Validate image URLs
 */
export function validateImageUrls(images: string[]): { valid: boolean; invalidUrls?: string[] } {
  const invalidUrls: string[] = []

  for (const url of images) {
    // Check if it's a valid URL format
    try {
      const parsedUrl = new URL(url)
      
      // Must be HTTPS
      if (parsedUrl.protocol !== 'https:') {
        invalidUrls.push(url)
        continue
      }

      // Check for common image extensions or cloud storage patterns
      const isCloudStorage = 
        url.includes('firebase') ||
        url.includes('cloudinary') ||
        url.includes('s3.amazonaws') ||
        url.includes('googleapis.com')
      
      const hasImageExtension = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)

      if (!isCloudStorage && !hasImageExtension) {
        invalidUrls.push(url)
      }
    } catch {
      invalidUrls.push(url)
    }
  }

  return {
    valid: invalidUrls.length === 0,
    invalidUrls: invalidUrls.length > 0 ? invalidUrls : undefined,
  }
}
