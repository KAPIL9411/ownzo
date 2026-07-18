import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string | any): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date instanceof Date) {
    dateObj = date
  } else if (date && typeof date.toDate === 'function') {
    // Firestore Timestamp
    dateObj = date.toDate()
  } else if (date && typeof date.seconds === 'number') {
    // Firestore Timestamp-like object
    dateObj = new Date(date.seconds * 1000)
  } else {
    dateObj = new Date(date)
  }
  
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

export function formatRelativeTime(date: Date | string | any): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date instanceof Date) {
    dateObj = date
  } else if (date && typeof date.toDate === 'function') {
    // Firestore Timestamp
    dateObj = date.toDate()
  } else if (date && typeof date.seconds === 'number') {
    // Firestore Timestamp-like object
    dateObj = new Date(date.seconds * 1000)
  } else {
    dateObj = new Date(date)
  }
  
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(dateObj)
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Re-export shared utilities for convenience
export { calculateTrustScore, type TrustScoreData } from '@/shared/utils/trust-score'
export { getListingExpiryDays, isListingExpired } from '@/shared/utils/listing'
