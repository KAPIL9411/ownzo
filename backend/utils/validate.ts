import { z, ZodError } from 'zod'
import { NextResponse } from 'next/server'

/**
 * Validation utility for Zod schemas
 * Provides consistent error handling and responses
 */

export class ValidationError extends Error {
  constructor(
    public errors: Array<{ field: string; message: string }>,
    message: string = 'Validation failed'
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validate data against a Zod schema
 * Throws ValidationError with formatted errors if validation fails
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      throw new ValidationError(formattedErrors)
    }
    throw error
  }
}

/**
 * Safe validation that returns { success, data, errors }
 * Does not throw - useful for optional validation
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const formattedErrors = result.error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }))
  
  return { success: false, errors: formattedErrors }
}

/**
 * Higher-order function to wrap API routes with validation
 * Automatically validates request body and returns 400 on error
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: Request, data: T, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any): Promise<NextResponse> => {
    try {
      const body = await req.json()
      const validatedData = validate(schema, body)
      return handler(req, validatedData, context)
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: error.errors,
          },
          { status: 400 }
        )
      }
      
      // Re-throw non-validation errors
      throw error
    }
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): T {
  // Convert URLSearchParams to object
  const params: Record<string, any> = {}
  searchParams.forEach((value, key) => {
    // Try to parse numbers and booleans
    if (value === 'true') params[key] = true
    else if (value === 'false') params[key] = false
    else if (!isNaN(Number(value)) && value !== '') params[key] = Number(value)
    else params[key] = value
  })
  
  return validate(schema, params)
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  errors?: Array<{ field: string; message: string }>,
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(errors && { details: errors }),
    },
    { status }
  )
}
