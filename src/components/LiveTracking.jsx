import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { DEPOT, etaMinutes } from '../lib/geo.js'

const MAP_STYLE = 'https://demotiles.maplibre.org/style.json'

// This only ever mounts after payment (Booking.jsx gates it). Movement is
// still simulated client-side — swap the `progress` interval below for a
// real position feed (websocket / polling the technician's app) once
// dispatch is wired up; the marker and route-drawing code doesn't change.
export default function LiveTracking({ destination, technician = 'Marcus O.' }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const techMarkerRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [mapReady, setMapReady] = useState(false)

  const origin = DEPOT
  const dest = destination || { lat: DEPOT.lat + 0.06, lng: DEPOT.lng + 0.05, label: 'Your location' }

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: mapEl.current,
      style: MAP_STYLE,
      center: [origin.lng, origin.lat],
      zoom: 11,
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [[origin.lng, origin.lat], [dest.lng, dest.lat]] },
        },
      })
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#33359C', 'line-width': 3, 'line-dasharray': [1, 1.6] },
      })

      new maplibregl.Marker({ color: '#0B0B14' }).setLngLat([dest.lng, dest.lat]).addTo(map)
      techMarkerRef.current = new maplibregl.Marker({ color: '#33359C' })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map)

      const bounds = new maplibregl.LngLatBounds([origin.lng, origin.lat], [origin.lng, origin.lat])
      bounds.extend([dest.lng, dest.lat])
      map.fitBounds(bounds, { padding: 60, maxZoom: 13 })
      setMapReady(true)
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setProgress(0)
    const durationMs = 16000
    const start = Date.now()
    const id = setInterval(() => {
      const t = Math.min((Date.now() - start) / durationMs, 1)
      setProgress(t)
      if (t >= 1) clearInterval(id)
    }, 200)
    return () => clearInterval(id)
  }, [dest.lat, dest.lng])

  useEffect(() => {
    if (!mapReady || !techMarkerRef.current) return
    const lng = origin.lng + (dest.lng - origin.lng) * progress
    const lat = origin.lat + (dest.lat - origin.lat) * progress
    techMarkerRef.current.setLngLat([lng, lat])
  }, [progress, mapReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalDistance = Math.max(Math.hypot(dest.lat - origin.lat, dest.lng - origin.lng) * 69, 0.3)
  const remaining = Math.max(totalDistance * (1 - progress), 0)
  const eta = progress >= 1 ? 0 : etaMinutes(remaining)
  const status =
    progress >= 1 ? 'Arrived' : progress > 0.85 ? 'Arriving now' : progress > 0.08 ? 'En route' : 'Dispatched'

  return (
    <div className="rounded-xl border border-line overflow-hidden">
      <div className="relative h-56">
        <div ref={mapEl} className="absolute inset-0 w-full h-full" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-label border border-line">
          {status}
        </div>
      </div>

      <div className="p-4 flex items-center justify-between border-t border-line">
        <div>
          <div className="text-sm font-bold">{technician}</div>
          <div className="text-xs text-muted">Your technician</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold">{remaining.toFixed(1)} mi away</div>
          <div className="text-xs text-muted">ETA {eta} min</div>
        </div>
      </div>
    </div>
  )
}
