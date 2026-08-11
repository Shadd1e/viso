import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ATLANTA_CENTER, forwardGeocode, reverseGeocode } from '../lib/geo.js'

const MAP_STYLE = 'https://demotiles.maplibre.org/style.json'
const DEFAULT_CENTER = [ATLANTA_CENTER.lng, ATLANTA_CENTER.lat]

export default function LocationPicker({ onConfirm }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const watchIdRef = useRef(null)
  const [mode, setMode] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [pin, setPin] = useState(null)
  const [locating, setLocating] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return
    const map = new maplibregl.Map({ container: mapEl.current, style: MAP_STYLE, center: DEFAULT_CENTER, zoom: 9.7, attributionControl: true })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => () => {
    if (watchIdRef.current != null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  function placePin(location, { draggable = true } = {}) {
    const map = mapRef.current
    if (!map) return
    if (markerRef.current) markerRef.current.remove()
    const marker = new maplibregl.Marker({ color: '#33359C', draggable }).setLngLat([location.lng, location.lat]).addTo(map)
    if (draggable) {
      marker.on('dragend', async () => {
        const { lat, lng } = marker.getLngLat()
        setConfirmed(false)
        setPin((p) => ({ ...(p || location), lat, lng, label: 'Updating address…' }))
        try {
          const next = await reverseGeocode({ lat, lng })
          setPin(next)
        } catch (error) {
          setPin((p) => ({ ...(p || location), lat, lng, label: error.code === 'OUTSIDE_GEORGIA' ? 'Outside Georgia' : `${lat.toFixed(5)}, ${lng.toFixed(5)}` }))
        }
      })
    }
    markerRef.current = marker
    map.flyTo({ center: [location.lng, location.lat], zoom: 14 })
    setPin(location)
    setConfirmed(false)
  }

  function startLiveLocation() {
    setMode('live')
    setSearchError('')
    setConfirmed(false)
    if (!('geolocation' in navigator)) {
      setSearchError('This browser cannot share live location. You can enter your address instead.')
      return
    }
    setLocating(true)
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords
        try {
          const location = await reverseGeocode({ lat, lng })
          setLocating(false)
          placePin(location, { draggable: false })
        } catch (error) {
          setLocating(false)
          setSearchError(error.code === 'OUTSIDE_GEORGIA' ? 'That location is outside Viso’s Georgia service area.' : 'We could not verify that location. Try entering the address instead.')
        }
      },
      () => {
        setLocating(false)
        setSearchError('Location access was blocked. You can enable it or enter your address instead.')
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 12000 }
    )
  }

  function stopLiveLocation() {
    if (watchIdRef.current != null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
  }

  async function runSearch(value) {
    setQuery(value)
    setSearchError('')
    setConfirmed(false)
    if (value.trim().length < 3) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const matches = await forwardGeocode(value)
      setResults(matches)
      if (!matches.length) setSearchError('No Georgia locations found. Try adding the city or ZIP code.')
    } catch {
      setSearchError('We could not search right now. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  function pickResult(result) {
    stopLiveLocation()
    setMode('search')
    setResults([])
    setQuery(result.label)
    placePin(result)
  }

  function confirm() {
    if (!pin || !pin.state || pin.state.toLowerCase() !== 'georgia') return
    setConfirmed(true)
    onConfirm?.(pin)
  }

  return (
    <div className="rounded-[1.5rem] border border-line bg-soft p-5 md:p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[.18em] font-label text-blue">Service location</p>
        <h3 className="mt-2 text-xl md:text-2xl font-display">Where should we meet your car?</h3>
        <p className="mt-2 text-sm leading-6 text-muted">We only ask for location access when you need it. Viso currently serves Georgia, with coverage confirmed before booking.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={startLiveLocation} data-cursor className={`rounded-xl border px-4 py-3 text-sm font-label transition ${mode === 'live' ? 'border-blue bg-blue/5 text-blue' : 'border-line bg-white hover:border-blue/50'}`}>
          {locating ? 'Finding you…' : 'Use my current location'}
        </button>
        <button type="button" onClick={() => { stopLiveLocation(); setMode('search'); setSearchError('') }} data-cursor className={`rounded-xl border px-4 py-3 text-sm font-label transition ${mode === 'search' ? 'border-blue bg-blue/5 text-blue' : 'border-line bg-white hover:border-blue/50'}`}>
          Enter an address
        </button>
      </div>

      {mode === 'search' && (
        <div className="relative mt-3">
          <input value={query} onChange={(e) => runSearch(e.target.value)} placeholder="Street, city, ZIP…" className="field" autoComplete="street-address" />
          {(results.length > 0 || searching) && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-line bg-white shadow-xl overflow-hidden">
              {searching && <div className="px-4 py-3 text-xs text-muted">Searching Georgia locations…</div>}
              {results.map((result) => (
                <button key={`${result.lat}-${result.lng}`} type="button" onClick={() => pickResult(result)} className="block w-full text-left px-4 py-3 text-sm hover:bg-blue/5 border-t border-line first:border-t-0">
                  {result.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {searchError && <p className="mt-3 text-sm text-red-600">{searchError}</p>}

      <div ref={mapEl} className="mt-4 h-60 w-full overflow-hidden rounded-xl border border-line" />

      {pin ? (
        <div className="mt-4 flex items-end justify-between gap-4 flex-wrap">
          <div className="max-w-xl text-sm leading-6 text-muted">
            <span className="font-medium text-ink">Pinned location:</span> {pin.label}
            {mode === 'search' && <span className="block text-xs mt-1 text-ink/45">You can drag the pin to fine-tune the meeting point.</span>}
          </div>
          <button type="button" onClick={confirm} data-cursor disabled={confirmed} className={`rounded-xl px-5 py-3 text-sm font-label transition ${confirmed ? 'bg-blue/10 text-blue' : 'bg-blue text-white hover:bg-blue-deep'}`}>
            {confirmed ? 'Location confirmed ✓' : 'Confirm location'}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-muted">Your location is not requested until you choose one of the options above.</p>
      )}
    </div>
  )
}
