// Geographic helpers used by the Viso booking flow.
// Customer locations are validated against Georgia before they can be confirmed.

export const ATLANTA_CENTER = { lat: 33.749, lng: -84.388, label: 'Atlanta, GA' }
export const GEORGIA = { state: 'Georgia', country: 'United States', countryCode: 'us' }

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

export function milesBetween(a, b) {
  const R = 3958.8
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function etaMinutes(distanceMiles) {
  return Math.max(Math.round((Number(distanceMiles || 0) / 24) * 60), 3)
}

export function isGeorgiaAddress(address = {}) {
  const state = String(address.state || '').trim().toLowerCase()
  const country = String(address.country || '').trim().toLowerCase()
  const code = String(address.country_code || '').trim().toLowerCase()
  return (state === 'georgia' || state === 'ga') && (country === 'united states' || code === 'us')
}

function normaliseResult(d) {
  const address = d.address || {}
  return {
    label: d.display_name,
    lat: Number(d.lat),
    lng: Number(d.lon),
    city: address.city || address.town || address.village || address.municipality || '',
    state: address.state || '',
    country: address.country || '',
    countryCode: address.country_code || '',
    postalCode: address.postcode || '',
  }
}

export async function forwardGeocode(query) {
  if (!query || query.trim().length < 3) return []
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    limit: '8',
    countrycodes: 'us',
    q: `${query}, Georgia, USA`,
  })
  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`)
  if (!res.ok) throw new Error('geocode-failed')
  const data = await res.json()
  return data.map(normaliseResult).filter((item) => isGeorgiaAddress({ state: item.state, country: item.country, country_code: item.countryCode }))
}

export async function reverseGeocode({ lat, lng }) {
  const params = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', lat: String(lat), lon: String(lng) })
  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`)
  if (!res.ok) throw new Error('reverse-geocode-failed')
  const data = await res.json()
  const item = normaliseResult(data)
  if (!isGeorgiaAddress(data.address || {})) {
    const error = new Error('outside-georgia')
    error.code = 'OUTSIDE_GEORGIA'
    throw error
  }
  return item
}
