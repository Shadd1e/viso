const corsHeaders={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'GET, OPTIONS'}
function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{...corsHeaders,'Content-Type':'application/json'}})}
async function sb(path:string){const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('VISO_SUPABASE_SERVICE_ROLE_KEY')!;const r=await fetch(`${url}/rest/v1/${path}`,{headers:{apikey:key,Authorization:`Bearer ${key}`}});if(!r.ok)throw new Error(await r.text());return r.json()}
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});if(req.method!=='GET')return json({error:'Method not allowed'},405)
  try{
    const u=new URL(req.url),bookingId=u.searchParams.get('bookingId'),email=u.searchParams.get('email')?.trim().toLowerCase()
    if(!bookingId||!email)return json({error:'Booking and email are required'},400)
    const rows=await sb(`bookings?id=eq.${encodeURIComponent(bookingId)}&customer_email=eq.${encodeURIComponent(email)}&select=id,assigned_technician_id,customer_email,payment_status,status&limit=1`)
    const booking=rows[0];if(!booking)return json({error:'Booking not found'},404)
    if(!['paid','succeeded','completed'].includes(String(booking.payment_status||'').toLowerCase()))return json({error:'Tracking becomes available after payment is confirmed'},403)
    if(['cancelled'].includes(String(booking.status||'').toLowerCase()))return json({error:'This booking is cancelled'},409)
    if(!booking.assigned_technician_id)return json({location:null})
    const pings=await sb(`technician_location_pings?technician_id=eq.${encodeURIComponent(booking.assigned_technician_id)}&select=latitude,longitude,accuracy_meters,recorded_at&order=recorded_at.desc&limit=1`)
    if(!pings[0])return json({location:null})
    const ping=pings[0],age=Date.now()-new Date(ping.recorded_at).getTime()
    return json({location:{lat:Number(ping.latitude),lng:Number(ping.longitude),accuracyMeters:ping.accuracy_meters==null?null:Number(ping.accuracy_meters),recordedAt:ping.recorded_at,stale:age>120000}})
  }catch(e){console.error(e);return json({error:'Could not load technician location'},500)}
})
