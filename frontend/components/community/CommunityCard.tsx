'use client'

import Link from 'next/link'
import { Community, CommunityType } from '@/shared/types'
import { Users, GraduationCap, Building2, MapPin, Home, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

/* ── Config per type ─────────────────────────────────────── */
const TYPE_CONFIG: Record<CommunityType, {
  icon: React.ElementType
  gradient: string
  label: string
  patternColor: string
}> = {
  college:   { icon: GraduationCap, gradient: 'linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)', label: 'College',   patternColor: 'rgba(255,255,255,0.08)' },
  locality:  { icon: MapPin,        gradient: 'linear-gradient(135deg,#14532d 0%,#16a34a 100%)', label: 'Locality',  patternColor: 'rgba(255,255,255,0.08)' },
  apartment: { icon: Building2,     gradient: 'linear-gradient(135deg,#7c2d12 0%,#ea580c 100%)', label: 'Apartment', patternColor: 'rgba(255,255,255,0.08)' },
  society:   { icon: Home,          gradient: 'linear-gradient(135deg,#4a044e 0%,#9333ea 100%)', label: 'Society',   patternColor: 'rgba(255,255,255,0.08)' },
}

interface CommunityCardProps {
  community: Community
  isMember?: boolean
  onJoin?: (id: string) => void
  onLeave?: (id: string) => void
  isLoading?: boolean
  compact?: boolean
}

export function CommunityCard({
  community,
  isMember = false,
  onJoin,
  onLeave,
  isLoading = false,
  compact = false,
}: CommunityCardProps) {
  const cfg = TYPE_CONFIG[community.type] ?? TYPE_CONFIG.locality
  const Icon = cfg.icon

  if (compact) {
    return (
      <Link
        href={`/community/${community.id}`}
        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white
                   hover:border-[#1B4332]/30 hover:shadow-sm transition-all group"
      >
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
             style={{ background: cfg.gradient }}>
          <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 truncate group-hover:text-[#1B4332] transition-colors">
            {community.name}
          </p>
          <p className="text-xs text-gray-400">
            {community.members.toLocaleString()} members · {cfg.label}
          </p>
        </div>
        {community.verified && (
          <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
        )}
      </Link>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white
                    hover:shadow-lg transition-all duration-200 group flex flex-col">
      {/* Coloured header band */}
      <div className="relative h-24 overflow-hidden" style={{ background: cfg.gradient }}>
        {/* Dot pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`p-${community.id}`} x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" fillOpacity="0.12" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#p-${community.id})`} />
        </svg>
        {/* Glow blob */}
        <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full"
             style={{ background: 'rgba(255,255,255,0.15)', filter: 'blur(12px)' }} />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold
                           bg-white/20 text-white border border-white/30 backdrop-blur-sm">
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
        </div>

        {/* Verified badge */}
        {community.verified && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold
                             bg-blue-500 text-white">
              <CheckCircle2 className="h-3 w-3" /> Verified
            </span>
          </div>
        )}

        {/* Large icon bottom-right */}
        <div className="absolute -bottom-3 right-4">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white"
               style={{ background: cfg.gradient }}>
            <Icon className="h-7 w-7 text-white" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 pt-5 flex-1 flex flex-col">
        <Link href={`/community/${community.id}`} className="group/title">
          <h3 className="font-extrabold text-[15px] text-gray-900 leading-tight mb-1
                         group-hover/title:text-[#1B4332] transition-colors">
            {community.name}
          </h3>
        </Link>

        {community.college && (
          <p className="text-xs text-gray-400 mb-1 truncate">{community.college}</p>
        )}
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {community.city}
        </p>

        <div className="flex items-center gap-3 mt-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            {community.members.toLocaleString()} members
          </div>

          <div className="ml-auto flex gap-2">
            <Link
              href={`/community/${community.id}`}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>

            {onJoin && onLeave && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  isMember ? onLeave(community.id) : onJoin(community.id)
                }}
                disabled={isLoading}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50',
                  isMember
                    ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                    : 'text-white hover:opacity-90'
                )}
                style={!isMember ? { background: '#1B4332' } : {}}
              >
                {isLoading ? '...' : isMember ? 'Leave' : 'Join'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
