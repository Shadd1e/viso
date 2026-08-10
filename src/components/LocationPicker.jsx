import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { forwardGeocode, reverseGeocode } from '../lib/geo.js'

// MapLibre's free public demo style — swap for a branded MapTiler / Stadia
// Maps style URL (or a self-hosted one) to match Viso's colors. Nothing
// else in this component depends on which style is loaded.
const MAP_STYLE = 'https://demotiles.maplibre.org/style.json'
const DEFAULT_CENTER = [-84.3733, 33.848] // [lng, lat]

// Two ways in, and only two: share live GPS, or type an address and confirm
// the real pin on the map. There's no free-text mileage field — distance is
// always derived from an actual point.
export default function LocationPicker({ onConfirm }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  const [mode, setMode] = useState(null) // 'live' | 'search' | null
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [pin, setPin] = useState(null) // { lat, lng, label }
  const [locating, setLocating] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const watchIdRef = useRef(null)

  // Init map once
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: mapEl.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: 10,
      attributionControl: true,
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  function placePin(lat, lng, label, { draggable = true } = {}) {
    const map = mapRef.current
    if (!map) return
    if (markerRef.current) markerRef.current.remove()
    const marker = new maplibregl.Marker({ color: '#33359C', draggable })
      .setLngLat([lng, lat])
      .addTo(map)
    if (draggable) {
      marker.on('dragend', async () => {
        const { lat: nlat, lng: nlng } = marker.getLngLat()
        setPin((p) => ({ ...p, lat: nlat, lng: nlng, label: 'Locating address…' }))
        try {
          const addr = await reverseGeocode({ lat: nlat, lng: nlng })
          setPin({ lat: nlat, lng: nlng, label: addr })
        } catch {
          setPin({ lat: nlat, lng: nlng, label: `${nlat.toFixed(5)}, ${nlng.toFixed(5)}` })
        }
        setConfirmed(false)
      })
    }
    markerRef.current = marker
    map.flyTo({ center: [lng, lat], zoom: 14 })
    setPin({ lat, lng, label })
    setConfirmed(false)
  }

  function startLiveLocation() {
    setMode('live')
    setSearchError('')
    if (!('geolocation' in navigator)) {
      setSearchError('This browser can\u2019t share live location.')
      return
    }
    setLocating(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setLocating(false)
        if (!pin) {
          try {
            const addr = await reverseGeocode({ lat, lng })
            placePin(lat, lng, addr, { draggable: false })
          } catch {
            placePin(lat, lng, 'Your live location', { draggable: false })
          }
        } else if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat])
          setPin((p) => ({ ...p, lat, lng }))
        }
      },
      () => {
        setLocating(false)
        setSearchError('Location access was blocked — enable it, or type your address instead.')
      },
      { enableHighAccuracy: true }
    )
  }

  function stopLiveLocation() {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
  }

  useEffect(() => () => stopLiveLocation(), [])

  async function runSearch(q) {
    setQuery(q)
    setSearchError('')
    if (q.trim().length < 3) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const matches = await forwardGeocode(q)
      setResults(matches)
      if (matches.length === 0) setSearchError('No matches — try adding city and state.')
    } catch {
      setSearchError('Couldn\u2019t search right now — try again in a moment.')
    } finally {
      setSearching(false)
    }
  }

  function pickResult(r) {
    stopLiveLocation()
    setMode('search')
    setResults([])
    setQuery(r.label)
    placePin(r.lat, r.lng, r.label)
  }

  function confirm() {
    if (!pin) return
    setConfirmed(true)
    onConfirm?.(pin)
  }

  return (
    <div className="p-5 rounded-xl border border-line bg-[#FAFAF8]">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          data-cursor
          onClick={startLiveLocation}
          className={
            'flex-1 px-4 py-3 rounded-lg border text-sm font-label transition-colors ' +
            (mode === 'live' ? 'border-blue text-blue bg-blue/5' : 'border-line hover:border-blue/60')
          }
        >
          {locating ? 'Finding you…' : mode === 'live' ? 'Sharing live location' : 'Use my live location'}
        </button>
        <button
          type="button"
          data-cursor
          onClick={() => {
            stopLiveLocation()
            setMode('search')
          }}
          className={
            'flex-1 px-4 py-3 rounded-lg border text-sm font-label transition-colors ' +
            (mode === 'search' ? 'border-blue text-blue bg-blue/5' : 'border-line hover:border-blue/60')
          }
        >
          Type my address
        </button>
      </div>

      {mode === 'search' && (
        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => runSearch(e.target.value)}
            placeholder="Start typing an address…"
            className="w-full px-4 py-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue"
          />
          {(results.length > 0 || searching) && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg border border-line bg-white shadow-lg overflow-hidden">
              {searching && <div className="px-4 py-2.5 text-xs text-muted">Searching…</div>}
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickResult(r)}
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-blue/5 border-t border-line first:border-t-0"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {searchError && <p className="text-xs text-red-600 mb-3">{searchError}</p>}

      <div ref={mapEl} className="w-full h-56 rounded-lg overflow-hidden border border-line" />

      {pin ? (
        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted leading-relaxed max-w-[420px]">
            <span className="text-ink font-medium">Pinned: </span>
            {pin.label}
            {mode === 'search' && ' — drag the pin if it\u2019s not exact.'}
          </p>
          <button
            type="button"
            data-cursor
            onClick={confirm}
            className={
              'px-4 py-2 rounded-lg text-sm font-label transition-colors shrink-0 ' +
              (confirmed ? 'bg-blue/10 text-blue' : 'bg-blue text-white hover:bg-blue-deep')
            }
          >
            {confirmed ? 'Location confirmed \u2713' : 'Confirm this location'}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted">
          Share your live location or type an address above — we\u2019ll only use a real, tagged point on the map.
        </p>
      )}
    </div>
  )
}
