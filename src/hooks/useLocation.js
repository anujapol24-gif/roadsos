import { useState, useEffect } from 'react'

// Calculates straight-line distance between two GPS points
// Returns distance in kilometres
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Custom React hook — call this in any component to get the user's location
// Returns: { location, locationName, error, loading, refresh }
export function useLocation() {
  const [location, setLocation] = useState(null)      // { lat, lng }
  const [locationName, setLocationName] = useState('') // human-readable name
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const getLocation = () => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const coords = { lat: latitude, lng: longitude, accuracy }
        setLocation(coords)
        setLoading(false)

        // Reverse geocode to get a human-readable name
        // Using Nominatim (free OpenStreetMap service — no API key needed)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                // Nominatim requires a User-Agent header
                'Accept-Language': 'en',
              },
            }
          )
          const data = await response.json()

          // Extract the most useful parts of the address
          const address = data.address || {}
          const parts = [
            address.neighbourhood || address.suburb || address.village,
            address.city || address.town || address.county,
            address.state,
          ].filter(Boolean) // remove undefined values

          setLocationName(parts.join(', ') || data.display_name || 'Location detected')
        } catch {
          // Reverse geocoding failed — use coordinates as fallback
          setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }
      },
      (err) => {
        setLoading(false)
        // Handle specific error types
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied. Please allow location in browser settings.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. Check GPS signal.')
            break
          case err.TIMEOUT:
            setError('Location request timed out. Try again.')
            break
          default:
            setError('Could not get location. Please try again.')
        }
      },
      {
        enableHighAccuracy: true,   // use GPS chip not just WiFi
        timeout: 10000,             // wait max 10 seconds
        maximumAge: 60000,          // accept cached location up to 1 min old
      }
    )
  }

  // Automatically try to get location when the hook first loads
  useEffect(() => {
    getLocation()
  }, [])

  return {
    location,       // { lat, lng, accuracy } or null
    locationName,   // "Connaught Place, New Delhi, Delhi" or ""
    error,          // error message string or null
    loading,        // true while waiting for GPS
    refresh: getLocation, // call this to retry
  }
}
