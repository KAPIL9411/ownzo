import { NextResponse } from 'next/server'

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
