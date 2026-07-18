/**
 * Input sanitization middleware to prevent XSS attacks
 * Sanitizes all string inputs in request body, query params, and URL params
 */

import { NextRequest, NextResponse } from 'next/server'

// HTML entities that need to be escaped
const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char)
}

/**
 * Remove potentially dangerous HTML tags and attributes
 */
export function stripDangerousTags(html: string): string {
  // Remove script tags and their content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove iframe tags
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  
  // Remove event handlers (onclick, onerror, etc.)
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: protocol
  cleaned = cleaned.replace(/javascript:/gi, '')
  
  // Remove data: protocol (can be used for XSS)
  cleaned = cleaned.replace(/data:text\/html/gi, '')
  
  return cleaned
}

/**
 * Sanitize a single value (string)
 */
function sanitizeValue(value: any, preserveHtml: boolean = false): any {
  if (typeof value === 'string') {
    if (preserveHtml) {
      // For fields that need HTML (like descriptions), strip dangerous tags
      return stripDangerousTags(value.trim())
    }
    // For regular fields, escape HTML entities
    return escapeHtml(value.trim())
  }
  return value
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any, htmlFields: string[] = []): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, htmlFields))
  }

  if (typeof obj === 'object') {
    const sanitized: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const preserveHtml = htmlFields.includes(key)
        sanitized[key] = 
          typeof obj[key] === 'object' 
            ? sanitizeObject(obj[key], htmlFields)
            : sanitizeValue(obj[key], preserveHtml)
      }
    }
    return sanitized
  }

  return obj
}

/**
 * Fields that may contain limited HTML (only strip dangerous tags)
 * All other fields will have HTML entities escaped
 */
const HTML_ALLOWED_FIELDS = ['description', 'bio', 'content', 'message']

/**
 * Sanitize middleware - cleans all input data
 */
export async function sanitizeInput(req: NextRequest): Promise<NextRequest> {
  try {
    // Clone the request to avoid mutating the original
    const url = new URL(req.url)
    
    // Sanitize query parameters
    const sanitizedSearchParams = new URLSearchParams()
    url.searchParams.forEach((value, key) => {
      sanitizedSearchParams.set(key, sanitizeValue(value, false))
    })
    
    // Create new URL with sanitized params
    const newUrl = new URL(url.pathname, url.origin)
    newUrl.search = sanitizedSearchParams.toString()

    // Sanitize request body if present
    if (req.body) {
      try {
        const body = await req.json()
        const sanitizedBody = sanitizeObject(body, HTML_ALLOWED_FIELDS)
        
        // Create new request with sanitized body
        return new NextRequest(newUrl, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(sanitizedBody),
        })
      } catch (error) {
        // Not JSON or empty body, return as is
        return new NextRequest(newUrl, {
          method: req.method,
          headers: req.headers,
          body: req.body,
        })
      }
    }

    return new NextRequest(newUrl, {
      method: req.method,
      headers: req.headers,
    })
  } catch (error) {
    console.error('Sanitization error:', error)
    // On error, return original request
    return req
  }
}

/**
 * Higher-order function to wrap API routes with sanitization
 */
export function withSanitization(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const sanitizedReq = await sanitizeInput(req)
    return handler(sanitizedReq, context)
  }
}

/**
 * Validate and sanitize specific field types
 */
export const validators = {
  email: (email: string): string => {
    const sanitized = sanitizeValue(email, false).toLowerCase()
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
      throw new Error('Invalid email format')
    }
    return sanitized
  },

  url: (url: string): string => {
    const sanitized = sanitizeValue(url, false)
    try {
      const parsed = new URL(sanitized)
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid URL protocol')
      }
      return sanitized
    } catch (error) {
      throw new Error('Invalid URL format')
    }
  },

  phoneNumber: (phone: string): string => {
    // Remove all non-numeric characters except +
    const sanitized = phone.replace(/[^\d+]/g, '')
    if (sanitized.length < 10) {
      throw new Error('Invalid phone number')
    }
    return sanitized
  },

  alphanumeric: (text: string): string => {
    const sanitized = sanitizeValue(text, false)
    // Only allow letters, numbers, spaces, and common punctuation
    if (!/^[a-zA-Z0-9\s\-_.,'!?]+$/.test(sanitized)) {
      throw new Error('Invalid characters in input')
    }
    return sanitized
  },
}
