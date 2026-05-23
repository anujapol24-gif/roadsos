import { useState, useEffect, useRef } from 'react'

// Speed limits by road type in India
const SPEED_LIMITS = {
  highway:  { limit: 120, label: 'Highway',     icon: '🛣️'  },
  city:     { limit: 60,  label: 'City road',   icon: '🏙️'  },
  school:   { limit: 25,  label: 'School zone', icon: '🏫'  },
  residential: { limit: 40, label: 'Residential', icon: '🏠' },
}

// Break reminder intervals in minutes
const BREAK_INTERVALS = [60, 90, 120]

function SpeedGauge({ speed, limit }) {
  const percentage = Math.min((speed / (limit * 1.5)) * 100, 100)
  const isOver     = speed > limit
  const isWarning  = speed > limit * 0.9

  const color = isOver
    ? '#ef4444'
    : isWarning
      ? '#f97316'
      : '#22c55e'

  return (
    <div className="flex flex-col items-center">
      {/* Circular gauge */}
      <div className="relative w-48 h-48">
        <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
          {/* Background arc */}
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset="63"
          />
          {/* Speed arc */}
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset={`${63 + (188 * (1 - percentage / 100))}`}
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
        </svg>

        {/* Centre display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-black text-5xl leading-none transition-colors"
            style={{ color }}
          >
            {Math.round(speed)}
          </span>
          <span className="text-gray-400 text-sm">km/h</span>
        </div>
      </div>

      {/* Speed status */}
      <div className={`mt-3 px-4 py-2 rounded-full text-sm font-bold
                       transition-colors
                       ${isOver
                         ? 'bg-red-600 text-white'
                         : isWarning
                           ? 'bg-orange-600 text-white'
                           : 'bg-green-900 text-green-300'
                       }`}>
        {isOver
          ? `⚠️ Over limit by ${Math.round(speed - limit)} km/h`
          : isWarning
            ? '⚠️ Near speed limit'
            : '✓ Safe speed'
        }
      </div>
    </div>
  )
}

export default function DriveSafe() {
  const [isTracking,    setIsTracking]    = useState(false)
  const [speed,         setSpeed]         = useState(0)
  const [maxSpeed,      setMaxSpeed]      = useState(0)
  const [distance,      setDistance]      = useState(0)
  const [duration,      setDuration]      = useState(0)
  const [roadType,      setRoadType]      = useState('highway')
  const [breakInterval, setBreakInterval] = useState(90)
  const [breakAlert,    setBreakAlert]    = useState(false)
  const [speedAlerts,   setSpeedAlerts]   = useState(0)
  const [gpsError,      setGpsError]      = useState(null)

  const watchIdRef    = useRef(null)
  const timerRef      = useRef(null)
  const breakTimerRef = useRef(null)
  const lastPosRef    = useRef(null)
  const startTimeRef  = useRef(null)

  const currentLimit = SPEED_LIMITS[roadType].limit

  useEffect(() => {
    return () => stopTracking()
  }, [])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS not supported in this browser')
      return
    }

    setGpsError(null)
    setIsTracking(true)
    setSpeed(0)
    setMaxSpeed(0)
    setDistance(0)
    setDuration(0)
    setSpeedAlerts(0)
    setBreakAlert(false)
    startTimeRef.current = Date.now()
    lastPosRef.current   = null

    // Track GPS position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const speedMS  = position.coords.speed || 0
        const speedKMH = Math.max(0, speedMS * 3.6)

        setSpeed(speedKMH)
        setMaxSpeed((prev) => Math.max(prev, speedKMH))

        // Calculate distance
        if (lastPosRef.current) {
          const d = getDistanceKm(
            lastPosRef.current.lat,
            lastPosRef.current.lng,
            latitude,
            longitude
          )
          setDistance((prev) => prev + d)
        }
        lastPosRef.current = { lat: latitude, lng: longitude }

        // Speed alert
        if (speedKMH > currentLimit) {
          setSpeedAlerts((prev) => prev + 1)
          if (window.speechSynthesis) {
            const u = new SpeechSynthesisUtterance(
              `Speed alert. You are driving at ${Math.round(speedKMH)} kilometres per hour. Please slow down.`
            )
            u.rate = 1
            u.volume = 1
            window.speechSynthesis.speak(u)
          }
        }
      },
      (err) => {
        setGpsError('Could not get GPS signal. Drive outdoors for best results.')
        console.error('GPS error:', err)
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    )

    // Duration timer — updates every second
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    // Break reminder timer
    breakTimerRef.current = setTimeout(() => {
      setBreakAlert(true)
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(
          `Break reminder. You have been driving for ${breakInterval} minutes. Please take a short break.`
        )
        window.speechSynthesis.speak(u)
      }
    }, breakInterval * 60 * 1000)
  }

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }
    clearInterval(timerRef.current)
    clearTimeout(breakTimerRef.current)
    setIsTracking(false)
    setBreakAlert(false)
  }

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-white text-xl font-bold">Drive Safe Monitor</h2>
        <p className="text-gray-400 text-xs mt-1">
          Real-time speed tracking + break reminders
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">

        {/* Break alert */}
        {breakAlert && (
          <div className="bg-yellow-900 border border-yellow-600 rounded-2xl p-4 mb-4">
            <p className="text-yellow-200 font-bold text-base mb-1">
              ☕ Break Time!
            </p>
            <p className="text-yellow-300 text-xs">
              You've been driving for {breakInterval} minutes. Pull over safely and take a break.
              Drowsy driving is as dangerous as drunk driving.
            </p>
            <button
              onClick={() => setBreakAlert(false)}
              className="mt-3 bg-yellow-700 hover:bg-yellow-600 text-white
                         text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              ✓ I'm taking a break
            </button>
          </div>
        )}

        {/* GPS error */}
        {gpsError && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-3 mb-4">
            <p className="text-red-300 text-xs">{gpsError}</p>
          </div>
        )}

        {/* Speed gauge */}
        <div className="flex justify-center mb-4">
          <SpeedGauge speed={speed} limit={currentLimit} />
        </div>

        {/* Speed limit display */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-gray-400 text-sm">Limit:</span>
          <span className="text-white font-bold text-lg">{currentLimit} km/h</span>
          <span className="text-gray-400 text-sm">
            ({SPEED_LIMITS[roadType].icon} {SPEED_LIMITS[roadType].label})
          </span>
        </div>

        {/* Road type selector */}
        {!isTracking && (
          <div className="mb-4">
            <p className="text-gray-400 text-xs mb-2">Road type:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SPEED_LIMITS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setRoadType(key)}
                  className={`flex items-center gap-2 rounded-xl border p-3
                              transition-colors text-left
                              ${roadType === key
                                ? 'bg-red-700 border-red-500'
                                : 'bg-gray-900 border-gray-800'
                              }`}
                >
                  <span>{val.icon}</span>
                  <div>
                    <p className="text-white text-xs font-medium">{val.label}</p>
                    <p className="text-gray-400 text-xs">{val.limit} km/h</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Break interval selector */}
        {!isTracking && (
          <div className="mb-4">
            <p className="text-gray-400 text-xs mb-2">Break reminder every:</p>
            <div className="flex gap-2">
              {BREAK_INTERVALS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setBreakInterval(mins)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border
                              transition-colors
                              ${breakInterval === mins
                                ? 'bg-red-600 border-red-500 text-white'
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                              }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        {isTracking && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Duration',  value: formatDuration(duration),              icon: '⏱️' },
              { label: 'Distance',  value: `${distance.toFixed(1)} km`,            icon: '📏' },
              { label: 'Max speed', value: `${Math.round(maxSpeed)} km/h`,         icon: '🏎️' },
            ].map((stat) => (
              <div key={stat.label}
                   className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <p className="text-lg">{stat.icon}</p>
                <p className="text-white font-bold text-sm">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Speed alerts counter */}
        {isTracking && speedAlerts > 0 && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-300 text-xs font-semibold">
                {speedAlerts} speed limit violation{speedAlerts !== 1 ? 's' : ''} this trip
              </p>
              <p className="text-red-400 text-xs">Please slow down</p>
            </div>
          </div>
        )}

        {/* Start / Stop button */}
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={`w-full py-5 rounded-2xl text-white font-bold text-xl
                      transition-all active:scale-95 shadow-lg mb-4
                      ${isTracking
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-red-600 hover:bg-red-500'
                      }`}
        >
          {isTracking ? '⏹ Stop Monitoring' : '▶ Start Drive Safe Mode'}
        </button>

        {/* Tips */}
        {!isTracking && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-white text-xs font-semibold mb-3">
              🛡️ Drive safe checklist before you go:
            </p>
            <div className="flex flex-col gap-2">
              {[
                '✓ Seatbelt on for all passengers',
                '✓ Phone on silent / Do Not Disturb',
                '✓ Mirrors adjusted before starting',
                '✓ Tyre pressure checked this week',
                '✓ Enough fuel for the journey',
                '✓ Emergency numbers saved (108, 112)',
              ].map((tip, i) => (
                <p key={i} className="text-gray-400 text-xs">{tip}</p>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}

// Distance helper
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R    = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}