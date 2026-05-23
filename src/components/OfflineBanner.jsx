// OfflineBanner.jsx
// Shown at the top of the app when network is lost
// Also shows the install prompt for PWA

import { useState, useEffect } from 'react'

export default function OfflineBanner({ isOnline }) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // The browser fires this event when the app is installable as a PWA
    const handleBeforeInstall = (e) => {
      e.preventDefault() // Prevent the default mini-infobar
      setInstallPrompt(e)
      setShowInstall(true)
    }

    // Hide the install button if user already installed the app
    const handleAppInstalled = () => {
      setInstalled(true)
      setShowInstall(false)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstall(false)
    }
  }

  // Nothing to show — online and no install prompt
  if (isOnline && !showInstall) return null

  return (
    <div className="flex flex-col">
      {/* OFFLINE warning strip */}
      {!isOnline && (
        <div className="flex items-center justify-between
                        bg-yellow-900 border-b border-yellow-700
                        px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-sm">⚡</span>
            <span className="text-yellow-200 text-xs font-medium">
              Offline mode — emergency numbers still available
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
        </div>
      )}

      {/* PWA INSTALL prompt strip */}
      {showInstall && !installed && (
        <div className="flex items-center justify-between
                        bg-blue-900 border-b border-blue-700
                        px-4 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-blue-300 text-sm flex-shrink-0">📲</span>
            <span className="text-blue-200 text-xs truncate">
              Install RoadSOS on your home screen
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="bg-blue-600 hover:bg-blue-500 text-white
                         text-xs font-medium px-3 py-1.5 rounded-lg
                         transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstall(false)}
              className="text-blue-400 hover:text-blue-300 text-sm px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}