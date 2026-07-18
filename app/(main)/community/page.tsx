'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CommunityService } from '@/frontend/services/community.service'
import { CommunityCard } from '@/frontend/components/community/CommunityCard'
import { EmptyState } from '@/frontend/components/ui/empty-state'
import { useToast } from '@/frontend/components/ui/toast'
import { useUserLocation } from '@/frontend/hooks/useUserLocation'
import { CommunityType } from '@/shared/types'
import {
  Users, GraduationCap, Building2, MapPin, Home,
  Search, X, Loader2, Navigation2, ChevronDown, AlertCircle,
} from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

const TYPE_FILTERS: { value: CommunityType | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all',       label: 'All',        icon: Users        },
  { value: 'college',   label: 'Colleges',   icon: GraduationCap},
  { value: 'locality',  label: 'Localities', icon: MapPin       },
  { value: 'apartment', label: 'Apartments', icon: Building2    },
  { value: 'society',   label: 'Societies',  icon: Home         },
]

/* ── Skeleton ──────────────────────────────────────────────── */
function CommunitySkeleton() {
  return (
    <div className="rounded-2xl border bg-white overflow-hidden animate-pulse">
      <div className="h-24 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex justify-between items-center mt-2">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded-lg w-16" />
        </div>
      </div>
    </div>
  )
}

export default function CommunitiesPage() {
  const [typeFilter, setTypeFilter] = useState<CommunityType | 'all'>('all')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [showAllOthers, setShowAllOthers] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  /* ── Location ─────────────────────────────────────────── */
  const { location, loading: locLoading, error: locError, refresh: refreshLocation } = useUserLocation()
  const detectedCity = location?.city ?? ''

  /* ── Data ─────────────────────────────────────────────── */
  const { data, isLoading } = useQuery({
    queryKey: ['communities', 'all'],
    queryFn:  () => CommunityService.getCommunities(),
  })
  const allCommunities = data?.data ?? []

  /* ── Split: nearby vs others ──────────────────────────── */
  const { nearby, others } = useMemo(() => {
    if (!detectedCity) return { nearby: [], others: allCommunities }
    const cityLower = detectedCity.toLowerCase()
    return {
      nearby: allCommunities.filter((c) => c.city.toLowerCase() === cityLower),
      others: allCommunities.filter((c) => c.city.toLowerCase() !== cityLower),
    }
  }, [allCommunities, detectedCity])

  /* ── Apply type + search filters ─────────────────────── */
  function applyFilters(list: typeof allCommunities) {
    return list.filter((c) => {
      const matchesType   = typeFilter === 'all' || c.type === typeFilter
      const matchesSearch = !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }

  const filteredNearby = applyFilters(nearby)
  const filteredOthers = applyFilters(others)
  const visibleOthers  = showAllOthers ? filteredOthers : filteredOthers.slice(0, 8)

  /* ── Mutations ────────────────────────────────────────── */
  const joinMutation = useMutation({
    mutationFn: (id: string) => CommunityService.joinCommunity(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      toast({ type: 'success', title: res.message || 'Joined community!' })
    },
    onError: () => toast({ type: 'error', title: 'Failed to join community' }),
  })

  const leaveMutation = useMutation({
    mutationFn: (id: string) => CommunityService.leaveCommunity(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      toast({ type: 'success', title: res.message || 'Left community' })
    },
    onError: () => toast({ type: 'error', title: 'Failed to leave community' }),
  })

  const mutating = joinMutation.isPending || leaveMutation.isPending

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="section-title">Communities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buy &amp; sell with people in your neighbourhood, college, or society
          </p>
        </div>

        {/* Live location pill */}
        <div className="shrink-0">
          {locLoading ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#1B4332]" />
              Detecting location...
            </div>
          ) : location ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1B4332]/30
                            bg-green-50 text-sm font-semibold text-[#1B4332]">
              <span className="h-2 w-2 rounded-full bg-[#1B4332] animate-pulse" />
              {location.display}
              <button
                onClick={refreshLocation}
                className="ml-1 text-[#1B4332]/60 hover:text-[#1B4332] transition-colors"
                title="Update location"
              >
                <Navigation2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={refreshLocation}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300
                         text-sm font-medium text-gray-600 hover:border-[#1B4332]/50 hover:bg-green-50
                         hover:text-[#1B4332] transition-all"
            >
              <MapPin className="h-4 w-4" />
              Enable location
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: allCommunities.length },
          { label: 'Near you', value: nearby.length },
          { label: 'Verified', value: allCommunities.filter((c) => c.verified).length },
          { label: 'Cities',   value: new Set(allCommunities.map((c) => c.city)).size },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-white px-4 py-3 flex items-center gap-3">
            <p className="text-2xl font-extrabold text-[#1B4332]">{value}</p>
            <p className="text-xs text-gray-500 font-medium leading-tight">{label}<br />communities</p>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Type pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TYPE_FILTERS.map(({ value, label, icon: Icon }) => {
            const count = value === 'all'
              ? allCommunities.length
              : allCommunities.filter((c) => c.type === value).length
            return (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-1.5',
                  typeFilter === value
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B4332]/40'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {count > 0 && <span className="text-xs opacity-70">({count})</span>}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or city..."
            className="w-full h-10 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-9
                       text-sm placeholder:text-gray-400 outline-none focus:border-gray-300
                       focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Location permission error ───────────────────────── */}
      {locError && !location && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Location unavailable</p>
            <p className="text-xs text-amber-600 mt-0.5">{locError}</p>
          </div>
          <button
            onClick={refreshLocation}
            className="shrink-0 text-xs font-bold text-amber-700 hover:text-amber-900 underline"
          >
            Try again
          </button>
        </div>
      )}

      {isLoading ? (
        /* ── Loading skeletons ─────────────────────────────── */
        <div className="space-y-8">
          <section>
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <CommunitySkeleton key={i} />)}
            </div>
          </section>
          <section>
            <div className="h-6 bg-gray-200 rounded w-56 mb-4 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <CommunitySkeleton key={i} />)}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── NEARBY COMMUNITIES ──────────────────────────── */}
          {detectedCity && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#1B4332] flex items-center justify-center">
                    <Navigation2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-lg text-gray-900">
                      Near you in {detectedCity}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {filteredNearby.length} communit{filteredNearby.length === 1 ? 'y' : 'ies'} found
                    </p>
                  </div>
                </div>
              </div>

              {filteredNearby.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                  <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-500 mb-1">No communities in {detectedCity} yet</p>
                  <p className="text-sm text-gray-400">
                    Browse all communities below or check back later
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredNearby.map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      onJoin={(id) => joinMutation.mutate(id)}
                      onLeave={(id) => leaveMutation.mutate(id)}
                      isLoading={mutating}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── DIVIDER ─────────────────────────────────────── */}
          {detectedCity && filteredOthers.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                More communities
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {/* ── OTHER / ALL COMMUNITIES ─────────────────────── */}
          <section>
            {detectedCity && filteredOthers.length > 0 && (
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-extrabold text-lg text-gray-900">Explore other cities</h2>
                  <p className="text-xs text-gray-400">{filteredOthers.length} communities across India</p>
                </div>
              </div>
            )}

            {/* No location — show all with heading */}
            {!detectedCity && (
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-extrabold text-lg text-gray-900">All Communities</h2>
                  <p className="text-xs text-gray-400">{filteredOthers.length} communities</p>
                </div>
              </div>
            )}

            {filteredOthers.length === 0 && !detectedCity ? (
              <EmptyState
                icon={Users}
                title="No communities found"
                description={searchQuery ? `No results for "${searchQuery}"` : 'Communities will appear here'}
                action={searchQuery ? { label: 'Clear search', onClick: () => setSearchQuery('') } : undefined}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {visibleOthers.map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      onJoin={(id) => joinMutation.mutate(id)}
                      onLeave={(id) => leaveMutation.mutate(id)}
                      isLoading={mutating}
                    />
                  ))}
                </div>

                {/* Show more / less toggle */}
                {filteredOthers.length > 8 && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setShowAllOthers(!showAllOthers)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200
                                 text-sm font-semibold text-gray-700 hover:border-[#1B4332]/50
                                 hover:bg-green-50 hover:text-[#1B4332] transition-all"
                    >
                      <ChevronDown className={cn('h-4 w-4 transition-transform', showAllOthers && 'rotate-180')} />
                      {showAllOthers
                        ? 'Show less'
                        : `Show ${filteredOthers.length - 8} more communities`}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
