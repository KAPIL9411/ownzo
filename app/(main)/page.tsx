'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ListingService }    from '@/frontend/services/listing.service'
import { CategoryService }   from '@/frontend/services/category.service'
import { BuyRequestService } from '@/frontend/services/buyrequest.service'
import { CommunityService }  from '@/frontend/services/community.service'
import { useUserLocation }   from '@/frontend/hooks/useUserLocation'
import { ListingCard, ListingCardSkeleton } from '@/frontend/components/listings/ListingCard'
import { CommunityCard } from '@/frontend/components/community/CommunityCard'
import { LocationWidget } from '@/frontend/components/map/LocationWidget'
import Link from 'next/link'
import {
  ArrowRight, Plus, ShoppingBag, ChevronRight,
  Smartphone, Sofa, BookOpen, Shirt, Bike,
  Car, Home, Music2, Palette, UtensilsCrossed, Package,
  Navigation2, ShieldCheck, MessageCircle, TrendingDown, Star
} from 'lucide-react'
import { formatPrice, formatRelativeTime } from '@/frontend/lib/utils'
import { cn } from '@/frontend/lib/utils'

/* ─────────────────────────────────────────────────────────────
   Category card config — icon + accent colour per slug
───────────────────────────────────────────────────────────── */
const CAT_CONFIG: Record<string, {
  icon: React.ElementType
  accent: string      // icon container bg
  iconColor: string   // icon stroke/fill colour
}> = {
  electronics:          { icon: Smartphone,       accent: '#EFF6FF', iconColor: '#2563EB' },
  furniture:            { icon: Sofa,              accent: '#FFF7ED', iconColor: '#C2410C' },
  books:                { icon: BookOpen,          accent: '#F0FDF4', iconColor: '#16A34A' },
  clothing:             { icon: Shirt,             accent: '#FDF4FF', iconColor: '#A21CAF' },
  sports:               { icon: Bike,              accent: '#FFF1F2', iconColor: '#E11D48' },
  vehicles:             { icon: Car,               accent: '#F8FAFC', iconColor: '#475569' },
  'home-garden':        { icon: Home,              accent: '#ECFDF5', iconColor: '#059669' },
  'music-instruments':  { icon: Music2,            accent: '#F5F3FF', iconColor: '#7C3AED' },
  'art-crafts':         { icon: Palette,           accent: '#FFF7ED', iconColor: '#EA580C' },
  kitchen:              { icon: UtensilsCrossed,   accent: '#F0FDFA', iconColor: '#0D9488' },
  others:               { icon: Package,           accent: '#F1F5F9', iconColor: '#64748B' },
}

const FALLBACK_ACCENTS = [
  { accent: '#EFF6FF', iconColor: '#2563EB' },
  { accent: '#F0FDF4', iconColor: '#16A34A' },
  { accent: '#FDF4FF', iconColor: '#A21CAF' },
  { accent: '#FFF1F2', iconColor: '#E11D48' },
  { accent: '#FFF7ED', iconColor: '#C2410C' },
  { accent: '#F5F3FF', iconColor: '#7C3AED' },
]



/* Reference tabs */
const DEAL_TABS = [
  { value: 'all',      label: 'All Products' },
  { value: 'new',      label: 'New Items' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good',     label: 'Good Condition' },
  { value: 'fair',     label: 'Fair Price' },
]

export default function HomePage() {
  const [dealTab, setDealTab] = useState('all')
  const { location: userLocation } = useUserLocation()
  const detectedCity = userLocation?.city ?? ''

  const { data: recentData,  isLoading: recentLoading }  = useQuery({
    queryKey: ['listings', 'recent'],
    queryFn:  () => ListingService.getListings({ limit: 4, sortBy: 'recent' }),
  })
  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['listings', 'popular'],
    queryFn:  () => ListingService.getListings({ limit: 8, sortBy: 'popular' }),
  })
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => CategoryService.getCategories(),
  })
  const { data: buyReqData } = useQuery({
    queryKey: ['buy-requests', 'home'],
    queryFn:  () => BuyRequestService.getBuyRequests({ limit: 3 }),
  })
  const { data: communitiesData } = useQuery({
    queryKey: ['communities'],
    queryFn:  () => CommunityService.getCommunities(),
  })

  const recent      = recentData?.data?.data     ?? []
  const popular     = popularData?.data?.data    ?? []
  const categories  = categoriesData?.data       ?? []
  const buyReqs     = buyReqData?.data?.data     ?? []

  // Filter communities by detected city
  const allComms    = communitiesData?.data ?? []
  const nearbyCommunities = detectedCity 
    ? allComms.filter((c) => c.city.toLowerCase() === detectedCity.toLowerCase())
    : []
  
  // Show nearby communities if any exist, otherwise show all communities
  const communities = nearbyCommunities.length > 0 
    ? nearbyCommunities.slice(0, 8)
    : allComms.slice(0, 8)

  const dealListings = dealTab === 'all'
    ? popular
    : popular.filter(l => l.condition === dealTab)

  return (
    <div>

      {/* ═══════════════════════════════════════════════════════
          HERO — Person's head extends above the red box
          Mobile: No person image, simplified layout
          Tablet: Show person, adjusted sizing
          Desktop: Full layout with extended person
          ═══════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '2rem', marginTop: '-1rem' }} className="sm:mb-12">
        <section className="relative rounded-xl sm:rounded-2xl"
                 style={{ 
                   background:'#721C1C', 
                   minHeight: 'clamp(280px, 50vw, 380px)',
                   overflow:'visible' 
                 }}>

        {/* Maroon swirl texture background */}
        <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none select-none rounded-xl sm:rounded-2xl"
             style={{
               backgroundImage: `url('/images/hero/texture-maroon-swirl.svg')`,
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat',
             }}
        />

        <div className="relative z-10 flex items-center justify-between h-full" 
             style={{ minHeight: 'clamp(280px, 50vw, 380px)' }}>

          {/* Left — text content */}
          <div className="px-6 py-8 sm:px-10 sm:py-12 max-w-full md:max-w-lg">
            {/* Small badge */}
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm" 
                 style={{ background:'rgba(255,255,255,0.15)' }}>
              <span className="text-white font-bold">• Free to Use • No Commission</span>
            </div>

            {/* Headline — responsive sizing */}
            <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[2.8rem] lg:text-[3.2rem] font-extrabold text-white leading-[1.15] mb-3 sm:mb-4">
              Buy & Sell in{' '}
              <span style={{ color:'#F97316' }}>Your</span>
              <br />Community
            </h1>

            <p className="text-white/85 text-[13px] sm:text-[15px] mb-6 sm:mb-8 leading-relaxed max-w-md">
              Connect with people in your community to buy, sell, and trade items safely. 
              Post listings or find what you need in your neighborhood.
            </p>

            {/* Orange CTA button */}
            <Link href="/listings"
              className="inline-flex items-center gap-2 rounded-lg font-bold text-white text-sm sm:text-[15px] px-5 sm:px-7 py-2.5 sm:py-3.5 hover:opacity-90 transition-opacity shadow-lg"
              style={{ background:'#F97316' }}>
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right — person image with head extending above container */}
          {/* Hidden on mobile (<768px), visible on tablet+ */}
          <div className="hidden md:block absolute right-4 lg:right-8 z-20" 
               style={{ 
                 bottom: '0',
                 height: 'clamp(400px, 45vw, 520px)',
                 width: 'auto'
               }}>
            <img
              src="/images/hero/person-with-package.webp"
              alt="Person holding package and tablet"
              className="h-full w-auto object-contain object-bottom"
              style={{ 
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        </div>
      </section>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SHOP BY CATEGORIES — Responsive grid
          Mobile: 2 columns with horizontal scroll
          Tablet: 3-4 columns
          Desktop: 5+ columns with scroll
          ═══════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Shop by categories</h2>
            <Link href="/listings" className="view-all-link text-xs sm:text-sm">
              All Categories <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Link>
          </div>

          {/* Single unified scrollable row for all breakpoints */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {categories.map((cat, idx) => {
              const fallback = FALLBACK_ACCENTS[idx % FALLBACK_ACCENTS.length]
              const cfg = CAT_CONFIG[(cat as any).slug] ?? {
                icon: Package,
                accent: fallback.accent,
                iconColor: fallback.iconColor,
              }
              const Icon = cfg.icon

              return (
                <Link
                  key={cat.id}
                  href={`/listings?categoryId=${cat.id}`}
                  className="group shrink-0 flex flex-col items-center gap-3 transition-all duration-200
                             hover:-translate-y-1 active:scale-95"
                  style={{ width: 88 }}
                >
                  {/* Icon container */}
                  <div
                    className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center
                               transition-all duration-200 group-hover:shadow-lg"
                    style={{
                      background: cfg.accent,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  >
                    <Icon
                      className="h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-200 group-hover:scale-110"
                      style={{ color: cfg.iconColor }}
                      strokeWidth={1.75}
                    />
                  </div>
                  {/* Label */}
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-600 text-center leading-tight
                                   group-hover:text-gray-900 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}


      {/* ═══════════════════════════════════════════════════════
          LIMITED / RECENT LISTINGS
          Mobile: 2 columns | Tablet: 3 columns | Desktop: 4 columns
          ═══════════════════════════════════════════════════════ */}
      <section className="mb-8 sm:mb-14">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="section-title">Recently Listed</h2>
          <Link href="/listings" className="view-all-link text-xs sm:text-sm">
            View All <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
        </div>

        {recentLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_,i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
            <ShoppingBag className="h-12 w-12 sm:h-14 sm:w-14 text-gray-200 mb-3 sm:mb-4" />
            <p className="font-bold text-sm sm:text-base text-gray-400 mb-1">No listings yet</p>
            <p className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-5">Be the first to sell in your community</p>
            <Link href="/listings/create" className="btn-orange rounded-lg px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Create a Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {recent.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          PROMO BANNERS — Responsive layout
          Mobile: Stack vertically | Desktop: 2 columns
          ═══════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-14">

        {/* Left — green */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl flex flex-col justify-between p-6 sm:p-8"
             style={{ background:'#166534', minHeight: 180 }}>
          {/* Decorative icon */}
          <div className="absolute -bottom-4 right-4 text-[80px] sm:text-[120px] opacity-20 select-none pointer-events-none leading-none">
            🛍️
          </div>
          <div className="relative z-10">
            <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest mb-2"
               style={{ color:'var(--c-orange)' }}>
              COMMUNITY MARKETPLACE! GET 100% FREE
            </p>
            <h3 className="text-white text-lg sm:text-2xl font-extrabold leading-tight mb-1">
              Ownzo connects<br />
              <span style={{ color:'var(--c-orange)' }}>buyers & sellers</span><br />
              in your community
            </h3>
          </div>
          <Link href="/listings"
            className="relative z-10 mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-lg bg-white font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 w-fit transition-all hover:bg-gray-100"
            style={{ color:'#166534' }}>
            Shop Now <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>

        {/* Right — orange gift-box style */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-6 sm:p-8 text-center"
             style={{ background:'linear-gradient(135deg,#F97316 0%,#EA580C 100%)', minHeight: 180 }}>
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <div className="absolute -bottom-8 -right-8 h-32 w-32 sm:h-40 sm:w-40 rounded-full"
                 style={{ background:'rgba(255,255,255,0.1)' }} />
            <div className="absolute -top-6 -left-6 h-24 w-24 sm:h-28 sm:w-28 rounded-full"
                 style={{ background:'rgba(255,255,255,0.08)' }} />
          </div>
          <div className="relative z-10">
            <div className="text-5xl sm:text-6xl mb-2 sm:mb-3 leading-none">🎁</div>
            <h3 className="text-white font-extrabold text-2xl sm:text-3xl leading-tight mb-1">
              Post a Request
            </h3>
            <p className="text-white/80 font-bold text-base sm:text-lg">Let Sellers Come to You</p>
          </div>
          <Link href="/buy-requests/create"
            className="relative z-10 mt-4 sm:mt-5 inline-flex items-center gap-2 rounded-lg font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-2 sm:py-2.5 transition-all"
            style={{ background:'#7C1D1D', color:'#fff' }}>
            Post Request <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TODAY'S BEST DEALS — Responsive with tabs
          Mobile: Hide some tabs, 2 columns | Tablet: 3 columns | Desktop: 4 columns
          ═══════════════════════════════════════════════════════ */}
      <section className="mb-8 sm:mb-14">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="section-title">Today best deals for you!</h2>
          <Link href="/listings?sortBy=popular" className="view-all-link text-xs sm:text-sm">
            View All <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
        </div>

        {/* Tab pills — responsive */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4 sm:mb-5">
          {DEAL_TABS.map(tab => (
            <button key={tab.value} onClick={() => setDealTab(tab.value)}
              className={cn(
                'shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-bold border transition-all',
                dealTab === tab.value
                  ? 'text-white border-[#1B4332]'
                  : 'text-gray-500 bg-white border-gray-200 hover:border-[#1B4332]/40 hover:text-[#1B4332]'
              )}
              style={dealTab === tab.value ? { background:'var(--c-green)' } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {popularLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_,i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {(dealListings.length ? dealListings : popular).map(l => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          BUY REQUESTS — Responsive grid
          Mobile: 1 column | Tablet: 2 columns | Desktop: 3 columns
          ═══════════════════════════════════════════════════════ */}
      {buyReqs.length > 0 && (
        <section className="mb-8 sm:mb-14">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="section-title">Active Buy Requests</h2>
            <Link href="/buy-requests" className="view-all-link text-xs sm:text-sm">
              View All <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {buyReqs.map(req => (
              <div key={req.id}
                className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 hover:border-[#1B4332]/30 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="badge-sale">Active Request</span>
                  <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">{formatRelativeTime(req.createdAt)}</span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-[15px] leading-snug line-clamp-2 mb-2 sm:mb-3">{req.title}</h3>
                <p className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
                  {formatPrice(req.budget)}
                  {req.negotiable && (
                    <span className="text-xs sm:text-sm font-semibold text-gray-400 ml-1 line-through">
                      {formatPrice(Math.round(req.budget * 1.15))}
                    </span>
                  )}
                </p>
                <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium mt-2">{req.city}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          COMMUNITIES SECTION — Responsive grid
          Mobile: 1 column | Tablet: 2 columns | Desktop: 4 columns
          ═══════════════════════════════════════════════════════ */}
      {communities.length > 0 && (
        <section className="mb-8 sm:mb-14">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="section-title">
                {nearbyCommunities.length > 0 
                  ? `Communities near ${detectedCity}` 
                  : 'Popular Communities'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                {nearbyCommunities.length > 0 ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1B4332] animate-pulse inline-block" />
                    Found {nearbyCommunities.length} communit{nearbyCommunities.length === 1 ? 'y' : 'ies'} in your area
                  </>
                ) : detectedCity ? (
                  <>No communities in {detectedCity} yet • Explore other areas</>
                ) : (
                  'Buy & sell with people in different communities'
                )}
              </p>
            </div>
            <Link href="/community" className="view-all-link text-xs sm:text-sm shrink-0">
              All <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {communities.map((community) => (
              <CommunityCard key={community.id} community={community} compact />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          STATS + CTA BANNER — Responsive layout
          Mobile: Stack vertically | Desktop: 2 columns
          ═══════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-14 rounded-xl sm:rounded-2xl overflow-hidden">
        {/* Left crimson */}
        <div className="relative overflow-hidden flex flex-col justify-between p-6 sm:p-10"
             style={{ background:'#B91C1C', minHeight: 200 }}>
          <div className="absolute -bottom-4 left-1/2 text-[80px] sm:text-[100px] opacity-10 select-none pointer-events-none leading-none">
            🏪
          </div>
          <div className="relative z-10">
            <h2 className="text-[1.5rem] sm:text-[1.9rem] font-extrabold text-white leading-tight mb-2 sm:mb-3">
              We{' '}
              <span style={{ color:'var(--c-orange)' }}>connect</span>
              {' '}buyers & sellers<br />
              across{' '}
              <span style={{ color:'var(--c-orange)' }}>your community</span>
            </h2>
            <p className="text-white/70 text-xs sm:text-sm max-w-xs leading-relaxed">
              List items for free. No fees, no commission. Trusted by thousands of people in local communities.
            </p>
          </div>
          <Link href="/listings"
            className="relative z-10 mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-lg bg-white font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 w-fit hover:bg-gray-50 transition-all"
            style={{ color:'#B91C1C' }}>
            Start Browsing <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>

        {/* Right dark-green — stats grid */}
        <div className="flex items-center justify-center p-6 sm:p-10"
             style={{ background:'#14532D' }}>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 sm:gap-y-6 sm:gap-x-10 text-white text-center">
            {[
              { n:'2.4K', l:'Active Listings' },
              { n:'8.5K', l:'Members'         },
              { n:'12K',  l:'Deals Closed'    },
              { n:'4.8★', l:'Avg Rating'      },
            ].map(({ n, l }) => (
              <div key={l}>
                <p className="text-[2rem] sm:text-[2.6rem] font-extrabold leading-none" style={{ color:'var(--c-orange)' }}>{n}</p>
                <p className="text-xs sm:text-sm text-white/60 font-semibold mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LOCATION WIDGET — Responsive layout
          Mobile: Stack vertically | Desktop: 2 columns
          ═══════════════════════════════════════════════════════ */}
      <section className="mb-8 sm:mb-14">
        <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
             style={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Left — text */}
            <div className="flex flex-col justify-center px-6 py-6 sm:px-10 sm:py-10">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 rounded-full w-fit"
                   style={{ background: 'rgba(27,67,50,0.1)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#1B4332] animate-pulse" />
                <span className="text-xs font-bold text-[#1B4332]">Live Location</span>
              </div>
              <h2 className="text-[1.4rem] sm:text-[1.7rem] font-extrabold text-gray-900 leading-tight mb-2 sm:mb-3">
                Discover Items<br />
                <span style={{ color: '#1B4332' }}>Near You</span>
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-sm mb-4 sm:mb-0">
                See your current location and find local deals in your community.
                Listings are sorted by distance to show you the closest items first.
              </p>

              {/* Mini stats */}
              <div className="flex gap-4 sm:gap-6 mt-4 sm:mt-6">
                {[
                  { n: '2.4K', l: 'Nearby listings' },
                  { n: '< 5km', l: 'Avg distance' },
                ].map(({ n, l }) => (
                  <div key={l}>
                    <p className="text-lg sm:text-xl font-extrabold text-[#1B4332]">{n}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — widget */}
            <div className="p-4 sm:p-6 lg:p-8">
              <LocationWidget />
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          QUALITY / FEATURES STRIP — Responsive grid
          Mobile: 2 columns | Tablet: 3 columns | Desktop: 5 columns
          ═══════════════════════════════════════════════════════ */}
      <section className="mb-8 sm:mb-14">
        <h2 className="text-[1.4rem] sm:text-[1.7rem] font-extrabold text-center mb-1" style={{ color:'#1B4332' }}>
          We Provide the{' '}
          <span style={{ color:'var(--c-orange)' }}>Best Quality</span>
          <br className="hidden sm:inline" />
          <span className="sm:hidden"> </span>in All of Your Community
        </h2>
        <p className="text-center text-xs sm:text-[13px] text-gray-400 font-medium mb-6 sm:mb-10 max-w-md mx-auto px-4">
          Offering a seamless, trusted marketplace experience since 2024 with safety, community, and value.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { icon: ShieldCheck,    title:'Verified Sellers',  sub:'Trust scores & reviews',  color:'#16a34a' },
            { icon: MessageCircle,  title:'Direct Chat',       sub:'Talk instantly to sellers', color:'#0284c7' },
            { icon: TrendingDown,   title:'Make Offers',       sub:'Negotiate any price',     color:'#f97316' },
            { icon: Package,        title:'Buy Requests',      sub:'Post & find anything',    color:'#8b5cf6' },
            { icon: Star,           title:'Ratings System',    sub:'Community-driven trust',  color:'#eab308' },
          ].map(({ icon: Icon, title, sub, color }) => (
            <div key={title}
              className="flex flex-col items-center text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 bg-white hover:border-[#1B4332]/25 hover:shadow-sm transition-all group">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-all group-hover:scale-110"
                   style={{ background: `${color}15` }}>
                <Icon className="h-6 w-6 sm:h-8 sm:w-8" style={{ color }} strokeWidth={1.8} />
              </div>
              <p className="font-extrabold text-xs sm:text-[13px] text-[#1A1A1A] leading-snug mb-1">{title}</p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium">{sub}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
