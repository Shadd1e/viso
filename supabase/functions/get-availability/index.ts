import { corsHeaders, json, sb } from '../_shared/supabase.ts';
import { durationFor } from '../_shared/pricing.ts';
import { fromMinutes, toMinutes, weekday } from '../_shared/scheduling.ts';

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok',{headers:corsHeaders});
  if (req.method !== 'POST') return json({error:'Method not allowed'},405);
  try {
    const body = await req.json(); const { date, serviceIds=[] } = body;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(serviceIds) || !serviceIds.length) return json({error:'Date and services are required'},400);
    const day = weekday(date), duration = durationFor(serviceIds);
    const [t,a,off,b] = await Promise.all([
      sb('technicians?active=eq.true&available_for_jobs=eq.true&select=*'),
      sb(`technician_availability?weekday=eq.${day}&active=eq.true&select=*`),
      sb(`technician_time_off?date=eq.${date}&select=*`),
      sb(`bookings?appointment_date=eq.${date}&status=not.in.(cancelled,completed)&select=assigned_technician_id,appointment_time,scheduled_end`)
    ]);
    const blocked = new Set(off.map((x:any)=>x.technician_id));
    const slots = new Map<string,number>();
    for (const tech of t) {
      if (blocked.has(tech.id)) continue;
      const av = a.find((x:any)=>x.technician_id===tech.id); if (!av) continue;
      const start=toMinutes(av.start_time), end=toMinutes(av.end_time);
      for(let m=Math.ceil(start/30)*30;m+duration<=end;m+=30){
        const busy=b.filter((x:any)=>x.assigned_technician_id===tech.id).some((x:any)=>{const s=toMinutes(String(x.appointment_time).slice(0,5));const e=x.scheduled_end?toMinutes(String(x.scheduled_end).slice(11,16)):s+60;return m<e&&m+duration>s});
        if(!busy) slots.set(fromMinutes(m),(slots.get(fromMinutes(m))||0)+1);
      }
    }
    // For today, don't offer times that have already passed in Atlanta/Eastern time.
    if (date === new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())) {
      const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
      const now=Number(parts.find(x=>x.type==='hour')?.value||0)*60+Number(parts.find(x=>x.type==='minute')?.value||0);
      for (const key of [...slots.keys()]) if (toMinutes(key)<now+30) slots.delete(key);
    }
    return json({date, durationMinutes:duration, slots:[...slots.entries()].map(([time,technicianCount])=>({time,technicianCount}))});
  } catch(e){ console.error(e); return json({error:'Could not load availability'},500); }
});
