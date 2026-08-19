import { corsHeaders, json, sb } from '../_shared/supabase.ts';
import { isGeorgia } from '../_shared/geo.ts';
import { durationFor, SERVICE_BOOKING_FEES, priceFor } from '../_shared/pricing.ts';
import { eligibleTechnicians, fromMinutes, toMinutes } from '../_shared/scheduling.ts';

Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:corsHeaders});
  if(req.method!=='POST') return json({error:'Method not allowed'},405);
  try {
    const body=await req.json();
    const { services, serviceId, serviceName, vehicle, appointment, contact, location, couponCode='', extraInformation='', dispatchMode='scheduled' }=body;
    let customerId:any=null;
    const authHeader=req.headers.get('Authorization');
    const supabaseUrl=Deno.env.get('SUPABASE_URL');
    const serviceRoleKey=Deno.env.get('VISO_SUPABASE_SERVICE_ROLE_KEY');
    if(authHeader?.startsWith('Bearer ') && supabaseUrl && serviceRoleKey){const ur=await fetch(`${supabaseUrl}/auth/v1/user`,{headers:{apikey:serviceRoleKey,Authorization:authHeader}});if(ur.ok){const u=await ur.json();customerId=u?.id||null;}}
    const requestedIds = Array.isArray(body.serviceIds) ? body.serviceIds.map((id:any)=>String(id)) : [];
    const serviceIds=Array.isArray(services)&&services.length ? services.map((s:any)=>String(s.id)) : (requestedIds.length ? requestedIds : (serviceId?[String(serviceId)]:[]));
    if (body.hasOther && !serviceIds.includes('other')) serviceIds.push('other');
    if(!serviceIds.length || !appointment?.date || !appointment?.time || !contact?.name || !contact?.phone || !contact?.email || location?.lat==null || location?.lng==null) return json({error:'Missing required booking information'},400);
    if(!isGeorgia(Number(location.lat),Number(location.lng))) return json({error:'Viso currently serves Georgia locations only.'},400);
    if(serviceIds.some(id=>SERVICE_BOOKING_FEES[id]===undefined)) return json({error:'Invalid service selection'},400);
    const date=String(appointment.date), time=String(appointment.time).slice(0,5);
    const [technicians, availability, timeOff, bookings] = await Promise.all([
      sb('technicians?active=eq.true&available_for_jobs=eq.true&select=*'),
      sb(`technician_availability?active=eq.true&select=*`),
      sb(`technician_time_off?date=eq.${encodeURIComponent(date)}&select=*`),
      sb(`bookings?appointment_date=eq.${encodeURIComponent(date)}&status=not.in.(cancelled,completed)&select=assigned_technician_id,appointment_time,scheduled_end`)
    ]);
    const ids=technicians.map((t:any)=>t.id);
    let pings:any[]=[];
    if(ids.length) pings=await sb(`technician_location_pings?technician_id=in.(${ids.join(',')})&select=technician_id,latitude,longitude,recorded_at&order=recorded_at.desc`);
    const enriched=technicians.map((t:any)=>({...t,location_pings:pings.filter((p:any)=>p.technician_id===t.id)}));
    const candidates=eligibleTechnicians({technicians:enriched,availability,timeOff,bookings,date,serviceIds,time,customer:{lat:Number(location.lat),lng:Number(location.lng)},requireLive:dispatchMode==='immediate'});
    const tech=candidates[0];
    if(!tech) return json({error:dispatchMode==='immediate'?'No technician is currently available nearby. Please choose a later time.':'No technician is available for that time. Please choose another time.'},409);
    const distance=Number(tech.distanceMiles.toFixed(2));
    const pricing=priceFor(serviceIds,distance,couponCode||'');
    if(pricing.total<=0) return json({error:'Invalid booking total'},400);
    const duration=durationFor(serviceIds); const start=toMinutes(time); const end=fromMinutes(start+duration);
    const bookingPayload={customer_id:customerId,status:'pending',payment_status:'pending',service_id:serviceIds[0],service_name:services?.map((s:any)=>s.name).join(', ')||serviceName||'Other / Not Listed',service_ids:serviceIds,extra_information:String(extraInformation||body.additionalInfo||body.otherDescription||'').trim()||null,vehicle_year:vehicle?.year||null,vehicle_make:vehicle?.make||null,vehicle_model:vehicle?.model||null,appointment_date:date,appointment_time:time,scheduled_start:`${date} ${time}`,scheduled_end:`${date} ${end}`,customer_name:contact.name.trim(),customer_phone:contact.phone.trim(),customer_email:contact.email.trim(),location,distance_miles:distance,booking_fee:serviceIds.reduce((s,id)=>s+SERVICE_BOOKING_FEES[id],0),mileage_rate:0.75,mileage_charge:pricing.mileageCharge,subtotal:pricing.subtotal,discount:pricing.discount,total:pricing.total,coupon_code:pricing.discountPercent?String(couponCode).trim().toUpperCase():null,assigned_technician_id:tech.id,dispatch_mode:dispatchMode};
    const [booking]=await sb('bookings',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(bookingPayload)});
    const origin=req.headers.get('origin')||'http://localhost:5173';
    const techRow=await sb(`technicians?id=eq.${encodeURIComponent(tech.id)}&select=stripe_connect_account_id&limit=1`);
    const connectedAccount=techRow[0]?.stripe_connect_account_id||null;
    const params=new URLSearchParams();
    params.set('line_items[0][price_data][currency]','usd'); params.set('line_items[0][price_data][product_data][name]',bookingPayload.service_name); params.set('line_items[0][price_data][product_data][description]',`${date} at ${time} · Mobile service`); params.set('line_items[0][price_data][unit_amount]',String(Math.round(pricing.total*100))); params.set('line_items[0][quantity]','1'); params.set('customer_email',contact.email.trim()); params.set('mode','payment');
    if(connectedAccount){ params.set('payment_intent_data[transfer_data][destination][account]',connectedAccount); }
    params.set('payment_intent_data[metadata][booking_id]',booking.id); params.set('payment_intent_data[metadata][technician_id]',tech.id);
    params.set('success_url',`${origin}/booking?payment=success&session_id={CHECKOUT_SESSION_ID}`); params.set('cancel_url',`${origin}/booking?payment=cancelled`); params.set('metadata[booking_id]',booking.id); params.set('metadata[service_ids]',serviceIds.join(',')); params.set('metadata[technician_id]',tech.id); params.set('metadata[dispatch_mode]',dispatchMode);
    const stripeKey=Deno.env.get('STRIPE_SECRET_KEY'); if(!stripeKey) return json({error:'Stripe is not configured yet.'},500);
    const sr=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${stripeKey}`,'Content-Type':'application/x-www-form-urlencoded'},body:params.toString()});
    const session=await sr.json(); if(!sr.ok){console.error('Stripe error',session);return json({error:'Could not create Stripe checkout session'},500)}
    await sb(`bookings?id=eq.${booking.id}`,{method:'PATCH',body:JSON.stringify({stripe_checkout_session_id:session.id,updated_at:new Date().toISOString()})});
    return json({checkoutUrl:session.url,bookingId:booking.id,technicianId:tech.id,distanceMiles:distance,total:pricing.total});
  } catch(e){console.error(e);return json({error:'Unexpected checkout error'},500)}
});
