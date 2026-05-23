// locationService.js
// Fetches real nearby emergency services using the Overpass API
// This is completely free — it uses OpenStreetMap data
// No API key required

// Types of services we can search for
// Each has an Overpass query tag and display info
const SERVICE_TYPES = {
  hospital: {
    label: 'Hospital',
    icon: '🏥',
    color: 'text-red-400',
    bgColor: 'bg-red-950',
    borderColor: 'border-red-800',
    query: `node["amenity"="hospital"]`,
  },
  clinic: {
    label: 'Clinic',
    icon: '🏨',
    color: 'text-pink-400',
    bgColor: 'bg-pink-950',
    borderColor: 'border-pink-800',
    query: `node["amenity"="clinic"]`,
  },
  police: {
    label: 'Police Station',
    icon: '🚔',
    color: 'text-blue-400',
    bgColor: 'bg-blue-950',
    borderColor: 'border-blue-800',
    query: `node["amenity"="police"]`,
  },
  fire_station: {
    label: 'Fire Station',
    icon: '🚒',
    color: 'text-orange-400',
    bgColor: 'bg-orange-950',
    borderColor: 'border-orange-800',
    query: `node["amenity"="fire_station"]`,
  },
  car_repair: {
    label: 'Car Repair / Towing',
    icon: '🔧',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-950',
    borderColor: 'border-yellow-800',
    query: `node["shop"="car_repair"]`,
  },
  tyres: {
    label: 'Tyre Shop',
    icon: '🔩',
    color: 'text-green-400',
    bgColor: 'bg-green-950',
    borderColor: 'border-green-800',
    query: `node["shop"="tyres"]`,
  },
  pharmacy: {
    label: 'Pharmacy',
    icon: '💊',
    color: 'text-purple-400',
    bgColor: 'bg-purple-950',
    borderColor: 'border-purple-800',
    query: `node["amenity"="pharmacy"]`,
  },
}

// Calculate straight-line distance between two points (Haversine formula)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Fetch nearby services from OpenStreetMap using the Overpass API
// lat, lng = user's GPS coordinates
// radiusMetres = search radius (default 5km)
// types = array of service type keys to search for
export async function fetchNearbyServices(lat, lng, radiusMetres = 5000, types = Object.keys(SERVICE_TYPES)) {

  // Build Overpass query — search for all requested types at once
  const queries = types
    .map((type) => SERVICE_TYPES[type]?.query)
    .filter(Boolean)
    .map((q) => `${q}(around:${radiusMetres},${lat},${lng});`)
    .join('\n')

  const overpassQuery = `
    [out:json][timeout:25];
    (
      ${queries}
    );
    out body;
  `

  const response = await fetch('https://overpass.kumi.systems/api/interpreter', {
    method: 'POST',
    body: overpassQuery,
  })

  if (!response.ok) {
    throw new Error('Failed to fetch from OpenStreetMap')
  }

  const data = await response.json()

  // Process and enrich each result
  const services = data.elements
    .map((element) => {
      const tags = element.tags || {}

      // Determine service type from OSM tags
      let type = 'hospital'
      if (tags.amenity === 'hospital') type = 'hospital'
      else if (tags.amenity === 'clinic') type = 'clinic'
      else if (tags.amenity === 'police') type = 'police'
      else if (tags.amenity === 'fire_station') type = 'fire_station'
      else if (tags.shop === 'car_repair') type = 'car_repair'
      else if (tags.shop === 'tyres') type = 'tyres'
      else if (tags.amenity === 'pharmacy') type = 'pharmacy'

      const typeInfo = SERVICE_TYPES[type]
      const distance = getDistanceKm(lat, lng, element.lat, element.lon)

      return {
        id: element.id,
        type,
        label: typeInfo.label,
        icon: typeInfo.icon,
        color: typeInfo.color,
        bgColor: typeInfo.bgColor,
        borderColor: typeInfo.borderColor,
        name: tags.name || tags['name:en'] || typeInfo.label,
        phone: tags.phone || tags['contact:phone'] || tags['phone:IN'] || null,
        address: [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:suburb'] || tags['addr:city'],
        ]
          .filter(Boolean)
          .join(', ') || null,
        lat: element.lat,
        lng: element.lon,
        distanceKm: distance,
        distanceText:
          distance < 1
            ? `${Math.round(distance * 1000)} m`
            : `${distance.toFixed(1)} km`,
        osmId: element.id,
      }
    })
    // Remove results with no name (low quality data)
    .filter((s) => s.name !== s.label || s.phone)
    // Sort by distance — nearest first
    .sort((a, b) => a.distanceKm - b.distanceKm)

  return services
}

export { SERVICE_TYPES }