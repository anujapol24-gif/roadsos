import { useEffect, useState } from 'react'

// The loading steps shown during splash
// Each step appears for a moment before the next
const BOOT_STEPS = [
  { icon: '📡', text: 'Detecting your location...' },
  { icon: '🗄️', text: 'Loading emergency database...' },
  { icon: '🤖', text: 'Initialising AI assistant...' },
  { icon: '📶', text: 'Checking network status...' },
  { icon: '✅', text: 'RoadSOS is ready' },
]

export default function SplashScreen({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Advance through boot steps every 400ms
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= BOOT_STEPS.length - 1) {
          clearInterval(interval)
          // Start fade-out after the last step
          setTimeout(() => {
            setFadeOut(true)
            // Call onComplete after fade finishes
            setTimeout(onComplete, 500)
          }, 600)
          return prev
        }
        return prev + 1
      })
    }, 400)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center
                  bg-gray-950 max-w-md mx-auto transition-opacity duration-500
                  ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-24 rounded-3xl bg-red-600 flex items-center
                        justify-center text-5xl mb-5 shadow-lg shadow-red-900/50">
          🚨
        </div>
        <h1 className="text-white font-black text-4xl tracking-tight">
          RoadSOS
        </h1>
        <p className="text-red-400 text-sm font-medium mt-1 tracking-wide">
          AI Emergency Assistant
        </p>
      </div>

      {/* Boot steps */}
      <div className="flex flex-col gap-2 w-64">
        {BOOT_STEPS.slice(0, stepIndex + 1).map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 transition-all duration-300
                        ${i === stepIndex ? 'opacity-100' : 'opacity-40'}`}
          >
            <span className="text-lg w-7 text-center">{step.icon}</span>
            <span className={`text-sm ${i === stepIndex ? 'text-white' : 'text-gray-500'}`}>
              {step.text}
            </span>
            {i < stepIndex && (
              <span className="ml-auto text-green-400 text-xs">✓</span>
            )}
            {i === stepIndex && i < BOOT_STEPS.length - 1 && (
              <span className="ml-auto">
                <span className="w-3 h-3 border-2 border-red-500 border-t-transparent
                                 rounded-full animate-spin block" />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-10 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-600 rounded-full transition-all duration-400"
          style={{ width: `${((stepIndex + 1) / BOOT_STEPS.length) * 100}%` }}
        />
      </div>

      {/* IIT Madras tag */}
      <p className="absolute bottom-8 text-gray-600 text-xs">
        Built for IIT Madras Road Safety Hackathon 2026
      </p>
    </div>
  )
}