const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"}
function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{...corsHeaders,"Content-Type":"application/json"}})}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders}); if(req.method!=='POST')return json({error:'Method not allowed'},405)
 try{
  const token=req.headers.get('Authorization')?.replace(/^Bearer\s+/,''); if(!token)return json({error:'Authentication required'},401)
  const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('VISO_SUPABASE_SERVICE_ROLE_KEY')!
  const ur=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${token}`}}); if(!ur.ok)return json({error:'Invalid session'},401)
  const user=await ur.json(); const tr=await fetch(`${url}/rest/v1/technicians?user_id=eq.${encodeURIComponent(user.id)}&select=id,active,available_for_jobs&limit=1`,{headers:{apikey:key,Authorization:`Bearer ${key}`}}); const techs=await tr.json(); if(!techs[0])return json({error:'Technician profile not found'},403); if(!techs[0].active)return json({error:'Technician account is inactive'},403)
  const body=await req.json(); const lat=Number(body.latitude),lng=Number(body.longitude),accuracy=body.accuracyMeters==null?null:Number(body.accuracyMeters)
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<30.35||lat>35.05||lng<-85.65||lng>-80.75)return json({error:'Location is outside the supported Georgia service area'},400)
  if(accuracy!==null&&(!Number.isFinite(accuracy)||accuracy<0||accuracy>10000))return json({error:'Invalid location accuracy'},400)
  const r=await fetch(`${url}/rest/v1/technician_location_pings`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({technician_id:techs[0].id,latitude:lat,longitude:lng,accuracy_meters:accuracy,recorded_at:new Date().toISOString()})}); if(!r.ok)return json({error:'Could not save location ping'},500)
  return json({ok:true,technicianId:techs[0].id,recordedAt:new Date().toISOString()})
 }catch(e){console.error(e);return json({error:'Unexpected location error'},500)}
})
