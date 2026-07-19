import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  // Increase timeout for slow connections (default is 60s)
  timeout: 120000, // 2 minutes
  // Enable retry on network failures
  upload_timeout: 120000,
})

export default cloudinary
