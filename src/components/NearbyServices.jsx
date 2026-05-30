import { useState, useEffect } from 'react'
import { fetchNearbyServices, SERVICE_TYPES } from '../utils/locationService'

// Filter tab button
function FilterTab({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  whitespace-nowrap transition-colors border
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

// Individual service card
function ServiceCard({ service }) {
  const handleCall = () => {
    if (service.phone) {
      window.location.href = `tel:${service.phone}`
    }
  }

  const handleNavigate = () => {
    // Opens Google Maps with directions to this service
    const url = `https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`
    window.open(url, '_blank')
  }

  return (
    <div className={`rounded-xl border p-4 ${service.bgColor} ${service.borderColor}`}>
      {/* Service header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">{service.icon}</span>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">
              {service.name}
            </p>
            <p className={`text-xs mt-0.5 ${service.color}`}>
              {service.label}
            </p>
          </div>
        </div>
        {/* Distance badge */}
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full flex-shrink-0">
          {service.distanceText}
        </span>
      </div>

      {/* Address if available */}
      {service.address && (
        <p className="text-gray-400 text-xs mb-3 leading-relaxed">
          📍 {service.address}
        </p>
      )}

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

// Main Nearby Services component
export default function NearbyServices({ location, locationName }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchRadius, setSearchRadius] = useState(5000) // 5km default

  // Filter tabs configuration
  const filters = [
    { id: 'all', label: 'All', icon: '📍' },
    { id: 'hospital', label: 'Hospital', icon: '🏥' },
    { id: 'clinic', label: 'Clinic', icon: '🏨' },
    { id: 'police', label: 'Police', icon: '🚔' },
    { id: 'car_repair', label: 'Towing', icon: '🔧' },
    { id: 'tyres', label: 'Tyres', icon: '🔩' },
    { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  ]

  // Fetch services whenever location or radius changes
  useEffect(() => {
    if (location) {
      loadServices()
    }
  }, [location, searchRadius])

  const loadServices = async () => {
    if (!location) return

    setLoading(true)
    setError(null)

    try {
      const results = await fetchNearbyServices(
        location.lat,
        location.lng,
        searchRadius
      )
      setServices(results)
    } catch (err) {
      setError('Could not load nearby services. Check your internet connection.')
      console.error('Services fetch error:', err)
    }

    setLoading(false)
  }

  // Apply the active filter
  const filteredServices =
    activeFilter === 'all'
      ? services
      : services.filter((s) => s.type === activeFilter)

  // No location yet
  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <span className="text-5xl mb-4">📍</span>
        <h2 className="text-white text-lg font-bold mb-2">Location Required</h2>
        <p className="text-gray-400 text-sm mb-4">
          Allow location access to find nearby emergency services.
        </p>
        <p className="text-gray-500 text-xs">
          Check the top of your browser for a location permission prompt and click Allow.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">

      {/* Location header */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-green-400 flex-shrink-0">📍</span>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {locationName || 'Location detected'}
              </p>
              <p className="text-gray-500 text-xs">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <button
            onClick={loadServices}
            className="text-xs text-red-400 hover:text-red-300 flex-shrink-0 ml-2"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Radius selector */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">Radius:</span>
          {[2000, 5000, 10000].map((r) => (
            <button
              key={r}
              onClick={() => setSearchRadius(r)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                ${searchRadius === r
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
            >
              {r / 1000}km
            </button>
          ))}
        </div>
      </div>

      {/* Filter tabs — horizontal scroll */}
      <div className="px-4 pb-3 overflow-x-auto">
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

      {/* Results area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent 
                            rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Finding nearby services...</p>
            <p className="text-gray-600 text-xs text-center px-4">
              Searching OpenStreetMap database.
              This takes 5–10 seconds on first load.
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-center">
            <p className="text-red-300 text-sm mb-3">{error}</p>
            <button
              onClick={loadServices}
              className="bg-red-600 hover:bg-red-500 text-white text-xs 
                         px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results count */}
        {!loading && !error && services.length > 0 && (
          <p className="text-gray-500 text-xs mb-3">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
            {activeFilter !== 'all' ? ` (${filters.find(f => f.id === activeFilter)?.label})` : ''}
          </p>
        )}

        {/* Service cards */}
        {!loading && !error && (
          <div className="flex flex-col gap-3">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredServices.length === 0 && services.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              No {filters.find(f => f.id === activeFilter)?.label.toLowerCase()} found nearby.
            </p>
            <button
              onClick={() => setActiveFilter('all')}
              className="text-red-400 text-xs mt-2 hover:text-red-300"
            >
              Show all services
            </button>
          </div>
        )}

        {/* Empty state when no services at all */}
        {!loading && !error && services.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-2">
              No services found within {searchRadius / 1000}km.
            </p>
            <button
              onClick={() => setSearchRadius(10000)}
              className="text-red-400 text-xs hover:text-red-300"
            >
              Expand to 10km
            </button>
          </div>
        )}

      </div>
    </div>
  )
}