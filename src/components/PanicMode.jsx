import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../hooks/useSettings'

// The three most important numbers — shown as giant tap-to-call buttons
const EMERGENCY_CALLS = [
  { label: 'Ambulance', number: '108', icon: '🚑', color: 'bg-red-700 hover:bg-red-600' },
  { label: 'Police',    number: '112', icon: '🚔', color: 'bg-blue-700 hover:bg-blue-600' },
  { label: 'Highway',   number: '1033', icon: '🛣️', color: 'bg-yellow-700 hover:bg-yellow-600' },
]

// First aid reminders shown during the countdown
// Rotates every 4 seconds to give bystanders quick instructions
const FIRST_AID_TIPS = [
  '🛑 Do NOT move the injured person',
  '🩸 Apply firm pressure to any bleeding wounds',
  '💨 Check if the person is breathing',
  '🔦 Turn on hazard lights if safe to do so',
  '🧍 Keep bystanders back — give the person space',
  '❄️ Keep the person warm with a jacket or blanket',
]

// Speaks text aloud using the browser's built-in text-to-speech
function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel() // stop anything already speaking
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.9   // slightly slower than default
  utterance.pitch = 1
  utterance.volume = 1
  window.speechSynthesis.speak(utterance)
}

// Single giant call button
function BigCallButton({ service }) {
  const [tapped, setTapped] = useState(false)

  const handleCall = () => {
    setTapped(true)
    speak(`Calling ${service.label}`)
    window.location.href = `tel:${service.number}`
    setTimeout(() => setTapped(false), 3000)
  }

  return (
    <button
      onClick={handleCall}
      className={`flex flex-col items-center justify-center rounded-2xl py-4 w-full
                  transition-all duration-150 active:scale-95 border border-white/10
                  ${tapped ? 'bg-green-700' : service.color}`}
    >
      <span className="text-3xl mb-1">{service.icon}</span>
      <span className="text-white font-bold text-base">
        {tapped ? 'Calling...' : service.label}
      </span>
      <span className="text-white/80 font-mono text-xl font-bold">
        {service.number}
      </span>
    </button>
  )
}

// The full-screen panic overlay
export default function PanicMode({ isOpen, onClose, location }) {
  const { contacts } = useSettings()
  const [countdown, setCountdown] = useState(10)
  const [alertSent, setAlertSent] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const countdownRef = useRef(null)
  const tipRef = useRef(null)

  // When panic mode opens — start everything
  useEffect(() => {
    if (!isOpen) return

    // Reset state every time it opens
    setCountdown(10)
    setAlertSent(false)
    setTipIndex(0)

    // Speak the opening alert immediately
    speak('Emergency mode activated. Call 108 for ambulance. Help is on the way.')

    // Start the 10-second countdown
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          triggerSMSAlert()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Rotate first-aid tips every 4 seconds
    tipRef.current = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % FIRST_AID_TIPS.length)
    }, 4000)

    // Cleanup when panic mode closes
    return () => {
      clearInterval(countdownRef.current)
      clearInterval(tipRef.current)
      window.speechSynthesis?.cancel()
    }
  }, [isOpen])

  // Sends SMS alert to all saved emergency contacts
  const triggerSMSAlert = () => {
    if (contacts.length === 0) return

    let locationText = 'Location unavailable'
    if (location) {
      const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`
      locationText = `GPS: ${mapsLink}`
    }

    const message =
      `🚨 EMERGENCY ALERT — RoadSOS\n\n` +
      `This is an automated SOS from RoadSOS.\n` +
      `I am in an emergency and need immediate help.\n\n` +
      `${locationText}\n\n` +
      `Please call me or contact emergency services:\n` +
      `• Ambulance: 108\n• Police: 112`

    const phoneNumbers = contacts.map((c) => c.phone).join(',')
    window.location.href = `sms:${phoneNumbers}?body=${encodeURIComponent(message)}`
    setAlertSent(true)

    speak('SMS alert sent to your emergency contacts.')
  }

  // User cancelled — stop everything
  const handleCancel = () => {
    clearInterval(countdownRef.current)
    clearInterval(tipRef.current)
    window.speechSynthesis?.cancel()
    onClose()
  }

  // Manual SOS if user doesn't want to wait for countdown
  const handleManualSOS = () => {
    clearInterval(countdownRef.current)
    setCountdown(0)
    triggerSMSAlert()
  }

  if (!isOpen) return null

  return (
    // Full-screen overlay — sits on top of everything
    <div className="fixed inset-0 z-50 bg-red-950 flex flex-col max-w-md mx-auto">

      {/* TOP: CANCEL button */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <button
          onClick={handleCancel}
          className="bg-gray-800 hover:bg-gray-700 text-white text-sm 
                     font-medium px-5 py-2.5 rounded-full border border-gray-600
                     transition-colors"
        >
          ✕ Cancel
        </button>
        <span className="text-red-300 text-sm font-medium">
          PANIC MODE
        </span>
        {/* Pulsing red dot */}
        <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
      </div>

      {/* COUNTDOWN OR ALERT SENT */}
      <div className="flex flex-col items-center justify-center py-6 px-4">
        {!alertSent ? (
          <>
            {/* Countdown ring */}
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                {/* Countdown progress arc */}
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - countdown / 10)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              {/* Number in the centre */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-bold text-4xl leading-none">
                  {countdown}
                </span>
                <span className="text-red-300 text-xs mt-1">seconds</span>
              </div>
            </div>

            <p className="text-white font-bold text-lg text-center mb-1">
              Sending SOS Alert
            </p>
            <p className="text-red-300 text-sm text-center mb-4">
              {contacts.length > 0
                ? `Alerting ${contacts.length} contact${contacts.length !== 1 ? 's' : ''} in ${countdown}s`
                : 'No contacts saved — add them in Settings'}
            </p>

            {/* Send NOW button — skip the countdown */}
            {contacts.length > 0 && (
              <button
                onClick={handleManualSOS}
                className="bg-red-600 hover:bg-red-500 text-white font-bold
                           px-8 py-3 rounded-2xl text-sm transition-colors
                           border border-red-400 mb-2"
              >
                🚨 Send NOW — don't wait
              </button>
            )}
          </>
        ) : (
          // Alert was sent
          <div className="flex flex-col items-center py-4">
            <span className="text-5xl mb-3">✅</span>
            <p className="text-white font-bold text-lg text-center">
              SOS Alert Sent!
            </p>
            <p className="text-green-300 text-sm text-center mt-1">
              Your contacts have been notified.
            </p>
          </div>
        )}
      </div>

      {/* FIRST AID TIP — rotates every 4 seconds */}
      <div className="mx-4 bg-red-900/50 border border-red-700 rounded-2xl px-4 py-3 mb-4">
        <p className="text-red-200 text-xs font-semibold mb-1">
          ⚡ Do this right now:
        </p>
        <p className="text-white text-sm font-medium">
          {FIRST_AID_TIPS[tipIndex]}
        </p>
      </div>

      {/* THREE BIG CALL BUTTONS */}
      <div className="px-4 mb-4">
        <p className="text-red-300 text-xs font-semibold mb-2 text-center">
          TAP TO CALL IMMEDIATELY:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {EMERGENCY_CALLS.map((service) => (
            <BigCallButton key={service.number} service={service} />
          ))}
        </div>
      </div>

      {/* BOTTOM: location info */}
      <div className="px-4 pb-6 mt-auto">
        <div className="bg-black/30 rounded-xl px-4 py-3 text-center">
          {location ? (
            <>
              <p className="text-red-300 text-xs font-medium">📍 Your GPS location:</p>
              <p className="text-white/70 text-xs font-mono mt-0.5">
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
              <p className="text-green-400 text-xs mt-1">
                ✓ Included in SOS message
              </p>
            </>
          ) : (
            <p className="text-red-300 text-xs">
              📡 Getting GPS location...
            </p>
          )}
        </div>
      </div>

    </div>
  )
}