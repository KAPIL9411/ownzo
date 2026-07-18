import React from 'react'
import { sanitizeHtml, sanitizeRichText, sanitizeText } from '@/frontend/lib/sanitize'

interface SafeHtmlProps {
  /** The HTML content to sanitize and render */
  html: string
  /** Sanitization level: 'strict' (default), 'rich', or 'text-only' */
  level?: 'strict' | 'rich' | 'text-only'
  /** Optional CSS class name */
  className?: string
  /** Optional wrapper element (default: 'div') */
  as?: keyof JSX.IntrinsicElements
}

/**
 * 🔒 SECURITY: Safe HTML renderer with automatic XSS protection
 * 
 * This component sanitizes HTML content using DOMPurify before rendering.
 * Always use this instead of dangerouslySetInnerHTML for user-generated content.
 * 
 * @example
 * ```tsx
 * <SafeHtml html={listing.description} level="rich" />
 * <SafeHtml html={comment.text} level="strict" className="text-sm" />
 * ```
 */
export function SafeHtml({ 
  html, 
  level = 'strict', 
  className,
  as: Wrapper = 'div'
}: SafeHtmlProps) {
  const sanitized = React.useMemo(() => {
    switch (level) {
      case 'rich':
        return sanitizeRichText(html)
      case 'text-only':
        return sanitizeText(html)
      case 'strict':
      default:
        return sanitizeHtml(html)
    }
  }, [html, level])

  return (
    <Wrapper 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

/**
 * Simple text display component (strips all HTML)
 * Use when you want to display user content as plain text only
 */
export function SafeText({ 
  text, 
  className,
  as: Wrapper = 'span'
}: { 
  text: string
  className?: string
  as?: keyof JSX.IntrinsicElements 
}) {
  const sanitized = React.useMemo(() => sanitizeText(text), [text])
  
  return (
    <Wrapper 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
