'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { CommunityService } from '@/frontend/services/community.service'
import { ListingService } from '@/frontend/services/listing.service'
import { ListingCard, ListingCardSkeleton } from '@/frontend/components/listings/ListingCard'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { Button } from '@/frontend/components/ui/button'
import { useToast } from '@/frontend/components/ui/toast'
import Link from 'next/link'
import { 
  Users, MapPin, GraduationCap, Building2, Home, CheckCircle2, 
  ArrowLeft, Package, ChevronRight 
} from 'lucide-react'
import { CommunityType } from '@/shared/types'

const TYPE_CONFIG: Record<CommunityType, { icon: React.ElementType; label: string; gradient: string }> = {
  college:   { icon: GraduationCap, label: 'College',   gradient: 'linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)' },
  locality:  { icon: MapPin,        label: 'Locality',  gradient: 'linear-gradient(135deg,#14532d 0%,#16a34a 100%)' },
  apartment: { icon: Building2,     label: 'Apartment', gradient: 'linear-gradient(135deg,#7c2d12 0%,#ea580c 100%)' },
  society:   { icon: Home,          label: 'Society',   gradient: 'linear-gradient(135deg,#4a044e 0%,#9333ea 100%)' },
}

export default function CommunityDetailPage() {
  const params = useParams()
  const communityId = params.id as string
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: communityData, isLoading: communityLoading } = useQuery({
    queryKey: ['community', communityId],
    queryFn: () => CommunityService.getCommunityById(communityId),
  })

  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['listings', { communityId }],
    queryFn: () => ListingService.getListings({ communityId, limit: 24 }),
  })

  const joinMutation = useMutation({
    mutationFn: () => CommunityService.joinCommunity(communityId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId] })
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      toast({ type: 'success', title: res.message || 'Joined community!' })
    },
    onError: () => toast({ type: 'error', title: 'Failed to join community' }),
  })

  const leaveMutation = useMutation({
    mutationFn: () => CommunityService.leaveCommunity(communityId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId] })
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      toast({ type: 'success', title: res.message || 'Left community' })
    },
    onError: () => toast({ type: 'error', title: 'Failed to leave community' }),
  })

  const community = communityData?.data
  const listings = listingsData?.data?.data ?? []
  const cfg = community ? TYPE_CONFIG[community.type] : TYPE_CONFIG.locality
  const Icon = cfg.icon

  if (communityLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-48 rounded-2xl bg-gray-200" />
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="max-w-4xl mx-auto py-20">
        <EmptyState
          icon={Users}
          title="Community not found"
          description="This community may have been removed or doesn't exist"
          action={{ label: 'Browse communities', href: '/community' }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back button */}
      <Link href="/community" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#1B4332] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Communities
      </Link>

      {/* Community header card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Gradient header */}
        <div className="relative h-32 overflow-hidden" style={{ background: cfg.gradient }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="p-detail" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" fillOpacity="0.12" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#p-detail)" />
          </svg>
          <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full"
               style={{ background: 'rgba(255,255,255,0.12)', filter: 'blur(20px)' }} />
        </div>

        {/* Content */}
        <div className="relative px-6 pb-6 -mt-10">
          {/* Icon */}
          <div className="inline-flex h-20 w-20 rounded-2xl shadow-lg border-4 border-white items-center justify-center mb-4"
               style={{ background: cfg.gradient }}>
            <Icon className="h-10 w-10 text-white" strokeWidth={1.5} />
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900">{community.name}</h1>
                {community.verified && (
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                )}
              </div>
              {community.college && (
                <p className="text-sm text-gray-500 mb-1">{community.college}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4" /> {cfg.label}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {community.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {community.members.toLocaleString()} members
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending || leaveMutation.isPending}
                className="bg-[#1B4332] hover:bg-[#2D6A4F]"
              >
                {joinMutation.isPending || leaveMutation.isPending ? 'Loading...' : 'Join Community'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Listings section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Community Listings</h2>
            <p className="text-sm text-muted-foreground">
              {listings.length} items available
            </p>
          </div>
          <Link
            href={`/listings?communityId=${communityId}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#1B4332] hover:underline"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {listingsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No listings yet"
            description="Be the first to post in this community"
            action={{ label: 'Create listing', href: '/listings/create' }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
