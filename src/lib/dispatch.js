import { milesBetween } from './geo.js'

// The UI is ready for a real technician-location feed without inventing one.
// Set VITE_TECHNICIAN_LOCATIONS_URL to the authenticated admin/dispatch endpoint.
// Expected response: { technicians: [{ id, name, lat, lng, lastSeenAt, available, services }] }

const MAX_LOCATION_AGE_MS = 2 * 60 * 1000

export async function findNearestTechnician(customerLocation, selectedServiceIds = []) {
  const endpoint = import.meta.env.VITE_TECHNICIAN_LOCATIONS_URL
  if (!endpoint || !customerLocation?.lat || !customerLocation?.lng) return null

  const response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('technician-feed-failed')
  const payload = await response.json()
  const technicians = Array.isArray(payload?.technicians) ? payload.technicians : []
  const now = Date.now()

  const eligible = technicians
    .filter((tech) => tech.available !== false)
    .filter((tech) => Number.isFinite(Number(tech.lat)) && Number.isFinite(Number(tech.lng)))
    .filter((tech) => {
      if (!tech.lastSeenAt) return false
      return now - new Date(tech.lastSeenAt).getTime() <= MAX_LOCATION_AGE_MS
    })
    .filter((tech) => {
      if (!selectedServiceIds.length || !Array.isArray(tech.services) || !tech.services.length) return true
      return selectedServiceIds.every((id) => tech.services.includes(id))
    })
    .map((tech) => ({ ...tech, distanceMiles: milesBetween(customerLocation, { lat: Number(tech.lat), lng: Number(tech.lng) }) }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles)

  return eligible[0] || null
}
