'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation } from 'lucide-react'

// Fix default marker icon issue with Leaflet in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Generate truly unique ID for each map instance
const generateMapId = () => `map-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`

// Custom marker icon
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: #1B4332;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}

// Component to recenter map when location changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 13, { animate: true })
  }, [lat, lng, map])
  return null
}

interface LocationMapProps {
  height?: string
  showControls?: boolean
  defaultCenter?: [number, number]
  onLocationChange?: (lat: number, lng: number, address: string) => void
}

export function LocationMap({ 
  height = '300px', 
  showControls = true,
  defaultCenter = [25.2048, 55.2708], // Dubai default
  onLocationChange 
}: LocationMapProps) {
  const [position, setPosition] = useState<[number, number]>(defaultCenter)
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<string>('Getting your location...')
  const [error, setError] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const [shouldRenderMap, setShouldRenderMap] = useState(false)
  const [mapId] = useState(() => generateMapId()) // Unique ID per component instance
  const locationFetched = useRef(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setMounted(true)
    // Small delay to ensure clean mount
    const timer = setTimeout(() => {
      setShouldRenderMap(true)
    }, 100)
    
    // Cleanup function to remove map instance on unmount
    return () => {
      clearTimeout(timer)
      setShouldRenderMap(false)
      
      // Remove map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        } catch (e) {
          // Silently fail
        }
      }
      
      // Additional cleanup - remove any Leaflet containers in our div
      if (mapContainerRef.current) {
        const containers = mapContainerRef.current.querySelectorAll('.leaflet-container')
        containers.forEach((container: Element) => {
          // Clear the container's innerHTML to force complete cleanup
          container.innerHTML = ''
        })
      }
    }
  }, [])

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const newPos: [number, number] = [latitude, longitude]
        setPosition(newPos)

        // Reverse geocoding using Nominatim (OpenStreetMap)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          const locationAddress = data.display_name || 'Location found'
          setAddress(locationAddress)
          
          if (onLocationChange) {
            onLocationChange(latitude, longitude, locationAddress)
          }
        } catch (err) {
          setAddress('Location found')
        }
        
        setLoading(false)
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location services.')
        setAddress('Location unavailable')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  useEffect(() => {
    if (mounted && !locationFetched.current) {
      locationFetched.current = true
      getCurrentLocation()
    }
  }, [mounted])

  if (!mounted || !shouldRenderMap) {
    return (
      <div 
        className="rounded-xl bg-gray-100 animate-pulse flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-sm text-gray-400">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="relative" ref={mapContainerRef}>
      {/* Map Container with unique key */}
      <div 
        key={mapId}
        id={mapId}
        className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" 
        style={{ height }}
      >
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
          whenReady={() => {
            // map instance tracked via ref in useEffect
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={createCustomIcon()}>
            <Popup>
              <div className="p-2">
                <p className="font-bold text-sm mb-1">Your Location</p>
                <p className="text-xs text-gray-600">{address}</p>
              </div>
            </Popup>
          </Marker>
          <RecenterMap lat={position[0]} lng={position[1]} />
        </MapContainer>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#1B4332] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-600 mb-0.5">Current Location</p>
                <p className="text-xs text-gray-500 line-clamp-2">{address}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B4332] text-white text-xs font-bold hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Navigation className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Locating...' : 'Update'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
