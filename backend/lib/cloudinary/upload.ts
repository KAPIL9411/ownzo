import cloudinary from './config'

interface UploadOptions {
  folder?: string
  transformation?: any[]
  resourceType?: 'image' | 'video' | 'raw' | 'auto'
}

/**
 * Retry logic for network failures
 */
async function retryUpload<T>(
  uploadFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on validation errors (400) or auth errors (401, 403)
      if (error.http_code && [400, 401, 403].includes(error.http_code)) {
        throw error
      }
      
      console.warn(`Upload attempt ${attempt} failed:`, error.message)
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt - 1)
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

export async function uploadImage(
  file: string,
  options: UploadOptions = {}
): Promise<any> {
  try {
    const result = await retryUpload(async () => {
      return await cloudinary.uploader.upload(file, {
        folder: options.folder || 'ownzo',
        resource_type: options.resourceType || 'image',
        transformation: options.transformation || [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
        // Cloudinary-specific upload options for reliability
        timeout: 120000, // 2 minutes
        chunk_size: 6000000, // 6MB chunks for large files
      })
    })

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', {
      message: error.message,
      code: error.http_code,
      error: error.error?.message || error.message,
    })
    
    // Provide more specific error messages
    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      throw new Error('Upload timeout - please check your internet connection and try again')
    }
    if (error.message?.includes('ECONNRESET') || error.message?.includes('ENOTFOUND')) {
      throw new Error('Network error - please check your internet connection')
    }
    if (error.http_code === 400) {
      throw new Error('Invalid image file - please check the file format')
    }
    if (error.http_code === 401 || error.http_code === 403) {
      throw new Error('Upload authentication failed - please contact support')
    }
    
    throw new Error('Failed to upload image - please try again')
  }
}

export async function uploadVideo(
  file: string,
  options: UploadOptions = {}
): Promise<any> {
  try {
    const result = await retryUpload(async () => {
      return await cloudinary.uploader.upload(file, {
        folder: options.folder || 'ownzo/videos',
        resource_type: 'video',
        transformation: options.transformation || [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto' },
        ],
        // Video-specific options
        timeout: 180000, // 3 minutes for videos
        chunk_size: 6000000, // 6MB chunks
      })
    })

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    }
  } catch (error: any) {
    console.error('Cloudinary video upload error:', {
      message: error.message,
      code: error.http_code,
    })
    
    // Provide more specific error messages
    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      throw new Error('Video upload timeout - file may be too large')
    }
    if (error.message?.includes('ECONNRESET') || error.message?.includes('ENOTFOUND')) {
      throw new Error('Network error - please check your internet connection')
    }
    
    throw new Error('Failed to upload video - please try again')
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete image')
  }
}

export function getOptimizedUrl(
  url: string,
  width?: number,
  height?: number
): string {
  if (!url || !url.includes('cloudinary.com')) return url

  const transformation = `w_${width || 800},h_${height || 800},c_limit,q_auto,f_auto`
  const parts = url.split('/upload/')
  
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformation}/${parts[1]}`
  }
  
  return url
}
