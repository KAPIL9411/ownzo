import { NextRequest, NextResponse } from 'next/server'
import { categoryRepository } from '@/backend/repositories/category.repository'
import { errorHandler } from '@/backend/middleware/error-handler'
import { publicApiLimiter } from '@/backend/middleware/rate-limit'

async function handler(req: NextRequest) {
  try {
    const categories = await categoryRepository.getAllCategories()

    // If no categories exist, seed them
    if (categories.length === 0) {
      await categoryRepository.seedCategories()
      const seededCategories = await categoryRepository.getAllCategories()
      
      return NextResponse.json({
        success: true,
        data: seededCategories,
      })
    }

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

export async function GET(req: NextRequest) {
  return publicApiLimiter(req, handler, {})
}
