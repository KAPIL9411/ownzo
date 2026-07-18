'use client'

import { useEffect } from 'react'
import { Button } from '@/frontend/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error)
    
    // In production, you would send this to error tracking service
    // Example: Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Something Went Wrong</h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Don't worry, our team has been notified and is working on it.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-left">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} size="lg">
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Error ID */}
        {error.digest && (
          <div className="pt-6 border-t">
            <p className="text-xs text-muted-foreground">
              Error ID: <code className="font-mono">{error.digest}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
