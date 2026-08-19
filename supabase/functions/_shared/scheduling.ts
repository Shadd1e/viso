import { MAX_LIVE_LOCATION_AGE_MS, milesBetween } from './geo.ts';
import { durationFor } from './pricing.ts';

export function toMinutes(v:string) { const [h,m] = v.split(':').map(Number); return h*60+m; }
export function pad(n:number) { return String(n).padStart(2,'0'); }
export function fromMinutes(m:number) { return `${pad(Math.floor(m/60))}:${pad(m%60)}`; }
export function weekday(date:string) { return new Date(`${date}T12:00:00Z`).getUTCDay(); }

export function slotFits(start:number, duration:number, workStart:number, workEnd:number, bookings:any[]) {
  if (start < workStart || start + duration > workEnd) return false;
  return !bookings.some((b:any) => {
    const bs = toMinutes(String(b.appointment_time || '00:00').slice(0,5));
    const be = b.scheduled_end ? toMinutes(String(b.scheduled_end).slice(11,16)) : bs + 60;
    return start < be && start + duration > bs;
  });
}

export function eligibleTechnicians({technicians, availability, timeOff, bookings, date, serviceIds, time, customer, requireLive=false}:{technicians:any[];availability:any[];timeOff:any[];bookings:any[];date:string;serviceIds:string[];time:string;customer:{lat:number;lng:number};requireLive?:boolean}) {
  const wd = weekday(date), requested = toMinutes(time), duration = durationFor(serviceIds);
  return technicians.filter(t => t.active && t.available_for_jobs)
    .filter(t => !timeOff.some(x=>x.technician_id===t.id && x.date===date))
    .filter(t => !serviceIds.length || !Array.isArray(t.services) || serviceIds.every(id=>t.services.includes(id)))
    .map(t => {
      const a = availability.find(x=>x.technician_id===t.id && x.weekday===wd && x.active);
      if (!a || !slotFits(requested,duration,toMinutes(a.start_time),toMinutes(a.end_time),bookings.filter(b=>b.assigned_technician_id===t.id))) return null;
      const pings = (t.location_pings||[]).sort((a:any,b:any)=>new Date(b.recorded_at).getTime()-new Date(a.recorded_at).getTime());
      const ping = pings[0];
      const live = ping && Date.now()-new Date(ping.recorded_at).getTime() <= MAX_LIVE_LOCATION_AGE_MS;
      if (requireLive && !live) return null;
      const point = live ? {lat:Number(ping.latitude),lng:Number(ping.longitude)} : {lat:Number(t.base_lat),lng:Number(t.base_lng)};
      if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null;
      return {...t, live, distanceMiles:milesBetween(customer,point), locationSource:live?'live':'base'};
    }).filter(Boolean).sort((a:any,b:any)=>a.distanceMiles-b.distanceMiles);
}
