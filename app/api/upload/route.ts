import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { uploadImage, uploadVideo } from '@/backend/lib/cloudinary/upload'
import { errorHandler, ApiError } from '@/backend/middleware/error-handler'
import { uploadLimiter, withRateLimit } from '@/backend/middleware/rate-limit'
import { validateUploadedFile, checkUploadRateLimit } from '@/backend/middleware/upload-validator'

async function uploadHandler(req: NextRequest, { user }: any) {
  try {
    // Check upload rate limit for this user (20 uploads per hour)
    checkUploadRateLimit(user.uid, 20)
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'image'
    const folder = (formData.get('folder') as string) || 'ownzo'

    if (!file) {
      throw new ApiError(400, 'File required')
    }

    // Validate file type
    if (type !== 'image' && type !== 'video') {
      throw new ApiError(400, 'Invalid upload type. Must be "image" or "video"')
    }

    // Log upload attempt for debugging
    console.log(`Upload attempt: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) by user ${user.uid}`)

    // Comprehensive file validation
    const validatedFile = await validateUploadedFile(file, type)

    // Convert buffer to base64 data URL for Cloudinary
    const base64 = validatedFile.buffer.toString('base64')
    const dataUrl = `data:${validatedFile.mimeType};base64,${base64}`

    let result

    if (type === 'video') {
      result = await uploadVideo(dataUrl, { 
        folder: `${folder}/${user.uid}`,
        resourceType: 'video',
      })
    } else {
      result = await uploadImage(dataUrl, { 
        folder: `${folder}/${user.uid}`,
        transformation: [
          { width: 2000, crop: 'limit' }, // Max width 2000px
          { quality: 'auto' },
          { fetch_format: 'auto' }, // Serve WebP/AVIF when supported
        ],
      })
    }

    console.log(`Upload successful: ${result.secure_url}`)

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    })
  } catch (error: any) {
    // Log error details for debugging
    console.error('Upload error:', {
      message: error.message,
      stack: error.stack,
      userId: user?.uid,
    })
    
    // Return user-friendly error messages
    if (error instanceof ApiError) {
      return errorHandler(error)
    }
    
    // Handle Cloudinary-specific errors
    if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      return errorHandler(new ApiError(408, 'Upload timeout - please check your internet connection and try again'))
    }
    
    if (error.message?.includes('ECONNRESET') || error.message?.includes('ENOTFOUND') || error.message?.includes('Network error')) {
      return errorHandler(new ApiError(503, 'Network error - please check your internet connection and try again'))
    }
    
    return errorHandler(error)
  }
}

export const POST = requireAuth(withRateLimit(uploadLimiter, uploadHandler))
// Increase Vercel function timeout for uploads (if using Vercel Pro)
export const maxDuration = 60 // 60 seconds max
