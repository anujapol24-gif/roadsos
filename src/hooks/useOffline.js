// useOffline.js
// Detects whether the user is online or offline
// and provides cached emergency data when offline

import { useState, useEffect } from 'react'

export function useOffline() {
  // navigator.onLine is true if browser thinks it has internet
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineData, setOfflineData] = useState(null)

  useEffect(() => {
    // Listen for browser online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      console.log('[RoadSOS] Network restored')
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('[RoadSOS] Network lost — switching to offline mode')
      // Request cached data from service worker
      requestOfflineData()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Also request offline data on mount so it is ready if needed
    requestOfflineData()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Ask the service worker for the cached emergency data
  const requestOfflineData = () => {
    if (!navigator.serviceWorker?.controller) return

    navigator.serviceWorker.controller.postMessage('GET_OFFLINE_DATA')

    // Listen for the response
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'OFFLINE_DATA') {
        setOfflineData(event.data.data)
      }
    })
  }

  return {
    isOnline,
    offlineData,
  }
}