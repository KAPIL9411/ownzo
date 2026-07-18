'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ListingService } from '@/frontend/services/listing.service'
import { ListingCard, ListingCardSkeleton } from '@/frontend/components/listings/ListingCard'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { Button } from '@/frontend/components/ui/button'
import { Package, Plus, Pencil, Trash2, Eye, BarChart2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/frontend/lib/utils'
import { useState } from 'react'
import { ListingStatus, Listing } from '@/shared/types'
import { useToast } from '@/frontend/components/ui/toast'
import { formatPrice } from '@/frontend/lib/utils'

const STATUS_FILTERS: { value: ListingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'expired', label: 'Expired' },
]

export default function MyListingsPage() {
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => ListingService.getMyListings(),
  })

  const deleteMutation = useMutation({
    mutationFn: (listingId: string) => ListingService.deleteListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      toast({ type: 'success', title: 'Listing deleted successfully' })
      setDeletingId(null)
    },
    onError: () => {
      toast({ type: 'error', title: 'Failed to delete listing' })
      setDeletingId(null)
    },
  })

  const handleDelete = (listingId: string) => {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      setDeletingId(listingId)
      deleteMutation.mutate(listingId)
    }
  }

  const allListings = data?.data ?? []
  const listings = statusFilter === 'all'
    ? allListings
    : allListings.filter((l) => l.status === statusFilter)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">My Listings</h1>
          <p className="text-sm text-muted-foreground">{allListings.length} total</p>
        </div>
        <Button asChild>
          <Link href="/listings/create">
            <Plus className="h-4 w-4 mr-2" /> New Listing
          </Link>
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 border-b pb-0">
        {STATUS_FILTERS.map(({ value, label }) => {
          const count = value === 'all' ? allListings.length : allListings.filter((l) => l.status === value).length
          return (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                statusFilter === value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
              {count > 0 && <span className="ml-1.5 text-xs opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Package}
          title={statusFilter === 'all' ? 'No listings yet' : `No ${statusFilter} listings`}
          description={statusFilter === 'all' ? 'Create your first listing to start selling' : `You have no ${statusFilter} listings`}
          action={statusFilter === 'all' ? { label: 'Create listing', href: '/listings/create' } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <MyListingCard
              key={listing.id}
              listing={listing}
              onDelete={handleDelete}
              isDeleting={deletingId === listing.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface MyListingCardProps {
  listing: Listing
  onDelete: (id: string) => void
  isDeleting: boolean
}

function MyListingCard({ listing, onDelete, isDeleting }: MyListingCardProps) {
  const statusColors = {
    active: 'bg-green-50 text-green-700 border-green-200',
    sold: 'bg-gray-50 text-gray-600 border-gray-200',
    expired: 'bg-orange-50 text-orange-700 border-orange-200',
    deleted: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link href={`/listings/${listing.id}`} className="block relative aspect-square bg-gray-100">
        {listing.images?.[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-[10px] font-bold uppercase border',
            statusColors[listing.status]
          )}>
            {listing.status}
          </span>
        </div>

        {/* Views */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
          <Eye className="h-3 w-3 text-white" />
          <span className="text-[10px] font-bold text-white">{listing.views || 0}</span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/listings/${listing.id}`}>
          <h3 className="font-bold text-sm line-clamp-2 mb-2 hover:text-[#1B4332] transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-extrabold text-gray-900">
            {formatPrice(listing.price)}
          </span>
          {listing.negotiable && (
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              Negotiable
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500 mb-3">
          <p className="capitalize">{listing.condition} • {listing.city}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Created {new Date(listing.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            disabled={isDeleting}
          >
            <Link href={`/listings/${listing.id}/edit`}>
              <Pencil className="h-3 w-3 mr-1.5" />
              Edit
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={isDeleting}
          >
            <Link href={`/listings/${listing.id}/analytics`} title="Analytics">
              <BarChart2 className="h-3 w-3" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={isDeleting}
          >
            <Link href={`/listings/${listing.id}/passport`} title="Product Passport">
              <ShieldCheck className="h-3 w-3" />
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={() => onDelete(listing.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="h-3 w-3 mr-1.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3 w-3 mr-1.5" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
