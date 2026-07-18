import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/backend/middleware/auth'
import { listingRepository } from '@/backend/repositories/listing.repository'
import { errorHandler } from '@/backend/middleware/error-handler'
import { requireCSRF } from '@/backend/middleware/csrf'
import { apiLimiter } from '@/backend/middleware/rate-limit'
import { listingFiltersSchema, createListingSchema } from '@/backend/schemas/listing.schema'
import { validateSafe } from '@/backend/utils/validate'

async function getHandler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    
    const filters = {
      categoryId: searchParams.get('categoryId') || undefined,
      city: searchParams.get('city') || undefined,
      communityId: searchParams.get('communityId') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      condition: searchParams.get('condition') as any || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') as any || 'recent',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      cursor: searchParams.get('cursor') || undefined,
    }

    const validationResult = validateSafe(listingFiltersSchema, filters)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid filters',
          details: validationResult.errors,
        },
        { status: 400 }
      )
    }

    const result = await listingRepository.getListings(validationResult.data)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return errorHandler(error)
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json()
    const validationResult = validateSafe(createListingSchema, body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid listing data',
          details: validationResult.errors,
        },
        { status: 400 }
      )
    }

    const listing = await listingRepository.createListing(user.uid, validationResult.data)

    return NextResponse.json(
      {
        success: true,
        data: listing,
      },
      { status: 201 }
    )
  } catch (error) {
    return errorHandler(error)
  }
}

export const GET = getHandler
export async function POST(req: NextRequest) {
  try {
    const result = await apiLimiter(req, async (req, context) => {
      const authResult = await requireAuth(async (req: NextRequest, authContext: any) => {
        return requireCSRF(postHandler)(req, authContext)
      })(req, context)
      return authResult
    }, {})
    
    return result
  } catch (error) {
    return errorHandler(error)
  }
}
