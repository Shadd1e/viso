// Shared geo helpers for the booking flow.
//
// Geocoding here hits OpenStreetMap's public Nominatim endpoint so the flow
// works out of the box with no API key. It's rate-limited and not meant for
// production traffic — swap `forwardGeocode` / `reverseGeocode` for a paid
// provider (Mapbox Geocoding, Radar, Here) before launch. Nothing else in
// the app needs to change; both functions already return the same shape.

// Viso's dispatch depot — used as the origin point for the mileage estimate
// shown pre-payment. Replace with your real shop coordinates.
export const DEPOT = { lat: 33.8480, lng: -84.3733, label: '4200 Peachtree Rd, Atlanta, GA' }

const AVG_DISPATCH_SPEED_MPH = 24

export function milesBetween(a, b) {
  const R = 3958.8 // earth radius, miles
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function etaMinutes(distanceMiles) {
  return Math.max(Math.round((distanceMiles / AVG_DISPATCH_SPEED_MPH) * 60), 3)
}

// Forward geocode: turns typed text into a short list of real, tappable
// location candidates. The UI is responsible for letting the user confirm
// one on the map rather than trusting raw text input.
export async function forwardGeocode(query) {
  if (!query || query.trim().length < 3) return []
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('geocode-failed')
  const data = await res.json()
  return data.map((d) => ({
    label: d.display_name,
    lat: Number(d.lat),
    lng: Number(d.lon),
  }))
}

// Reverse geocode: turns a dropped/GPS pin into a human-readable address so
// the confirmation UI never shows the customer raw coordinates.
export async function reverseGeocode({ lat, lng }) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('reverse-geocode-failed')
  const data = await res.json()
  return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}
