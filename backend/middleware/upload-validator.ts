import { ApiError } from './error-handler'
import { adminDb } from '@/backend/lib/firebase-admin/config'

// Allowed file types and their magic bytes signatures
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

// File signature magic bytes for validation
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0], // JPEG JFIF
    [0xFF, 0xD8, 0xFF, 0xE1], // JPEG EXIF
    [0xFF, 0xD8, 0xFF, 0xE2], // JPEG
    [0xFF, 0xD8, 0xFF, 0xE3], // JPEG
  ],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (need to check WEBP after)
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
    [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
  ],
  'video/webm': [[0x1A, 0x45, 0xDF, 0xA3]], // EBML
}

interface UploadValidationOptions {
  maxSizeBytes: number
  allowedMimeTypes: string[]
}

export interface ValidatedFile {
  buffer: Buffer
  sanitizedName: string
  mimeType: string
  size: number
}

/**
 * Validate file magic bytes against known signatures
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType]
  if (!signatures) return false

  const fileHeader = Array.from(buffer.slice(0, 12))
  
  return signatures.some(signature => {
    return signature.every((byte, index) => {
      if (index >= fileHeader.length) return false
      return fileHeader[index] === byte
    })
  })
}

/**
 * Sanitize filename to prevent directory traversal and other attacks
 */
function sanitizeFileName(filename: string): string {
  // Remove path components
  let sanitized = filename.replace(/^.*[\\\/]/, '')
  
  // Remove or replace dangerous characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')
  
  // Prevent double extensions that might confuse systems
  sanitized = sanitized.replace(/\.{2,}/g, '.')
  
  // Limit length
  if (sanitized.length > 100) {
    const ext = sanitized.split('.').pop()
    const name = sanitized.substring(0, 100 - (ext?.length || 0) - 1)
    sanitized = `${name}.${ext}`
  }
  
  // Ensure it's not empty
  if (!sanitized || sanitized === '.') {
    sanitized = `file_${Date.now()}`
  }
  
  return sanitized
}

/**
 * Detect actual file type from buffer (more reliable than MIME type)
 */
function detectFileType(buffer: Buffer): string | null {
  const header = Array.from(buffer.slice(0, 12))
  
  // Check each known signature
  for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      const matches = signature.every((byte, index) => {
        if (index >= header.length) return false
        return header[index] === byte
      })
      
      if (matches) {
        // Special case for WebP - need to check WEBP string after RIFF
        if (mimeType === 'image/webp') {
          const webpSignature = [0x57, 0x45, 0x42, 0x50] // "WEBP"
          const webpMatch = webpSignature.every((byte, index) => {
            const offset = 8 + index
            return offset < buffer.length && buffer[offset] === byte
          })
          if (webpMatch) return mimeType
        } else {
          return mimeType
        }
      }
    }
  }
  
  return null
}

/**
 * Check for potential malicious content in files
 */
function scanForMaliciousContent(buffer: Buffer, mimeType: string): void {
  // Convert buffer to string for text-based checks
  const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000))
  
  // Check for common script injections
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /eval\s*\(/i,
    /expression\s*\(/i, // CSS expression
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ]
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      throw new ApiError(400, 'File contains potentially malicious content')
    }
  }
  
  // For images, check if they contain PHP or executable code
  if (mimeType.startsWith('image/')) {
    const executablePatterns = [
      /<\?php/i,
      /<%/,
      /#!/, // Shebang
    ]
    
    for (const pattern of executablePatterns) {
      if (pattern.test(content)) {
        throw new ApiError(400, 'Image file contains executable code')
      }
    }
  }
}

/**
 * Comprehensive file upload validation
 */
export async function validateUploadedFile(
  file: File,
  type: 'image' | 'video' = 'image'
): Promise<ValidatedFile> {
  // Determine validation options based on type
  const options: UploadValidationOptions = {
    maxSizeBytes: type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE,
    allowedMimeTypes: type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES,
  }

  // 1. Check if file exists
  if (!file) {
    throw new ApiError(400, 'No file provided')
  }

  // 2. Validate file size
  if (file.size === 0) {
    throw new ApiError(400, 'File is empty')
  }

  if (file.size > options.maxSizeBytes) {
    const maxSizeMB = Math.round(options.maxSizeBytes / (1024 * 1024))
    throw new ApiError(400, `File too large. Maximum size is ${maxSizeMB}MB`)
  }

  // 3. Validate MIME type (client-provided)
  if (!options.allowedMimeTypes.includes(file.type)) {
    throw new ApiError(
      400,
      `Invalid file type: ${file.type}. Allowed types: ${options.allowedMimeTypes.join(', ')}`
    )
  }

  // 4. Sanitize filename
  const sanitizedName = sanitizeFileName(file.name)

  // 5. Read file buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // 6. Validate file signature (magic bytes) - prevents renamed files
  const detectedType = detectFileType(buffer)
  
  if (!detectedType) {
    throw new ApiError(400, 'Could not verify file type from file signature')
  }

  if (!options.allowedMimeTypes.includes(detectedType)) {
    throw new ApiError(
      400,
      `File signature mismatch. File appears to be ${detectedType} but claims to be ${file.type}`
    )
  }

  // 7. Additional validation for specific types
  if (!validateMagicBytes(buffer, detectedType)) {
    throw new ApiError(400, 'File signature validation failed')
  }

  // 8. Scan for malicious content
  scanForMaliciousContent(buffer, detectedType)

  // 9. Additional size check for dimensions (could add image dimension validation here)
  // This would require image processing library like sharp

  return {
    buffer,
    sanitizedName,
    mimeType: detectedType,
    size: buffer.length,
  }
}

/**
 * Track upload counts per user to enforce rate limits
 */
export async function checkUploadRateLimit(userId: string, maxUploads: number = 20): Promise<void> {
  const now = Date.now()
  const hourInMs = 60 * 60 * 1000
  
  const userRef = adminDb.collection('uploadLimits').doc(userId)
  
  await adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(userRef)
    
    if (!doc.exists) {
      transaction.set(userRef, {
        count: 1,
        resetTime: now + hourInMs
      })
      return
    }
    
    const data = doc.data()!
    if (data.resetTime < now) {
      transaction.set(userRef, {
        count: 1,
        resetTime: now + hourInMs
      })
      return
    }
    
    if (data.count >= maxUploads) {
      const minutesRemaining = Math.ceil((data.resetTime - now) / (60 * 1000))
      throw new ApiError(
        429,
        `Upload limit reached. Please try again in ${minutesRemaining} minutes`
      )
    }
    
    transaction.update(userRef, {
      count: data.count + 1
    })
  })
}

export async function incrementUploadCount(userId: string): Promise<void> {
  const userRef = adminDb.collection('uploadLimits').doc(userId)
  const doc = await userRef.get()
  if (doc.exists && doc.data()!.resetTime > Date.now()) {
    await userRef.update({
      count: doc.data()!.count + 1
    })
  }
}
