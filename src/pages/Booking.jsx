import { useEffect, useMemo, useState } from 'react'

const SERVICES = [
  ['oil-change', 'Oil Change', 49], ['transmission', 'Transmission Service', 129],
  ['tyre-change', 'Tyre Change', 39], ['flat-fix', 'Flat Fix', 35],
  ['brake-service', 'Brake Service', 89], ['air-conditioning', 'Air Conditioning', 79],
  ['sensors', 'Sensors', 69], ['programming', 'Programming', 99],
  ['diagnostics', 'Diagnostics', 59], ['battery', 'Battery', 45],
  ['wash-detail', 'Wash & Detail', 59], ['towing', 'Towing', 75],
].map(([id, name, fee]) => ({ id, name, fee }))

const MILEAGE_RATE = 0.75
const COUPONS = { VISO10: 10, FIRSTFIX: 15 }
const money = (n) => `$${Number(n || 0).toFixed(2)}`

// Viso serves Georgia, USA. Keep the customer-facing phone field in US format
// while sending a normalized +1 E.164 number to Supabase/Stripe.
function normalizeUSPhone(value) {
  const digits = String(value || '').replace(/\\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  return ''
}

function formatUSPhone(value) {
  let digits = String(value || '').replace(/\\D/g, '')
  if (digits.startsWith('1') && digits.length > 10) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export default function Booking() {
  const [step, setStep] = useState(1)
  const [serviceId, setServiceId] = useState('')
  const [vehicle, setVehicle] = useState({ year: '', make: '', model: '' })
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [location, setLocation] = useState({ address: '', city: '', notes: '' })
  const [appointment, setAppointment] = useState({ date: '', time: '' })
  const [distanceMiles, setDistanceMiles] = useState(0)
  const [couponInput, setCouponInput] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const service = SERVICES.find((s) => s.id === serviceId)
  const couponCode = couponInput.trim().toUpperCase()
  const couponPercent = COUPONS[couponCode] || 0
  const breakdown = useMemo(() => {
    const distance = Math.max(0, Number(distanceMiles) || 0)
    const bookingFee = service?.fee || 0
    const mileageCharge = distance * MILEAGE_RATE
    const subtotal = bookingFee + mileageCharge
    const discount = subtotal * (couponPercent / 100)
    return { bookingFee, mileageCharge, subtotal, discount, total: Math.max(0, subtotal - discount), distance }
  }, [service, distanceMiles, couponPercent])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('payment') === 'success') setStep(4)
  }, [])

  const update = (setter, key) => (e) => setter((v) => ({ ...v, [key]: e.target.value }))
  const today = new Date().toISOString().slice(0, 10)

  function handlePhoneChange(e) {
    setContact((v) => ({ ...v, phone: formatUSPhone(e.target.value) }))
  }

  function next() {
    setError('')
    if (step === 1 && !service) return setError('Choose a service to continue.')
    if (step === 2) {
      if (!vehicle.year || !vehicle.make || !vehicle.model) return setError('Please enter your vehicle details.')
      if (!contact.name || !contact.phone || !contact.email) return setError('Please enter your contact details.')
      if (!normalizeUSPhone(contact.phone)) return setError('Enter a valid 10-digit US phone number, for example (404) 555-0123.')
      if (!location.address) return setError('Please enter the service address.')
    }
    if (step === 3 && (!appointment.date || !appointment.time)) return setError('Choose a date and time.')
    setStep((s) => Math.min(4, s + 1))
  }

  async function completePayment() {
    setError('')
    if (!consent) return setError('Please accept the booking terms before paying.')
    if (!service) return setError('Please select a service.')
    const url = import.meta.env.VITE_SUPABASE_URL
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !anon) return setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.')

    try {
      setLoading(true)
      const response = await fetch(`${url}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          vehicle,
          appointment,
          contact: { ...contact, phone: normalizeUSPhone(contact.phone) },
          location,
          distanceMiles: breakdown.distance,
          couponCode: couponPercent ? couponCode : ''
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to start secure payment.')
      if (!result.checkoutUrl) throw new Error('Stripe did not return a checkout URL.')
      window.location.assign(result.checkoutUrl)
    } catch (e) {
      console.error(e)
      setError(e?.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const steps = ['Service', 'Details', 'When', 'Review & Pay']

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-16">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Book Viso</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Let’s get your car sorted.</h1>
          <p className="mt-3 max-w-2xl text-white/60">Pick a service, tell us where and when, then pay securely through Stripe.</p>
        </header>

        <div className="mb-8 grid grid-cols-4 gap-2">
          {steps.map((label, i) => <div key={label} className="flex items-center gap-2"><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${step >= i + 1 ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-white/40'}`}>{step > i + 1 ? '✓' : i + 1}</div><span className={`hidden truncate text-xs sm:block ${step === i + 1 ? 'text-white' : 'text-white/40'}`}>{label}</span></div>)}
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl border border-white/10 bg-white/[.045] p-5 md:p-8">
            {step === 1 && <><h2 className="text-2xl font-semibold">What do you need?</h2><p className="mt-2 text-sm text-white/50">Choose the service that best matches the job.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{SERVICES.map((s) => <button key={s.id} type="button" onClick={() => setServiceId(s.id)} className={`rounded-2xl border p-5 text-left transition ${serviceId === s.id ? 'border-amber-300 bg-amber-300/10' : 'border-white/10 bg-white/[.03] hover:border-white/25'}`}><div className="flex justify-between gap-4"><span className="font-medium">{s.name}</span><span className="text-sm text-amber-300">{money(s.fee)}</span></div></button>)}</div></>}

            {step === 2 && <><h2 className="text-2xl font-semibold">Tell us about you and the car.</h2><div className="mt-7 space-y-7"><div><p className="mb-3 text-sm text-white/70">Vehicle</p><div className="grid gap-3 sm:grid-cols-3"><input value={vehicle.year} onChange={update(setVehicle, 'year')} placeholder="Year" className="field"/><input value={vehicle.make} onChange={update(setVehicle, 'make')} placeholder="Make" className="field"/><input value={vehicle.model} onChange={update(setVehicle, 'model')} placeholder="Model" className="field"/></div></div><div><p className="mb-3 text-sm text-white/70">Contact</p><div className="grid gap-3 sm:grid-cols-2"><input value={contact.name} onChange={update(setContact, 'name')} placeholder="Full name" className="field"/><input value={contact.phone} onChange={handlePhoneChange} placeholder="(404) 555-0123" inputMode="tel" autoComplete="tel" type="tel" maxLength="14" className="field"/><input value={contact.email} onChange={update(setContact, 'email')} placeholder="Email address" type="email" className="field sm:col-span-2"/></div></div><div><p className="mb-3 text-sm text-white/70">Service location</p><input value={location.address} onChange={update(setLocation, 'address')} placeholder="Street address" className="field w-full"/><div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={location.city} onChange={update(setLocation, 'city')} placeholder="City / suburb" className="field"/><input value={distanceMiles} onChange={(e) => setDistanceMiles(e.target.value)} type="number" min="0" step=".1" placeholder="Distance in miles" className="field"/></div><textarea value={location.notes} onChange={update(setLocation, 'notes')} rows="3" placeholder="Anything we should know? (optional)" className="field mt-3 w-full resize-none"/></div></div></>}

            {step === 3 && <><h2 className="text-2xl font-semibold">When works for you?</h2><p className="mt-2 text-sm text-white/50">Choose a date and convenient time.</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><label className="text-sm text-white/60">Date<input min={today} type="date" value={appointment.date} onChange={update(setAppointment, 'date')} className="field mt-2 w-full"/></label><label className="text-sm text-white/60">Time<input type="time" value={appointment.time} onChange={update(setAppointment, 'time')} className="field mt-2 w-full"/></label></div></>}

            {step === 4 && <><h2 className="text-2xl font-semibold">Review & Pay</h2><p className="mt-2 text-sm text-white/50">Check your details, then continue to Stripe.</p><div className="mt-7 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm"><Row label="Service" value={service?.name}/><Row label="Vehicle" value={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}/><Row label="Appointment" value={`${appointment.date} at ${appointment.time}`}/><Row label="Location" value={location.address}/><Row label="Email" value={contact.email}/></div><div className="mt-6 flex gap-2"><input value={couponInput} onChange={(e) => { setCouponInput(e.target.value); setCouponMessage('') }} placeholder="Coupon code" className="field min-w-0 flex-1 uppercase"/><button type="button" onClick={() => setCouponMessage(couponPercent ? `${couponPercent}% discount applied.` : 'That coupon code is not valid.')} className="rounded-xl border border-white/15 px-4 text-sm">Apply</button></div>{couponMessage && <p className={`mt-2 text-xs ${couponPercent ? 'text-amber-300' : 'text-red-300'}`}>{couponMessage}</p>}<label className="mt-6 flex gap-3 text-sm text-white/60"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-amber-300"/><span>I confirm these booking details are correct and agree to Viso’s booking and cancellation terms.</span></label><button type="button" disabled={loading || !consent} onClick={completePayment} className="mt-7 w-full rounded-2xl bg-amber-300 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40">{loading ? 'Opening secure checkout…' : `Continue to secure payment · ${money(breakdown.total)}`}</button></>}

            <div className="mt-9 flex justify-between border-t border-white/10 pt-6"><button type="button" disabled={step === 1 || loading} onClick={() => { setError(''); setStep((s) => s - 1) }} className="rounded-full px-4 py-2 text-sm text-white/55 disabled:invisible">Back</button>{step < 4 && <button type="button" onClick={next} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950">Continue</button>}</div>
          </section>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[.045] p-6 lg:sticky lg:top-6"><p className="text-xs uppercase tracking-[.25em] text-amber-300">Your booking</p><h2 className="mt-2 text-xl font-semibold">{service?.name || 'Select a service'}</h2><div className="my-6 space-y-3 text-sm"><Row label="Service fee" value={money(breakdown.bookingFee)}/><Row label={`${breakdown.distance.toFixed(1)} mi × $0.75`} value={money(breakdown.mileageCharge)}/>{breakdown.discount > 0 && <Row label={`Coupon (${couponPercent}%)`} value={`−${money(breakdown.discount)}`}/>}</div><div className="flex items-end justify-between border-t border-white/10 pt-5"><span className="text-sm text-white/50">Total</span><strong className="text-3xl">{money(breakdown.total)}</strong></div><p className="mt-4 text-xs leading-5 text-white/35">Payment is processed securely by Stripe. Viso does not store your card details.</p></aside>
        </div>
      </div>
      <style>{`.field{border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.2);border-radius:.75rem;padding:.75rem 1rem;font-size:.875rem;outline:none;color:white}.field::placeholder{color:rgba(255,255,255,.35)}.field:focus{border-color:rgba(252,211,77,.7)}`}</style>
    </main>
  )
}

function Row({ label, value }) { return <div className="flex justify-between gap-4"><span className="text-white/45">{label}</span><span className="max-w-[65%] text-right text-white/80">{value || '—'}</span></div> }
