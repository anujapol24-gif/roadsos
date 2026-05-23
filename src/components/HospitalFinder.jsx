import { useState } from 'react'
import { fetchNearbyServices } from '../utils/locationService'

const BACKEND_URL = 'http://localhost:3001'

// Specialty types with search guidance
const SPECIALTIES = [
  { id: 'trauma',       icon: '🚨', label: 'Trauma Centre',     keyword: 'trauma',     description: 'For accident injuries, multiple trauma' },
  { id: 'neurology',    icon: '🧠', label: 'Neurosurgery',      keyword: 'neuro',      description: 'Head injury, brain, spinal cord' },
  { id: 'burns',        icon: '🔥', label: 'Burns Unit',        keyword: 'burns',      description: 'Fire, chemical, electrical burns' },
  { id: 'cardiac',      icon: '❤️', label: 'Cardiac / Cath Lab',keyword: 'cardiac',    description: 'Heart attack, chest pain' },
  { id: 'ortho',        icon: '🦴', label: 'Orthopaedics',      keyword: 'ortho',      description: 'Fractures, bone injuries, joint trauma' },
  { id: 'paediatric',   icon: '👶', label: 'Paediatric',        keyword: 'children',   description: 'Injuries involving children' },
  { id: 'blood',        icon: '🩸', label: 'Blood Bank',        keyword: 'blood bank', description: 'Emergency blood transfusion needed' },
  { id: 'icu',          icon: '🏥', label: 'ICU / Critical Care',keyword: 'icu',       description: 'Severe injuries, life support needed' },
]

// Geocode an address string
async function geocodeAddress(address) {
  const encoded  = encodeURIComponent(address)
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en' } }
  )
  const results = await response.json()
  if (!results || results.length === 0) {
    throw new Error(`Location "${address}" not found`)
  }
  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
    name: results[0].display_name,
  }
}

// Hospital card
function HospitalCard({ hospital }) {
  const handleCall = () => {
    if (hospital.phone) window.location.href = `tel:${hospital.phone}`
  }
  const handleNavigate = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`,
      '_blank'
    )
  }

  return (
    <div className="bg-red-950 border border-red-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">🏥</span>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">
              {hospital.name}
            </p>
            {hospital.address && (
              <p className="text-red-300 text-xs mt-0.5 truncate">
                📍 {hospital.address}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs text-red-300 bg-red-900 px-2 py-1
                         rounded-full flex-shrink-0 font-medium">
          {hospital.distanceText}
        </span>
      </div>
      <div className="flex gap-2">
        {hospital.phone ? (
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

// AI specialty recommender
function AIRecommender({ injuryDescription, location }) {
  const [recommendation, setRecommendation] = useState('')
  const [loading, setLoading]               = useState(false)
  const [streaming, setStreaming]            = useState('')

  const getRecommendation = async () => {
    if (!injuryDescription.trim()) return
    setLoading(true)
    setRecommendation('')
    setStreaming('')

    const prompt = `A road accident victim has this condition: "${injuryDescription}"
${location ? `They are located near: ${location}` : ''}

As an emergency medical advisor:
1. What hospital SPECIALTY do they urgently need? (e.g. Neurosurgery, Burns Unit, Cardiac)
2. What should be done IMMEDIATELY while getting to hospital?
3. What should the person tell the hospital when calling ahead?

Keep response under 100 words. Be specific and urgent.`

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          language: 'en',
        }),
      })

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setStreaming(full)
      }

      setRecommendation(full)
      setStreaming('')
    } catch {
      setRecommendation('Could not get recommendation.')
    }

    setLoading(false)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🤖</span>
        <p className="text-white text-sm font-semibold">
          AI — Which specialty do I need?
        </p>
      </div>
      <textarea
        value={injuryDescription}
        readOnly
        className="w-full bg-gray-800 text-gray-300 rounded-xl px-3 py-2
                   text-xs border border-gray-700 resize-none outline-none mb-3"
        rows={2}
        placeholder="Describe injury above to get AI recommendation..."
      />
      {(streaming || recommendation) && (
        <div className="bg-gray-800 rounded-xl p-3 mb-3">
          <p className="text-gray-200 text-xs leading-relaxed">
            {streaming || recommendation}
            {streaming && (
              <span className="inline-block w-0.5 h-3 bg-red-400 ml-0.5
                               animate-pulse align-middle" />
            )}
          </p>
        </div>
      )}
      <button
        onClick={getRecommendation}
        disabled={!injuryDescription.trim() || loading}
        className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700
                   text-white text-xs font-medium py-2.5 rounded-xl
                   transition-colors disabled:cursor-not-allowed"
      >
        {loading ? 'Analysing...' : '🤖 Get AI Recommendation'}
      </button>
    </div>
  )
}

// Main Hospital Finder
export default function HospitalFinder({ location: gpsLocation, locationName }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState(null)
  const [hospitals,         setHospitals]         = useState([])
  const [loading,           setLoading]           = useState(false)
  const [error,             setError]             = useState(null)
  const [addressInput,      setAddressInput]      = useState(locationName || '')
  const [searchedLocation,  setSearchedLocation]  = useState(null)
  const [injuryDesc,        setInjuryDesc]        = useState('')
  const [useGPS,            setUseGPS]            = useState(!!gpsLocation)

  const searchHospitals = async (specialty) => {
    setSelectedSpecialty(specialty)
    setHospitals([])
    setError(null)
    setLoading(true)

    let coords = gpsLocation

    // Use address if GPS not selected
    if (!useGPS || !gpsLocation) {
      if (!addressInput.trim()) {
        setError('Please enter your location or enable GPS')
        setLoading(false)
        return
      }
      try {
        const geocoded = await geocodeAddress(addressInput)
        coords = { lat: geocoded.lat, lng: geocoded.lng }
        setSearchedLocation(geocoded.name)
      } catch (err) {
        setError(err.message)
        setLoading(false)
        return
      }
    }

    try {
      // Search for hospitals within 10km
      const results = await fetchNearbyServices(
        coords.lat,
        coords.lng,
        10000,
        ['hospital', 'clinic']
      )
      setHospitals(results.slice(0, 10))
    } catch {
      setError('Could not load hospitals. Check internet.')
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-white text-xl font-bold">Hospital Finder</h2>
        <p className="text-gray-400 text-xs mt-1">
          Find hospitals by specialty + blood banks
        </p>
      </div>

      {/* Injury description */}
      <div className="px-4 mb-3">
        <textarea
          value={injuryDesc}
          onChange={(e) => setInjuryDesc(e.target.value)}
          placeholder="Describe the injury (e.g. head injury, chest pain, severe burns)..."
          rows={2}
          className="w-full bg-gray-800 text-white placeholder-gray-500
                     rounded-xl px-4 py-3 text-sm outline-none resize-none
                     border border-gray-700 focus:border-red-500 transition-colors"
        />
      </div>

      {/* Location selector */}
      <div className="px-4 mb-3">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setUseGPS(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors
                        ${useGPS
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                        }`}
          >
            📍 Use GPS
          </button>
          <button
            onClick={() => setUseGPS(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors
                        ${!useGPS
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                        }`}
          >
            ✏️ Enter Address
          </button>
        </div>
        {!useGPS && (
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Enter city, area or landmark..."
            className="w-full bg-gray-800 text-white placeholder-gray-500
                       rounded-xl px-4 py-2.5 text-sm outline-none
                       border border-gray-700 focus:border-red-500 transition-colors"
          />
        )}
        {useGPS && gpsLocation && (
          <p className="text-green-400 text-xs px-1">
            ✓ Using GPS: {locationName || `${gpsLocation.lat.toFixed(3)}, ${gpsLocation.lng.toFixed(3)}`}
          </p>
        )}
      </div>

      {/* Specialty grid */}
      <div className="px-4 mb-3">
        <p className="text-gray-400 text-xs mb-2 font-medium">
          Select specialty needed:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec.id}
              onClick={() => searchHospitals(spec)}
              className={`flex items-start gap-2 rounded-xl border p-3 text-left
                          transition-all active:scale-95
                          ${selectedSpecialty?.id === spec.id
                            ? 'bg-red-700 border-red-500'
                            : 'bg-gray-900 border-gray-800 hover:border-gray-600'
                          }`}
            >
              <span className="text-xl flex-shrink-0">{spec.icon}</span>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold leading-tight">
                  {spec.label}
                </p>
                <p className="text-gray-400 text-xs mt-0.5 leading-tight">
                  {spec.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">

        {/* AI recommendation */}
        {injuryDesc.trim() && (
          <div className="mb-3">
            <AIRecommender
              injuryDescription={injuryDesc}
              location={locationName}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-6 gap-3">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent
                            rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Finding hospitals...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-3 mb-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && hospitals.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs">
                {hospitals.length} hospitals found
                {selectedSpecialty ? ` · ${selectedSpecialty.label}` : ''}
              </p>
              <p className="text-gray-500 text-xs">within 10km</p>
            </div>
            <div className="flex flex-col gap-3">
              {hospitals.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && hospitals.length === 0 && !selectedSpecialty && (
          <div className="text-center py-6">
            <span className="text-5xl">🏥</span>
            <p className="text-gray-400 text-sm mt-3">
              Select a specialty above to find the right hospital
            </p>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}