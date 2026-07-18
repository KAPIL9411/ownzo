'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface UserLocation {
  city: string
  state: string
  country: string
  lat: number
  lng: number
  display: string          // short "City, State"
  fullAddress: string      // raw Nominatim display_name
}

const STORAGE_KEY = 'ownzo_user_location'
const CACHE_TTL_MS = 1000 * 60 * 30 // 30 min

interface Cached {
  location: UserLocation
  ts: number
}

function loadFromStorage(): UserLocation | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const cached: Cached = JSON.parse(raw)
    if (Date.now() - cached.ts > CACHE_TTL_MS) return null
    return cached.location
  } catch {
    return null
  }
}

function saveToStorage(loc: UserLocation) {
  if (typeof window === 'undefined') return
  try {
    const cached: Cached = { location: loc, ts: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached))
  } catch {}
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(() => loadFromStorage())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown')
  const fetchedRef = useRef(false)

  const resolveCity = useCallback(async (lat: number, lng: number): Promise<UserLocation> => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    const addr = data.address ?? {}

    const city    = addr.city || addr.town || addr.village || addr.county || addr.state_district || ''
    const state   = addr.state || ''
    const country = addr.country || ''

    return {
      city,
      state,
      country,
      lat,
      lng,
      display:     [city, state].filter(Boolean).join(', '),
      fullAddress: data.display_name ?? '',
    }
  }, [])

  const fetchLocation = useCallback(async (force = false) => {
    if (!force && fetchedRef.current) return
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser')
      return
    }

    fetchedRef.current = true
    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await resolveCity(pos.coords.latitude, pos.coords.longitude)
          setLocation(loc)
          saveToStorage(loc)
          setPermissionState('granted')
        } catch {
          setError('Could not determine your city')
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setPermissionState('denied')
        setError(
          err.code === 1
            ? 'Location permission denied. Enable it in browser settings.'
            : 'Could not get your location'
        )
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [resolveCity])

  // Auto-fetch on mount — only if not cached
  useEffect(() => {
    if (!location) {
      fetchLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
    fetchedRef.current = false
    fetchLocation(true)
  }, [fetchLocation])

  return { location, loading, error, permissionState, refresh }
}
