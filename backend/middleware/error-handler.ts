import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ValidationError } from '@/backend/utils/validate'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function errorHandler(error: any) {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: formattedErrors },
      { status: 400 }
    )
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: error.errors },
      { status: 400 }
    )
  }

  if (error.code === 'auth/id-token-expired') {
    return NextResponse.json(
      { success: false, error: 'Token expired' },
      { status: 401 }
    )
  }

  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}
