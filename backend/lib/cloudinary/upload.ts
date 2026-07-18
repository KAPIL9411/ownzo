import cloudinary from './config'

interface UploadOptions {
  folder?: string
  transformation?: any[]
  resourceType?: 'image' | 'video' | 'raw' | 'auto'
}

export async function uploadImage(
  file: string,
  options: UploadOptions = {}
): Promise<any> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || 'ownzo',
      resource_type: options.resourceType || 'image',
      transformation: options.transformation || [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    })

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image')
  }
}

export async function uploadVideo(
  file: string,
  options: UploadOptions = {}
): Promise<any> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || 'ownzo/videos',
      resource_type: 'video',
      transformation: options.transformation || [
        { width: 1920, height: 1080, crop: 'limit' },
        { quality: 'auto' },
      ],
    })

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error('Cloudinary video upload error:', error)
    throw new Error('Failed to upload video')
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
