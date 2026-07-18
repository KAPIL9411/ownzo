'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import map to avoid SSR issues
const LocationMap = dynamic(
  () => import('./LocationMap').then((mod) => mod.LocationMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-48 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading map...</p>
      </div>
    )
  }
)

export function LocationWidget() {
  const [location, setLocation] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(null)

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#1B4332] flex items-center justify-center">
            <Navigation2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1B4332]">Your Location</h3>
            <p className="text-xs text-gray-500">Find items near you</p>
          </div>
        </div>
      </div>

      {/* Map */}
      <LocationMap 
        height="200px" 
        showControls={false}
        onLocationChange={handleLocationChange}
      />

      {/* Location Info */}
      {location && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-[#F97316] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-700 mb-1">Current Location</p>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {location.address}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
