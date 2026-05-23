import { useState, useEffect } from 'react'
import { fetchNearbyServices } from '../utils/locationService'

// Saves recent searches to localStorage
function saveRecentSearch(search) {
  try {
    const existing = JSON.parse(
      localStorage.getItem('roadsos_recent_searches') || '[]'
    )
    // Remove duplicate if exists
    const filtered = existing.filter((s) => s.address !== search.address)
    // Add to front, keep only 5
    const updated = [search, ...filtered].slice(0, 5)
    localStorage.setItem('roadsos_recent_searches', JSON.stringify(updated))
  } catch {}
}

function loadRecentSearches() {
  try {
    return JSON.parse(
      localStorage.getItem('roadsos_recent_searches') || '[]'
    )
  } catch {
    return []
  }
}

// Filter tab button
function FilterTab({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                  font-medium whitespace-nowrap transition-colors border
                  ${active
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

// Service result card
function ServiceCard({ service }) {
  const handleCall = () => {
    if (service.phone) {
      window.location.href = `tel:${service.phone}`
    }
  }

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`
    window.open(url, '_blank')
  }

  return (
    <div className={`rounded-xl border p-4 ${service.bgColor} ${service.borderColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">{service.icon}</span>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">
              {service.name}
            </p>
            <p className={`text-xs mt-0.5 ${service.color}`}>
              {service.label}
            </p>
            {service.address && (
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                📍 {service.address}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1
                         rounded-full flex-shrink-0 font-medium">
          {service.distanceText}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {service.phone ? (
          <button
            onClick={handleCall}
            className="flex-1 bg-green-700 hover:bg-green-600 text-white
                       text-xs font-medium py-2 rounded-lg transition-colors"
          >
            📞 Call
          </button>
        ) : (
          <div className="flex-1 bg-gray-800 text-gray-500 text-xs
                          font-medium py-2 rounded-lg text-center">
            No phone listed
          </div>
        )}
        <button
          onClick={handleNavigate}
          className="flex-1 bg-blue-700 hover:bg-blue-600 text-white
                     text-xs font-medium py-2 rounded-lg transition-colors"
        >
          🗺️ Navigate
        </button>
      </div>
    </div>
  )
}

// Recent search pill
function RecentSearchPill({ search, onClick }) {
  return (
    <button
      onClick={() => onClick(search)}
      className="flex items-center gap-2 bg-gray-800 border border-gray-700
                 hover:border-red-500 rounded-full px-3 py-1.5 transition-colors"
    >
      <span className="text-xs">🕐</span>
      <span className="text-gray-300 text-xs truncate max-w-[160px]">
        {search.address}
      </span>
    </button>
  )
}

// Main Address Search component
export default function AddressSearch() {
  const [addressInput, setAddressInput]   = useState('')
  const [searchedAddress, setSearchedAddress] = useState('')
  const [location, setLocation]           = useState(null)
  const [services, setServices]           = useState([])
  const [loading, setLoading]             = useState(false)
  const [geocoding, setGeocoding]         = useState(false)
  const [error, setError]                 = useState(null)
  const [activeFilter, setActiveFilter]   = useState('all')
  const [radius, setRadius]               = useState(5000)
  const [recentSearches, setRecentSearches] = useState([])

  const filters = [
    { id: 'all',        label: 'All',      icon: '📍' },
    { id: 'hospital',   label: 'Hospital', icon: '🏥' },
    { id: 'clinic',     label: 'Clinic',   icon: '🏨' },
    { id: 'police',     label: 'Police',   icon: '🚔' },
    { id: 'car_repair', label: 'Towing',   icon: '🔧' },
    { id: 'tyres',      label: 'Tyres',    icon: '🔩' },
    { id: 'pharmacy',   label: 'Pharmacy', icon: '💊' },
  ]

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(loadRecentSearches())
  }, [])

  // Geocode address string → lat/lng using free Nominatim API
  const geocodeAddress = async (address) => {
    const encoded = encodeURIComponent(address)
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&addressdetails=1`

    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    })

    if (!response.ok) throw new Error('Geocoding service unavailable')

    const results = await response.json()

    if (!results || results.length === 0) {
      throw new Error(`Location "${address}" not found. Try being more specific.`)
    }

    const result = results[0]
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      shortName: [
        result.address?.suburb || result.address?.neighbourhood,
        result.address?.city || result.address?.town || result.address?.county,
        result.address?.state,
        result.address?.country,
      ]
        .filter(Boolean)
        .slice(0, 3)
        .join(', '),
    }
  }

  // Main search function
  const handleSearch = async (overrideAddress) => {
    const query = (overrideAddress || addressInput).trim()
    if (!query) {
      setError('Please enter an address or location name')
      return
    }

    setError(null)
    setServices([])
    setGeocoding(true)

    let coords
    try {
      coords = await geocodeAddress(query)
    } catch (err) {
      setError(err.message)
      setGeocoding(false)
      return
    }

    setGeocoding(false)
    setLocation(coords)
    setSearchedAddress(coords.shortName || query)
    setLoading(true)

    // Save to recent searches
    const search = {
      address: query,
      displayAddress: coords.shortName || query,
      lat: coords.lat,
      lng: coords.lng,
    }
    saveRecentSearch(search)
    setRecentSearches(loadRecentSearches())

    try {
      const results = await fetchNearbyServices(
        coords.lat,
        coords.lng,
        radius
      )
      setServices(results)
    } catch (err) {
      setError('Could not load nearby services. Check internet connection.')
    }

    setLoading(false)
  }

  // Load a recent search directly
  const handleRecentSearch = (search) => {
    setAddressInput(search.address)
    handleSearch(search.address)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const filteredServices = activeFilter === 'all'
    ? services
    : services.filter((s) => s.type === activeFilter)

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-white text-xl font-bold">Search by Address</h2>
        <p className="text-gray-400 text-xs mt-1">
          Find emergency services at any location
        </p>
      </div>

      {/* Search input */}
      <div className="px-4 pb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter city, area, landmark, or full address..."
            className="flex-1 bg-gray-800 text-white placeholder-gray-500
                       rounded-xl px-4 py-3 text-sm outline-none
                       border border-gray-700 focus:border-red-500 transition-colors"
          />
          <button
            onClick={() => handleSearch()}
            disabled={geocoding || loading}
            className="bg-red-600 hover:bg-red-500 disabled:bg-gray-700
                       text-white rounded-xl px-4 py-3 text-sm font-medium
                       transition-colors flex-shrink-0 disabled:cursor-not-allowed"
          >
            {geocoding ? '📡' : loading ? '⏳' : '🔍'}
          </button>
        </div>

        {/* Radius selector */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-gray-500 text-xs">Radius:</span>
          {[2000, 5000, 10000].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                          ${radius === r
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400'
                          }`}
            >
              {r / 1000}km
            </button>
          ))}
        </div>
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && !location && (
        <div className="px-4 pb-3">
          <p className="text-gray-500 text-xs mb-2">Recent searches:</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, i) => (
              <RecentSearchPill
                key={i}
                search={search}
                onClick={handleRecentSearch}
              />
            ))}
          </div>
        </div>
      )}

      {/* Example suggestions — shown before first search */}
      {!location && !geocoding && !loading && (
        <div className="px-4 pb-3">
          <p className="text-gray-500 text-xs mb-2">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Connaught Place, Delhi',
              'Bandra, Mumbai',
              'Koramangala, Bangalore',
              'Anna Nagar, Chennai',
              'Salt Lake, Kolkata',
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setAddressInput(example)
                  handleSearch(example)
                }}
                className="text-xs bg-gray-800 border border-gray-700
                           hover:border-red-500 text-gray-400 hover:text-gray-200
                           px-3 py-1.5 rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">

        {/* Error */}
        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 mb-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Geocoding status */}
        {geocoding && (
          <div className="flex items-center justify-center py-8 gap-3">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent
                            rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Finding location...</p>
          </div>
        )}

        {/* Loading services */}
        {loading && !geocoding && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent
                            rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading services near</p>
            <p className="text-white text-sm font-medium">{searchedAddress}</p>
          </div>
        )}

        {/* Location confirmed */}
        {location && !loading && !geocoding && (
          <>
            {/* Location banner */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl
                            px-4 py-3 mb-3 flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-medium">
                  📍 {searchedAddress}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
              <button
                onClick={() => {
                  setLocation(null)
                  setServices([])
                  setSearchedAddress('')
                  setAddressInput('')
                }}
                className="text-gray-500 hover:text-red-400 text-sm
                           transition-colors ml-2"
              >
                ✕
              </button>
            </div>

            {/* Filter tabs */}
            {services.length > 0 && (
              <div className="overflow-x-auto pb-2 mb-3">
                <div className="flex gap-2 w-max">
                  {filters.map((f) => (
                    <FilterTab
                      key={f.id}
                      label={f.label}
                      icon={f.icon}
                      active={activeFilter === f.id}
                      onClick={() => setActiveFilter(f.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Results count */}
            {services.length > 0 && (
              <p className="text-gray-500 text-xs mb-3">
                {filteredServices.length} service
                {filteredServices.length !== 1 ? 's' : ''} found
                {activeFilter !== 'all'
                  ? ` (${filters.find((f) => f.id === activeFilter)?.label})`
                  : ''
                }
              </p>
            )}

            {/* Service cards */}
            <div className="flex flex-col gap-3">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Empty filter state */}
            {filteredServices.length === 0 && services.length > 0 && (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">
                  No {filters.find((f) => f.id === activeFilter)?.label} found here
                </p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="text-red-400 text-xs mt-2"
                >
                  Show all services
                </button>
              </div>
            )}

            {/* No results at all */}
            {services.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-2">
                  No services found within {radius / 1000}km
                </p>
                <button
                  onClick={() => {
                    setRadius(10000)
                    handleSearch(addressInput)
                  }}
                  className="text-red-400 text-xs hover:text-red-300"
                >
                  Expand to 10km
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state — before any search */}
        {!location && !geocoding && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <h3 className="text-white font-bold text-lg mb-2">
              Search Any Location
            </h3>
            <p className="text-gray-400 text-sm max-w-xs">
              Type any address, city, landmark or road to find emergency
              services there — even if you are not there right now.
            </p>
            <div className="mt-6 bg-gray-900 rounded-xl p-4 border border-gray-800 text-left w-full">
              <p className="text-gray-400 text-xs font-medium mb-2">
                💡 Useful for:
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  'Finding help for someone at a different location',
                  'Planning a road trip — check services on the route',
                  'Searching when GPS signal is unavailable',
                  'Finding services in another city or country',
                ].map((tip, i) => (
                  <p key={i} className="text-gray-500 text-xs">• {tip}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}