// sw.js — RoadSOS Service Worker
// This file runs in the background and manages caching
// It makes the app work offline

const CACHE_NAME = 'roadsos-v1'

// These are the emergency numbers we bake into the cache
// Available even with zero internet
const OFFLINE_EMERGENCY_DATA = {
  IN: {
    country: 'India',
    numbers: {
      ambulance: '108',
      police: '112',
      fire: '101',
      highway: '1033',
      police_alt: '100',
    },
  },
  US: { country: 'United States', numbers: { ambulance: '911', police: '911', fire: '911' } },
  UK: { country: 'United Kingdom', numbers: { ambulance: '999', police: '999', fire: '999' } },
  AU: { country: 'Australia', numbers: { ambulance: '000', police: '000', fire: '000' } },
  DE: { country: 'Germany', numbers: { ambulance: '112', police: '110', fire: '112' } },
  FR: { country: 'France', numbers: { ambulance: '15', police: '17', fire: '18' } },
  AE: { country: 'UAE', numbers: { ambulance: '998', police: '999', fire: '997' } },
  SG: { country: 'Singapore', numbers: { ambulance: '995', police: '999', fire: '995' } },
}

// These first-aid tips are cached and shown when AI is unavailable
const OFFLINE_FIRST_AID = [
  {
    situation: 'accident',
    steps: [
      'Call 108 (ambulance) immediately',
      'Turn on hazard lights',
      'Do not move injured persons',
      'Apply pressure to any bleeding wounds',
      'Keep the person warm and still',
      'Clear the area of traffic if safe',
    ],
  },
  {
    situation: 'not_breathing',
    steps: [
      'Call 108 immediately',
      'Tilt head back, lift chin',
      'Give 2 rescue breaths',
      'Do 30 chest compressions — push hard and fast',
      'Repeat: 30 compressions, 2 breaths',
      'Continue until ambulance arrives',
    ],
  },
  {
    situation: 'bleeding',
    steps: [
      'Apply firm pressure with clean cloth',
      'Do not remove the cloth — add more on top',
      'Elevate the injured limb if possible',
      'Maintain pressure for at least 10 minutes',
      'Call 108 for serious bleeding',
    ],
  },
]

// Install event — cache all app files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing RoadSOS Service Worker')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache the emergency data so it is always available
      // We store it as a custom cache entry
      const emergencyResponse = new Response(
        JSON.stringify({ emergencyData: OFFLINE_EMERGENCY_DATA, firstAid: OFFLINE_FIRST_AID }),
        { headers: { 'Content-Type': 'application/json' } }
      )
      return cache.put('/offline-data', emergencyResponse)
    })
  )
  // Activate immediately without waiting for old SW to expire
  self.skipWaiting()
})

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating RoadSOS Service Worker')
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key)
            return caches.delete(key)
          })
      )
    )
  )
  self.clients.claim()
})

// Fetch event — serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Do not intercept API calls to our backend or external services
  // These should fail gracefully when offline — we handle that in the UI
  if (
    url.hostname === 'localhost' ||
    url.hostname.includes('overpass-api') ||
    url.hostname.includes('nominatim') ||
    url.hostname.includes('anthropic')
  ) {
    return // Let these pass through normally
  }

  // For everything else (app files, assets) — cache first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // We have it cached — return immediately
        // Also update the cache in the background for next time
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone())
              })
            }
          })
          .catch(() => {}) // Silently fail background update if offline
        return cachedResponse
      }

      // Not in cache — fetch from network and cache it
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // Both cache and network failed
          // Return a fallback for HTML navigation requests
          if (request.destination === 'document') {
            return caches.match('/')
          }
        })
    })
  )
})

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'GET_OFFLINE_DATA') {
    // Send cached emergency data back to the app
    caches.open(CACHE_NAME).then((cache) => {
      cache.match('/offline-data').then((response) => {
        if (response) {
          response.json().then((data) => {
            event.source.postMessage({ type: 'OFFLINE_DATA', data })
          })
        }
      })
    })
  }
})