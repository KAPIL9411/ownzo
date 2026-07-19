/**
 * Location Service
 * Auto-fetch user's city and locality using browser geolocation + reverse geocoding
 */

export interface LocationData {
  city: string
  locality?: string
  state?: string
  country?: string
  latitude: number
  longitude: number
}

export class LocationService {
  /**
   * Get user's current location using browser geolocation
   */
  static async getCurrentLocation(): Promise<LocationData> {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser')
    }

    try {
      // Get coordinates from browser
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocode to get city name
      const locationData = await this.reverseGeocode(latitude, longitude)

      return locationData
    } catch (error: any) {
      if (error.code === 1) {
        throw new Error('Location access denied. Please enable location permissions.')
      } else if (error.code === 2) {
        throw new Error('Location unavailable. Please try again.')
      } else if (error.code === 3) {
        throw new Error('Location request timeout. Please try again.')
      }
      throw new Error('Failed to get location')
    }
  }

  /**
   * Convert coordinates to city name using OpenStreetMap Nominatim (FREE)
   * Alternative: Google Maps Geocoding API (requires API key)
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    try {
      // Using OpenStreetMap Nominatim (FREE, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Ownzo/1.0', // Required by Nominatim
          },
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding failed')
      }

      const data = await response.json()
      const address = data.address || {}

      // Extract city (try multiple fields as different regions use different keys)
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        'Unknown City'

      const locality =
        address.suburb ||
        address.neighbourhood ||
        address.hamlet ||
        address.residential ||
        undefined

      return {
        city,
        locality,
        state: address.state || address.province,
        country: address.country,
        latitude,
        longitude,
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      throw new Error('Failed to determine city from location')
    }
  }

  /**
   * Request location permission without getting location
   * Useful for checking if user will grant permission
   */
  static async checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!navigator.permissions) {
      return 'prompt' // Assume prompt if Permissions API not available
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      return result.state
    } catch {
      return 'prompt'
    }
  }

  /**
   * Get location with loading state management
   */
  static async getLocationWithStatus(): Promise<{
    success: boolean
    data?: LocationData
    error?: string
  }> {
    try {
      const data = await this.getCurrentLocation()
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
