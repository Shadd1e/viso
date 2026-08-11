import { useEffect, useMemo, useState } from 'react'
import { services as serviceCatalog } from '../data/services.js'
import { getClosestEligibleTechnician, getTechnicianLocations } from '../lib/dispatch.js'
import { forwardGeocode, reverseGeocode } from '../lib/geo.js'

const YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => String(new Date().getFullYear() - i))
const VEHICLES = {
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', 'Sienna'],
  Honda: ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'Ridgeline'],
  Ford: ['F-150', 'Escape', 'Explorer', 'Mustang', 'Bronco', 'Edge'],
  Chevrolet: ['Silverado', 'Equinox', 'Tahoe', 'Malibu', 'Traverse', 'Suburban'],
  Nissan: ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Frontier'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade'],
  Kia: ['Forte', 'K5', 'Sportage', 'Sorento', 'Telluride'],
  BMW: ['3 Series', '5 Series', 'X3', 'X5', '7 Series'],
  Mercedes: ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
  Lexus: ['ES', 'IS', 'RX', 'NX', 'GX'],
  Acura: ['TLX', 'MDX', 'RDX', 'Integra'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
}
const MAKES = Object.keys(VEHICLES)
const OTHER = { id: 'other', name: 'Other / Not listed', blurb: 'Tell us what your car needs and we will confirm the job with you.', fee: 49 }
const SERVICES = [...serviceCatalog.map((s) => ({ ...s, fee: ({
  'oil-change': 49, transmission: 129, 'tyre-change': 39, 'flat-fix': 35, 'brake-service': 89,
  'air-conditioning': 79, sensors: 69, programming: 99, diagnostics: 59, battery: 45,
  'wash-detail': 59, towing: 75,
}[s.id] ?? 49) })), OTHER]
const MILEAGE_RATE = 0.75
const COUPONS = { VISO10: 10, FIRSTFIX: 15 }
const money = (n) => `$${Number(n || 0).toFixed(2)}`

function normalizeUSPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  return ''
}
function formatUSPhone(value) {
  let digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('1') && digits.length > 10) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export default function Booking() {
  const [step, setStep] = useState(1)
  const [serviceIds, setServiceIds] = useState([])
  const [vehicle, setVehicle] = useState({ year: '', make: '', model: '' })
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [location, setLocation] = useState({ address: '', city: '', notes: '', lat: null, lng: null })
  const [appointment, setAppointment] = useState({ date: '', time: '' })
  const [couponInput, setCouponInput] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [error, setError] = useState('')
  const [dispatchDistance, setDispatchDistance] = useState(0)

  const selectedServices = SERVICES.filter((s) => serviceIds.includes(s.id))
  const couponCode = couponInput.trim().toUpperCase()
  const couponPercent = COUPONS[couponCode] || 0
  const subtotal = selectedServices.reduce((sum, s) => sum + s.fee, 0)
  const mileageCharge = dispatchDistance * MILEAGE_RATE
  const discount = (subtotal + mileageCharge) * (couponPercent / 100)
  const total = Math.max(0, subtotal + mileageCharge - discount)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('payment') === 'success') setStep(4)
  }, [])

  function toggleService(id) {
    setServiceIds((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }
  const update = (setter, key) => (e) => setter((v) => ({ ...v, [key]: e.target.value }))
  const today = new Date().toISOString().slice(0, 10)

  async function findLocation() {
    if (!navigator.geolocation) return setError('Your browser does not support phone location. Enter your address instead.')
    setError(''); setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lng } = coords
      // Georgia bounding box: enough to reject clearly out-of-state GPS results before reverse geocoding.
      if (lat < 30.35 || lat > 35.05 || lng < -85.65 || lng > -80.75) {
        setLocationLoading(false); return setError('Viso currently serves Georgia locations only.')
      }
      try {
        const address = await reverseGeocode({ lat, lng })
        setLocation({ address, city: '', notes: location.notes, lat, lng })
      } catch {
        setLocation((v) => ({ ...v, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng }))
      } finally { setLocationLoading(false) }
    }, () => { setLocationLoading(false); setError('Location permission was not available. You can enter the service address instead.') }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 })
  }

  async function searchAddress(value) {
    setLocation((v) => ({ ...v, address: value, lat: null, lng: null }))
    if (value.trim().length < 4) return setSuggestions([])
    try {
      const results = await forwardGeocode(`${value}, Georgia, USA`)
      setSuggestions(results.filter((r) => r.lat >= 30.35 && r.lat <= 35.05 && r.lng >= -85.65 && r.lng <= -80.75))
    } catch { setSuggestions([]) }
  }

  async function resolveDispatchDistance() {
    if (location.lat == null || location.lng == null) return
    try {
      const techs = await getTechnicianLocations()
      const tech = getClosestEligibleTechnician({ lat: location.lat, lng: location.lng }, techs, serviceIds)
      if (tech) setDispatchDistance(Number(tech.distanceMiles.toFixed(1)))
    } catch (e) { console.warn('Technician dispatch lookup unavailable:', e) }
  }

  async function next() {
    setError('')
    if (step === 1 && !serviceIds.length) return setError('Choose at least one service to continue.')
    if (step === 2) {
      if (!vehicle.year || !vehicle.make || !vehicle.model) return setError('Please select your year, make and model.')
      if (!contact.name || !contact.phone || !contact.email) return setError('Please enter your contact details.')
      if (!normalizeUSPhone(contact.phone)) return setError('Enter a valid 10-digit US phone number.')
      if (!location.address || location.lat == null || location.lng == null) return setError('Confirm a Georgia service location using your address or phone location.')
      await resolveDispatchDistance()
    }
    if (step === 3 && (!appointment.date || !appointment.time)) return setError('Choose a date and time.')
    setStep((s) => Math.min(4, s + 1))
  }

  async function completePayment() {
    setError('')
    if (!consent) return setError('Please accept the booking terms before paying.')
    const url = import.meta.env.VITE_SUPABASE_URL
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !anon) return setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
    try {
      setLoading(true)
      const response = await fetch(`${url}/functions/v1/create-checkout-session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify({
          serviceId: selectedServices[0]?.id,
          serviceName: selectedServices[0]?.name,
          services: selectedServices.map(({ id, name, fee }) => ({ id, name, fee })),
          vehicle, appointment, contact: { ...contact, phone: normalizeUSPhone(contact.phone) },
          location, distanceMiles: dispatchDistance, couponCode: couponPercent ? couponCode : '',
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to start secure payment.')
      if (!result.checkoutUrl) throw new Error('Stripe did not return a checkout URL.')
      window.location.assign(result.checkoutUrl)
    } catch (e) { setError(e?.message || 'Something went wrong. Please try again.'); setLoading(false) }
  }

  const steps = ['Services', 'Details', 'When', 'Review & Pay']
  const field = 'field'
  return (
    <main className="booking-page min-h-screen bg-white text-[#22243a] pt-20">
      <div className="booking-pattern pointer-events-none fixed inset-0 -z-0" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:px-7 md:py-12">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#3531a4]">Viso Mobile Autocare</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-[#25263a] md:text-5xl">Let’s get your car sorted.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#77798a] md:text-base">Choose what you need, tell us where the car is, and pick a time that works.</p>
        </header>
        <div className="mb-7 grid grid-cols-4 gap-2 md:mb-8">{steps.map((label, i) => <div key={label} className="flex min-w-0 items-center gap-2"><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${step >= i + 1 ? 'bg-[#3531a4] text-white' : 'border border-[#dedee7] bg-white text-[#9a9baa]'}`}>{step > i + 1 ? '✓' : i + 1}</div><span className={`hidden truncate text-xs sm:block ${step === i + 1 ? 'font-semibold text-[#3531a4]' : 'text-[#999aaa]'}`}>{label}</span></div>)}</div>
        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="booking-card rounded-[24px] border border-[#e3e3e9] bg-white p-5 shadow-[0_12px_40px_rgba(38,38,70,.06)] md:p-8">
            {step === 1 && <>
              <h2 className="text-2xl font-semibold text-[#28293c]">What does your car need?</h2>
              <p className="mt-2 text-sm text-[#858696]">Select as many services as you need. We’ll review the complete job before work begins.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">{SERVICES.map((s) => <button key={s.id} type="button" onClick={() => toggleService(s.id)} className={`rounded-2xl border p-5 text-left transition ${serviceIds.includes(s.id) ? 'border-[#3531a4] bg-[#3531a4]/[.06]' : 'border-[#e2e2e8] bg-white hover:border-[#b9b9c9]'}`}><div className="flex justify-between gap-4"><span className="font-medium text-[#303143]">{s.name}</span><span className="text-sm font-semibold text-[#3531a4]">{money(s.fee)}</span></div><p className="mt-2 text-xs leading-5 text-[#858696]">{s.blurb}</p></button>)}</div>
              <div className="mt-6 rounded-2xl bg-[#F7F7F3] p-4 text-sm text-[#666879]"><strong className="text-[#303143]">Other?</strong> Choose “Other / Not listed” for a fixed initial $49 booking. The technician will confirm the scope with you; if the job exceeds the initial scope, you’ll be told the markup and must approve it before additional work starts.</div>
            </>}

            {step === 2 && <>
              <h2 className="text-2xl font-semibold text-[#28293c]">Tell us about you and the car.</h2>
              <div className="mt-7 space-y-7">
                <div><p className="mb-3 text-sm font-medium text-[#666879]">Vehicle</p><div className="grid gap-3 sm:grid-cols-3">
                  <select value={vehicle.year} onChange={update(setVehicle, 'year')} className={field}><option value="">Year</option>{YEARS.map((y) => <option key={y}>{y}</option>)}</select>
                  <select value={vehicle.make} onChange={(e) => setVehicle((v) => ({ ...v, make: e.target.value, model: '' }))} className={field}><option value="">Make</option>{MAKES.map((m) => <option key={m}>{m}</option>)}</select>
                  <select value={vehicle.model} onChange={update(setVehicle, 'model')} disabled={!vehicle.make} className={field}><option value="">{vehicle.make ? 'Model' : 'Choose make first'}</option>{(VEHICLES[vehicle.make] || []).map((m) => <option key={m}>{m}</option>)}<option>Other / Not listed</option></select>
                </div></div>
                <div><p className="mb-3 text-sm font-medium text-[#666879]">Contact</p><div className="grid gap-3 sm:grid-cols-2"><input value={contact.name} onChange={update(setContact, 'name')} placeholder="Full name" className={field}/><input value={contact.phone} onChange={(e) => setContact((v) => ({ ...v, phone: formatUSPhone(e.target.value) }))} placeholder="(404) 555-0123" inputMode="tel" className={field}/><input value={contact.email} onChange={update(setContact, 'email')} placeholder="Email address" type="email" className={`${field} sm:col-span-2`}/></div></div>
                <div><p className="mb-3 text-sm font-medium text-[#666879]">Where should we come?</p>
                  <div className="flex gap-2"><input value={location.address} onChange={(e) => searchAddress(e.target.value)} placeholder="Start typing a Georgia address" className={`${field} flex-1`}/><button type="button" onClick={findLocation} disabled={locationLoading} className="rounded-xl border border-[#d9d9e1] px-4 text-xs font-semibold text-[#3531a4]">{locationLoading ? 'Locating…' : 'Use my location'}</button></div>
                  {suggestions.length > 0 && <div className="mt-2 overflow-hidden rounded-xl border border-[#e3e3e9] bg-white shadow-lg">{suggestions.map((s) => <button key={`${s.lat}-${s.lng}`} type="button" onClick={() => { setLocation((v) => ({ ...v, address: s.label, lat: s.lat, lng: s.lng })); setSuggestions([]) }} className="block w-full border-b border-[#eeeef2] px-4 py-3 text-left text-xs hover:bg-[#F7F7F3]">{s.label}</button>)}</div>}
                  <input value={location.city} onChange={update(setLocation, 'city')} placeholder="City / suburb (optional)" className={`${field} mt-3 w-full`}/>
                  <textarea value={location.notes} onChange={update(setLocation, 'notes')} rows="3" placeholder="Anything we should know? (optional — parking, gate code, symptoms, etc.)" className={`${field} mt-3 w-full resize-none`}/>
                </div>
              </div>
            </>}

            {step === 3 && <><h2 className="text-2xl font-semibold text-[#28293c]">When works for you?</h2><p className="mt-2 text-sm text-[#858696]">Choose a date and convenient time.</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-[#666879]">Date<input min={today} type="date" value={appointment.date} onChange={update(setAppointment, 'date')} className={`${field} mt-2 w-full`}/></label><label className="text-sm font-medium text-[#666879]">Time<input type="time" value={appointment.time} onChange={update(setAppointment, 'time')} className={`${field} mt-2 w-full`}/></label></div></>}

            {step === 4 && <><h2 className="text-2xl font-semibold text-[#28293c]">Review & Pay</h2><p className="mt-2 text-sm text-[#858696]">Check your details, then continue to secure Stripe checkout.</p><div className="mt-7 space-y-3 rounded-2xl border border-[#e3e3e9] bg-[#fafafd] p-5 text-sm"><Row label="Services" value={selectedServices.map((s) => s.name).join(', ')} /><Row label="Vehicle" value={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} /><Row label="Appointment" value={`${appointment.date} at ${appointment.time}`} /><Row label="Location" value={location.address} /><Row label="Email" value={contact.email} /></div><div className="mt-6 flex gap-2"><input value={couponInput} onChange={(e) => { setCouponInput(e.target.value); setCouponMessage('') }} placeholder="Coupon code" className={`${field} min-w-0 flex-1 uppercase`}/><button type="button" onClick={() => setCouponMessage(couponPercent ? `${couponPercent}% discount applied.` : 'That coupon code is not valid.')} className="rounded-xl border border-[#d9d9e1] bg-white px-4 text-sm font-medium">Apply</button></div>{couponMessage && <p className={`mt-2 text-xs ${couponPercent ? 'text-[#3531a4]' : 'text-red-500'}`}>{couponMessage}</p>}<label className="mt-6 flex gap-3 text-sm text-[#77798a]"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[#3531a4]"/><span>I confirm these booking details are correct and agree to Viso’s booking and cancellation terms.</span></label><button type="button" disabled={loading || !consent} onClick={completePayment} className="mt-7 w-full rounded-xl bg-[#3531a4] px-5 py-4 text-sm font-semibold text-white disabled:opacity-40">{loading ? 'Opening secure checkout…' : `Continue to secure payment · ${money(total)}`}</button></>}

            <div className="mt-9 flex justify-between border-t border-[#e8e8ed] pt-6"><button type="button" disabled={step === 1 || loading} onClick={() => { setError(''); setStep((s) => s - 1) }} className="rounded-full px-4 py-2 text-sm font-medium text-[#6d6e7d] disabled:invisible">← Back</button>{step < 4 && <button type="button" onClick={next} className="rounded-xl bg-[#3531a4] px-6 py-3 text-sm font-semibold text-white">Continue →</button>}</div>
          </section>

          <aside className="booking-card h-fit rounded-[24px] border border-[#e3e3e9] bg-white p-6 shadow-[0_12px_40px_rgba(38,38,70,.06)] lg:sticky lg:top-24"><p className="text-xs font-semibold uppercase tracking-[.25em] text-[#3531a4]">Your booking</p><h2 className="mt-2 text-xl font-semibold text-[#292a3d]">{selectedServices.length ? `${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} selected` : 'Select a service'}</h2><div className="my-6 space-y-3 text-sm">{selectedServices.map((s) => <Row key={s.id} label={s.name} value={money(s.fee)} />)}<Row label={`Travel · ${dispatchDistance.toFixed(1)} mi`} value={money(mileageCharge)} />{discount > 0 && <Row label={`Coupon (${couponPercent}%)`} value={`−${money(discount)}`} />}</div><div className="flex items-end justify-between border-t border-[#e8e8ed] pt-5"><span className="text-sm text-[#858696]">Total</span><strong className="text-3xl tracking-tight text-[#292a3d]">{money(total)}</strong></div><p className="mt-4 text-xs leading-5 text-[#9a9baa]">Travel distance is calculated from the closest eligible, recently pinged technician when dispatch data is available. Card payment is processed securely by Stripe.</p></aside>
        </div>
      </div>
    </main>
  )
}
function Row({ label, value }) { return <div className="flex items-start justify-between gap-5"><span className="text-[#858696]">{label}</span><span className="text-right font-medium text-[#303143]">{value || '—'}</span></div> }
