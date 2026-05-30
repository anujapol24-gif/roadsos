import { useState, useEffect } from 'react'
import { fetchNearbyServices, SERVICE_TYPES } from '../utils/locationService'

const EMERGENCY_DATA = {
  IN: {
    country: 'India',
    flag: '🇮🇳',
    services: [
      {
        id: 'ambulance',
        label: 'Ambulance',
        number: '108',
        icon: '🚑',
        color: 'bg-red-600',
        hoverColor: 'hover:bg-red-500',
        description: 'Medical emergency',
      },
      {
        id: 'police',
        label: 'Police',
        number: '112',
        icon: '🚔',
        color: 'bg-blue-600',
        hoverColor: 'hover:bg-blue-500',
        description: 'Law enforcement',
      },
      {
        id: 'fire',
        label: 'Fire Brigade',
        number: '101',
        icon: '🚒',
        color: 'bg-orange-600',
        hoverColor: 'hover:bg-orange-500',
        description: 'Fire & rescue',
      },
      {
        id: 'highway',
        label: 'Highway Help',
        number: '1033',
        icon: '🛣️',
        color: 'bg-yellow-600',
        hoverColor: 'hover:bg-yellow-500',
        description: 'NHAI road helpline',
      },
    ],
    stats: {
      hospitals: '25,000+',
      policeStations: '17,000+',
      ambulances: '10,000+',
      coverage: '195 countries',
    },
  },
}

// Stats bar
function StatsBar({ stats }) {
  const items = [
    { label: 'Hospitals',  value: stats.hospitals,      icon: '🏥' },
    { label: 'Police',     value: stats.policeStations,  icon: '🚔' },
    { label: 'Ambulances', value: stats.ambulances,      icon: '🚑' },
    { label: 'Countries',  value: stats.coverage,        icon: '🌐' },
  ]
  return (
    <div className="grid grid-cols-4 gap-1 bg-gray-900 rounded-xl p-2 border border-gray-800">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center py-1">
          <span className="text-sm">{item.icon}</span>
          <span className="text-white text-xs font-bold leading-tight text-center">
            {item.value}
          </span>
          <span className="text-gray-500 text-xs leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// One-tap call button
function EmergencyButton({ service, onCall }) {
  const [pressed, setPressed] = useState(false)

  const handleCall = () => {
    setPressed(true)
    onCall(service)
    setTimeout(() => setPressed(false), 2000)
  }

  return (
    <button
      onClick={handleCall}
      className={`flex flex-col items-center justify-center rounded-2xl p-4 w-full
                  transition-all duration-150 active:scale-95 shadow-lg
                  ${pressed ? 'bg-green-600' : `${service.color} ${service.hoverColor}`}`}
    >
      <span className="text-3xl mb-1">{service.icon}</span>
      <span className="text-white font-bold text-base leading-tight">
        {pressed ? 'Calling...' : service.label}
      </span>
      <span className="text-white/80 text-xl font-mono font-bold mt-0.5">
        {service.number}
      </span>
      <span className="text-white/60 text-xs mt-0.5">{service.description}</span>
    </button>
  )
}

// Filter tab button for nearby services
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

// Nearby service card (compact version for Emergency tab)
function NearbyServiceCard({ service }) {
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
    <div className={`rounded-xl border p-3 ${service.bgColor} ${service.borderColor}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{service.icon}</span>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold leading-tight truncate">
              {service.name}
            </p>
            <p className={`text-xs mt-0.5 ${service.color}`}>
              {service.label}
            </p>
          </div>
        </div>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5
                         rounded-full flex-shrink-0 font-medium">
          {service.distanceText}
        </span>
      </div>

      <div className="flex gap-2">
        {service.phone ? (
          <button
            onClick={handleCall}
            className="flex-1 bg-green-700 hover:bg-green-600 text-white
                       text-xs font-medium py-1.5 rounded-lg transition-colors"
          >
            📞 Call
          </button>
        ) : (
          <div className="flex-1 bg-gray-800 text-gray-500 text-xs
                          font-medium py-1.5 rounded-lg text-center">
            No phone
          </div>
        )}
        <button
          onClick={handleNavigate}
          className="flex-1 bg-blue-700 hover:bg-blue-600 text-white
                     text-xs font-medium py-1.5 rounded-lg transition-colors"
        >
          🗺️ Navigate
        </button>
      </div>
    </div>
  )
}

// Nearby services section embedded in Emergency tab
function NearbyServicesSection({ location }) {
  const [services, setServices]       = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  const filters = [
    { id: 'all',       label: 'All',      icon: '📍' },
    { id: 'hospital',  label: 'Hospital', icon: '🏥' },
    { id: 'police',    label: 'Police',   icon: '🚔' },
    { id: 'car_repair',label: 'Towing',   icon: '🔧' },
    { id: 'pharmacy',  label: 'Pharmacy', icon: '💊' },
  ]

  useEffect(() => {
    if (location) loadServices()
  }, [location])

  const loadServices = async () => {
    if (!location) return
    setLoading(true)
    setError(null)
    try {
      const results = await fetchNearbyServices(
        location.lat,
        location.lng,
        5000,
        ['hospital', 'police', 'car_repair', 'pharmacy', 'fire_station']
      )
      setServices(results)
    } catch (err) {
      setError('Could not load nearby services')
    }
    setLoading(false)
  }

  const filtered = activeFilter === 'all'
    ? services
    : services.filter((s) => s.type === activeFilter)

  // No location yet
  if (!location) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 text-center">
        <p className="text-gray-400 text-sm">📡 Getting your location...</p>
        <p className="text-gray-500 text-xs mt-1">
          Allow location access to see nearby services
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">📍 Nearby Services</h3>
        <button
          onClick={loadServices}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter tabs — horizontal scroll */}
      <div className="overflow-x-auto pb-1">
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

      {/* Loading */}
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

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-950 border border-red-800 rounded-xl p-3 text-center">
          <p className="text-red-300 text-xs mb-2">{error}</p>
          <button
            onClick={loadServices}
            className="text-xs text-red-400 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results count */}
      {!loading && !error && services.length > 0 && (
        <p className="text-gray-500 text-xs">
          {filtered.length} service{filtered.length !== 1 ? 's' : ''} found nearby
        </p>
      )}

      {/* Service cards */}
      {!loading && !error && (
        <div className="flex flex-col gap-2">
          {filtered.slice(0, 6).map((service) => (
            <NearbyServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* Show more hint */}
      {!loading && filtered.length > 6 && (
        <p className="text-gray-500 text-xs text-center">
          +{filtered.length - 6} more — tap Services in the More tab
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && services.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">No services found nearby</p>
          <p className="text-gray-500 text-xs mt-1">
            Try the Services tab for wider search
          </p>
        </div>
      )}
    </div>
  )
}

// Main Emergency Dashboard
export default function EmergencyDashboard({ location }) {
  const [callLog, setCallLog] = useState(null)
  const countryCode = 'IN'
  const data = EMERGENCY_DATA[countryCode]

  const handleCall = (service) => {
    window.location.href = `tel:${service.number}`
    setCallLog(`📞 Opening dialer for ${service.label} — ${service.number}`)
    setTimeout(() => setCallLog(null), 4000)
  }

  return (
    <div className="flex flex-col px-4 py-4 gap-4 overflow-y-auto">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-white text-xl font-bold">Emergency Services</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span>{data.flag}</span>
          <span className="text-gray-400 text-sm">{data.country}</span>
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar stats={data.stats} />

      {/* Call log toast */}
      {callLog && (
        <div className="bg-green-900 border border-green-600 rounded-xl
                        px-4 py-3 text-green-300 text-sm text-center">
          {callLog}
        </div>
      )}

      {/* One-tap call buttons */}
      <div className="grid grid-cols-2 gap-3">
        {data.services.map((service) => (
          <EmergencyButton
            key={service.id}
            service={service}
            onCall={handleCall}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800" />

      {/* Nearby services — live from OpenStreetMap */}
      <NearbyServicesSection location={location} />

      {/* Divider */}
      <div className="border-t border-gray-800" />

      {/* Safety tips */}
      <div className="bg-gray-900 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3">
          ⚠️ At the accident scene:
        </h3>
        <div className="flex flex-col gap-2">
          {[
            '🔴 Stay calm and speak clearly when you call',
            '📍 Share your exact location — landmark or GPS',
            '🚗 Turn on hazard lights if vehicle is on road',
            '⛔ Do not move an injured person unless in danger',
          ].map((tip, i) => (
            <p key={i} className="text-gray-300 text-xs leading-relaxed">{tip}</p>
          ))}
        </div>
      </div>

      {/* Offline badge */}
      <div className="flex items-center justify-center gap-2 py-1">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-gray-500 text-xs">
          Emergency numbers work offline • Nearby services need internet
        </span>
      </div>

      <div className="h-2" />
    </div>
  )
}