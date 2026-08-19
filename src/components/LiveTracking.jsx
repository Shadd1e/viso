import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { etaMinutes } from '../lib/geo.js'

const MAP_STYLE='https://demotiles.maplibre.org/style.json'
const DEFAULT={lat:33.749,lng:-84.388,label:'Your location'}

export default function LiveTracking({bookingId,customerEmail,destination,technician='Your Viso technician'}){
  const mapEl=useRef(null),mapRef=useRef(null),markerRef=useRef(null)
  const [position,setPosition]=useState(null),[status,setStatus]=useState('Waiting for technician location'),[error,setError]=useState('')
  const dest=destination||DEFAULT
  useEffect(()=>{
    if(!mapEl.current||mapRef.current)return
    const map=new maplibregl.Map({container:mapEl.current,style:MAP_STYLE,center:[dest.lng,dest.lat],zoom:11})
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right')
    map.on('load',()=>{new maplibregl.Marker({color:'#0B0B14'}).setLngLat([dest.lng,dest.lat]).addTo(map);mapRef.current=map})
    mapRef.current=map
    return()=>{map.remove();mapRef.current=null}
  },[dest.lat,dest.lng])
  useEffect(()=>{
    if(!bookingId||!customerEmail)return
    let cancelled=false
    const poll=async()=>{
      try{
        const url=import.meta.env.VITE_SUPABASE_URL,anon=import.meta.env.VITE_SUPABASE_ANON_KEY
        const r=await fetch(`${url}/functions/v1/get-technician-location?bookingId=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(customerEmail)}`,{headers:{apikey:anon}})
        const data=await r.json().catch(()=>({}))
        if(!r.ok)throw new Error(data.error||'Unable to load technician location.')
        if(cancelled)return
        if(data.location){setPosition(data.location);setStatus(data.location.stale?'Location updating…':'En route')}
        else setStatus('Waiting for technician location')
      }catch(e){if(!cancelled)setError(e.message)}
    }
    poll();const id=setInterval(poll,10000);return()=>{cancelled=true;clearInterval(id)}
  },[bookingId,customerEmail])
  useEffect(()=>{
    if(!position||!mapRef.current)return
    if(!markerRef.current)markerRef.current=new maplibregl.Marker({color:'#33359C'}).setLngLat([position.lng,position.lat]).addTo(mapRef.current)
    else markerRef.current.setLngLat([position.lng,position.lat])
    const bounds=new maplibregl.LngLatBounds([position.lng,position.lat],[position.lng,position.lat]);bounds.extend([dest.lng,dest.lat]);mapRef.current.fitBounds(bounds,{padding:60,maxZoom:13})
  },[position,dest.lat,dest.lng])
  const distance=position?Math.max(Math.hypot(dest.lat-position.lat,dest.lng-position.lng)*69,0):null
  return <div className="rounded-xl border border-line overflow-hidden"><div className="relative h-56"><div ref={mapEl} className="absolute inset-0 w-full h-full"/><div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-xs font-label border border-line">{status}</div></div><div className="p-4 flex items-center justify-between border-t border-line"><div><div className="text-sm font-bold">{technician}</div><div className="text-xs text-muted">Your technician</div></div><div className="text-right"><div className="text-sm font-bold">{distance==null?'—':`${distance.toFixed(1)} mi away`}</div><div className="text-xs text-muted">{distance==null?'Location pending':`ETA ${etaMinutes(distance)} min`}</div></div></div>{error&&<div className="px-4 pb-4 text-xs text-red-500">{error}</div>}</div>
}
