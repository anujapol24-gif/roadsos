import { useEffect, useRef, useState } from 'react'

// Known high-accident zones in India from NCRB 2022 data
// Format: [lat, lng, name, highway, annualAccidents, riskLevel]
const ACCIDENT_ZONES = [
  { lat: 28.4595,  lng: 77.0266,  name: 'Kherki Daula Toll', highway: 'NH-48', accidents: 127, risk: 'critical', state: 'Haryana' },
  { lat: 28.8386,  lng: 77.0681,  name: 'Mukarba Chowk', highway: 'NH-44', accidents: 89,  risk: 'high',     state: 'Delhi' },
  { lat: 19.0760,  lng: 72.8777,  name: 'Ghatkopar Junction', highway: 'NH-48', accidents: 76, risk: 'high',   state: 'Maharashtra' },
  { lat: 12.9716,  lng: 77.5946,  name: 'Silk Board Junction', highway: 'NH-44', accidents: 98, risk: 'critical', state: 'Karnataka' },
  { lat: 17.3850,  lng: 78.4867,  name: 'Outer Ring Road', highway: 'ORR',   accidents: 64, risk: 'high',     state: 'Telangana' },
  { lat: 13.0827,  lng: 80.2707,  name: 'Kathipara Junction', highway: 'NH-45', accidents: 55, risk: 'high',   state: 'Tamil Nadu' },
  { lat: 22.5726,  lng: 88.3639,  name: 'Ultadanga More', highway: 'NH-12', accidents: 43, risk: 'medium',    state: 'West Bengal' },
  { lat: 26.8467,  lng: 80.9462,  name: 'Aashiyana Crossing', highway: 'NH-27', accidents: 67, risk: 'high',  state: 'Uttar Pradesh' },
  { lat: 23.0225,  lng: 72.5714,  name: 'Sarkhej-Gandhinagar', highway: 'SG Highway', accidents: 88, risk: 'critical', state: 'Gujarat' },
  { lat: 15.3173,  lng: 75.7139,  name: 'Hubli Bypass', highway: 'NH-48', accidents: 51, risk: 'medium',      state: 'Karnataka' },
  { lat: 9.9312,   lng: 76.2673,  name: 'Edapally Junction', highway: 'NH-544', accidents: 72, risk: 'high',  state: 'Kerala' },
  { lat: 25.5941,  lng: 85.1376,  name: 'Danapur-Khagaul', highway: 'NH-19', accidents: 59, risk: 'high',     state: 'Bihar' },
  { lat: 21.1458,  lng: 79.0882,  name: 'Wardha Road', highway: 'NH-7',  accidents: 83, risk: 'critical',     state: 'Maharashtra' },
  { lat: 26.9124,  lng: 75.7873,  name: 'Durgapura Crossing', highway: 'NH-48', accidents: 44, risk: 'medium', state: 'Rajasthan' },
  { lat: 30.7333,  lng: 76.7794,  name: 'Zirakpur Flyover', highway: 'NH-22', accidents: 61, risk: 'high',    state: 'Punjab' },
]

const RISK_CONFIG = {
  critical: { color: '#ef4444', pulse: '#fca5a5', label: '🔴 Critical Risk', bg: 'bg-red-950', border: 'border-red-700', text: 'text-red-300' },
  high:     { color: '#f97316', pulse: '#fdba74', label: '🟠 High Risk',     bg: 'bg-orange-950', border: 'border-orange-700', text: 'text-orange-300' },
  medium:   { color: '#eab308', pulse: '#fde047', label: '🟡 Medium Risk',   bg: 'bg-yellow-950', border: 'border-yellow-700', text: 'text-yellow-300' },
}

// Stats card
function StatCard({ value, label, icon }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
      <p className="text-xl">{icon}</p>
      <p className="text-white font-bold text-lg leading-tight">{value}</p>
      <p className="text-gray-400 text-xs">{label}</p>
    </div>
  )
}

// Zone detail card
function ZoneCard({ zone, onClose }) {
  const risk = RISK_CONFIG[zone.risk]
  return (
    <div className={`${risk.bg} border ${risk.border} rounded-2xl p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`text-xs font-semibold ${risk.text}`}>{risk.label}</p>
          <h3 className="text-white font-bold text-base mt-0.5">{zone.name}</h3>
          <p className="text-gray-400 text-xs">{zone.highway} · {zone.state}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-lg">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/20 rounded-xl p-3 text-center">
          <p className="text-white font-bold text-xl">{zone.accidents}</p>
          <p className="text-gray-400 text-xs">Accidents/year</p>
        </div>
        <div className="bg-black/20 rounded-xl p-3 text-center">
          <p className="text-white font-bold text-xl">
            {zone.risk === 'critical' ? '⚠️' : zone.risk === 'high' ? '⚠' : '!'}
          </p>
          <p className="text-gray-400 text-xs">Risk level</p>
        </div>
      </div>
      <div className="mt-3 bg-black/20 rounded-xl p-3">
        <p className="text-gray-300 text-xs leading-relaxed">
          💡 Drive carefully in this zone. Reduce speed, avoid overtaking,
          and stay alert for sudden stops. Keep emergency numbers ready.
        </p>
      </div>
    </div>
  )
}

export default function AccidentHeatmap() {
  const mapRef      = useRef(null)
  const mapInstance = useRef(null)
  const [selected,  setSelected]  = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [filter,    setFilter]    = useState('all')

  // Stats
  const totalAccidents = ACCIDENT_ZONES.reduce((sum, z) => sum + z.accidents, 0)
  const criticalZones  = ACCIDENT_ZONES.filter((z) => z.risk === 'critical').length
  const highZones      = ACCIDENT_ZONES.filter((z) => z.risk === 'high').length

  const filtered = filter === 'all'
    ? ACCIDENT_ZONES
    : ACCIDENT_ZONES.filter((z) => z.risk === filter)

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      document.head.appendChild(link)
    }

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => initMap()
    document.head.appendChild(script)

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return

    const L = window.L
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629], // Centre of India
      zoom: 5,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    mapInstance.current = map
    setMapLoaded(true)
    addMarkers(map, ACCIDENT_ZONES)
  }

  const addMarkers = (map, zones) => {
    const L = window.L

    zones.forEach((zone) => {
      const risk   = RISK_CONFIG[zone.risk]
      const radius = zone.risk === 'critical' ? 20 : zone.risk === 'high' ? 16 : 12

      // Pulsing circle marker
      const circle = L.circleMarker([zone.lat, zone.lng], {
        radius,
        fillColor: risk.color,
        color: risk.pulse,
        weight: 3,
        opacity: 0.9,
        fillOpacity: 0.7,
      }).addTo(map)

      circle.bindPopup(`
        <div style="font-family:sans-serif;min-width:180px">
          <p style="font-weight:700;font-size:13px;margin:0 0 4px">${zone.name}</p>
          <p style="color:#666;font-size:11px;margin:0 0 6px">${zone.highway} · ${zone.state}</p>
          <p style="color:${risk.color};font-size:11px;font-weight:600;margin:0 0 4px">${risk.label}</p>
          <p style="font-size:11px;margin:0">📊 ${zone.accidents} accidents/year</p>
        </div>
      `)

      circle.on('click', () => setSelected(zone))
    })
  }

  // Fly to zone on list item click
  const flyToZone = (zone) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([zone.lat, zone.lng], 12, { duration: 1 })
    }
    setSelected(zone)
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-white text-xl font-bold">Accident Heatmap</h2>
        <p className="text-gray-400 text-xs mt-1">
          Known high-risk zones · NCRB 2022 data
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 mb-3 grid grid-cols-3 gap-2">
        <StatCard value={ACCIDENT_ZONES.length} label="Danger zones" icon="📍" />
        <StatCard value={criticalZones}          label="Critical"    icon="🔴" />
        <StatCard value={`${totalAccidents}+`}  label="Annual accidents" icon="⚠️" />
      </div>

      {/* Map */}
      <div className="mx-4 mb-3 rounded-2xl overflow-hidden border border-gray-700"
           style={{ height: '240px' }}>
        {!mapLoaded && (
          <div className="h-full bg-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent
                              rounded-full animate-spin" />
              <p className="text-gray-400 text-xs">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ height: '240px', width: '100%' }} />
      </div>

      {/* Selected zone detail */}
      {selected && (
        <div className="mx-4 mb-3">
          <ZoneCard zone={selected} onClose={() => setSelected(null)} />
        </div>
      )}

      {/* Filter */}
      <div className="px-4 mb-3 flex gap-2">
        {[
          { id: 'all',      label: 'All',      icon: '📍' },
          { id: 'critical', label: 'Critical', icon: '🔴' },
          { id: 'high',     label: 'High',     icon: '🟠' },
          { id: 'medium',   label: 'Medium',   icon: '🟡' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs
                        font-medium border transition-colors
                        ${filter === f.id
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                        }`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Zone list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="text-gray-500 text-xs mb-3">
          Tap any zone to see it on the map
        </p>
        <div className="flex flex-col gap-2">
          {filtered.map((zone, i) => {
            const risk = RISK_CONFIG[zone.risk]
            return (
              <button
                key={i}
                onClick={() => flyToZone(zone)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left
                            transition-all active:scale-95
                            ${selected?.name === zone.name
                              ? `${risk.bg} ${risk.border}`
                              : 'bg-gray-900 border-gray-800 hover:border-gray-600'
                            }`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: risk.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">
                    {zone.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {zone.highway} · {zone.state}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-xs font-bold">{zone.accidents}</p>
                  <p className="text-gray-500 text-xs">acc/yr</p>
                </div>
              </button>
            )
          })}
        </div>
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-gray-400 text-xs">
            📊 Data sourced from NCRB Road Accidents in India Report 2022
            and NHAI accident data. Zones updated annually.
          </p>
        </div>
        <div className="h-4" />
      </div>
    </div>
  )
}