import DOMPurify from 'dompurify'

/**
 * 🔒 SECURITY: Sanitize HTML content to prevent XSS attacks
 * 
 * This utility uses DOMPurify to sanitize user-generated HTML content
 * before rendering it in the browser. It removes dangerous tags and attributes
 * that could be used for XSS attacks.
 */

// Configure DOMPurify for strict sanitization
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'
]

const ALLOWED_ATTR = ['href', 'target', 'rel']

/**
 * Sanitize HTML content for safe rendering
 * Removes dangerous tags, attributes, and JavaScript
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (will be sanitized on client)
    return dirty
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false, // Prevent data-* attributes
    ALLOW_UNKNOWN_PROTOCOLS: false, // Only allow http, https, mailto
    SAFE_FOR_TEMPLATES: true, // Extra safety for template contexts
    RETURN_TRUSTED_TYPE: false,
  })
}

/**
 * Sanitize plain text (removes ALL HTML)
 * Use for fields that should never contain HTML
 */
export function sanitizeText(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize content for rich text display (more permissive)
 * Allows headings and formatting for blog posts, descriptions, etc.
 */
export function sanitizeRichText(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      ...ALLOWED_TAGS,
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [...ALLOWED_ATTR, 'src', 'alt', 'title', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  })
}

/**
 * Strip all HTML tags from a string
 * Returns plain text only
 */
export function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return html.replace(/<[^>]*>/g, '')
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}
