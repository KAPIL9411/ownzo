'use client'

import { useRef, useEffect, useState } from 'react'
import { MapPin, ChevronDown, Navigation2, Loader2 } from 'lucide-react'
import { useUserLocation } from '@/frontend/hooks/useUserLocation'

export function LocationHeader() {
  const { location, loading, error, refresh } = useUserLocation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const label = loading
    ? 'Locating...'
    : location?.display || 'Set location'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200
                   hover:border-gray-300 transition-colors text-[13px] shrink-0"
      >
        {loading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: '#1B4332' }} />
          : <MapPin className="h-3.5 w-3.5" style={{ color: '#1B4332' }} />
        }
        <span className="text-gray-500 font-medium">Location:</span>
        <span className="font-bold text-gray-800 max-w-[120px] truncate">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-xl border border-gray-100 bg-white shadow-lg py-2 z-50">
          {/* Current location display */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-800 mb-0.5">Current Location</p>
            {location ? (
              <>
                <p className="text-sm font-semibold text-gray-700">{location.display}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                  {location.fullAddress}
                </p>
              </>
            ) : error ? (
              <p className="text-xs text-red-500">{error}</p>
            ) : (
              <p className="text-xs text-gray-400">Detecting your location...</p>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => { refresh(); setIsOpen(false) }}
            disabled={loading}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-700
                       hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Navigation2 className={`h-4 w-4 text-[#1B4332] ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Getting location...' : 'Update my location'}
          </button>

          {/* Info */}
          <div className="px-4 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Used to show nearby communities and listings
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
