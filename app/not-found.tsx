import Link from 'next/link'
import { Button } from '@/frontend/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-9xl font-extrabold text-primary/10">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-20 w-20 text-primary/30" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/listings">
              <Search className="h-5 w-5 mr-2" />
              Browse Listings
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t">
          <p className="text-sm text-muted-foreground mb-3">Quick Links:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/buy-requests" className="text-sm text-primary hover:underline">
              Buy Requests
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/community" className="text-sm text-primary hover:underline">
              Communities
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/profile" className="text-sm text-primary hover:underline">
              My Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
