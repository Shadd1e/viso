import { milesBetween } from './geo.js'

const LOCATION_URL = import.meta.env.VITE_TECHNICIAN_LOCATIONS_URL
const MAX_LOCATION_AGE_MS = 2 * 60 * 1000

export async function getTechnicianLocations() {
  if (!LOCATION_URL) return []
  const res = await fetch(LOCATION_URL, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Unable to load technician locations.')
  const data = await res.json()
  return Array.isArray(data) ? data : (data.technicians || [])
}

export async function findNearestTechnician(customerLocation, selectedServiceIds = []) {
  if (!customerLocation?.lat || !customerLocation?.lng) return null
  const technicians = await getTechnicianLocations()
  return getClosestEligibleTechnician(customerLocation, technicians, selectedServiceIds)
}

export function getClosestEligibleTechnician(customer, technicians, requiredServiceIds = []) {
  const now = Date.now()
  return technicians
    .filter((t) => t.status === 'available')
    .filter((t) => t.latitude != null && t.longitude != null)
    .filter((t) => !t.updatedAt || now - new Date(t.updatedAt).getTime() <= MAX_LOCATION_AGE_MS)
    .filter((t) => !requiredServiceIds.length || !Array.isArray(t.services) || requiredServiceIds.every((id) => t.services.includes(id)))
    .map((t) => ({ ...t, distanceMiles: milesBetween(customer, { lat: Number(t.latitude), lng: Number(t.longitude) }) }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles)[0] || null
}
