import { useEffect, useMemo, useState } from 'react'
import { services } from '../data/services.js'
import { SERVICE_BOOKING_FEES, COUPONS, OTHER_BOOKING_FEE } from '../data/pricing.js'
import LocationPicker from '../components/LocationPicker.jsx'
import { findNearestTechnician } from '../lib/dispatch.js'

const VEHICLE_TYPES = ['Sedan', 'SUV / Crossover', 'Truck', 'Van / Minivan', 'Coupe', 'Convertible', 'Motorcycle', 'Other']
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
  const [selectedIds, setSelectedIds] = useState([])
  const [otherDescription, setOtherDescription] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [vehicle, setVehicle] = useState({ type: '', year: '', make: '', model: '' })
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [location, setLocation] = useState(null)
  const [appointment, setAppointment] = useState({ date: '', time: '' })
  const [couponInput, setCouponInput] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [nearestTechnician, setNearestTechnician] = useState(null)
  const [dispatchStatus, setDispatchStatus] = useState('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const couponCode = couponInput.trim().toUpperCase()
  const couponPercent = COUPONS[couponCode]?.percentOff || 0
  const hasOther = selectedIds.includes('other')
  const selectedServices = services.filter((service) => selectedIds.includes(service.id))

  const breakdown = useMemo(() => {
    const serviceTotal = selectedServices.reduce((sum, service) => sum + Number(SERVICE_BOOKING_FEES[service.id] || 0), 0)
    const otherFee = hasOther ? OTHER_BOOKING_FEE : 0
    const preDiscount = serviceTotal + otherFee
    const discount = preDiscount * (couponPercent / 100)
    return {
      serviceTotal,
      otherFee,
      discount,
      total: Math.max(0, preDiscount - discount),
      technicianDistance: nearestTechnician?.distanceMiles ?? null,
    }
  }, [selectedServices, hasOther, couponPercent, nearestTechnician])

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const requested = query.get('service')
    if (requested && services.some((service) => service.id === requested)) setSelectedIds([requested])
    if (query.get('payment') === 'success') setStep(5)
  }, [])

  useEffect(() => {
    if (!location?.lat || !location?.lng || !selectedIds.length) return
    let cancelled = false
    setDispatchStatus('loading')
    findNearestTechnician(location, selectedIds.filter((id) => id !== 'other'))
      .then((tech) => {
        if (cancelled) return
        setNearestTechnician(tech)
        setDispatchStatus(tech ? 'ready' : 'unavailable')
      })
      .catch(() => {
        if (!cancelled) {
          setNearestTechnician(null)
          setDispatchStatus('unavailable')
        }
      })
    return () => { cancelled = true }
  }, [location, selectedIds])

  const today = new Date().toISOString().slice(0, 10)
  const update = (setter, key) => (event) => setter((value) => ({ ...value, [key]: event.target.value }))

  function toggleService(id) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    setError('')
  }

  function handlePhoneChange(event) {
    setContact((value) => ({ ...value, phone: formatUSPhone(event.target.value) }))
  }

  function next() {
    setError('')
    if (step === 1) {
      if (!selectedIds.length) return setError('Choose at least one service to continue.')
      if (hasOther && !otherDescription.trim()) return setError('Tell us what you need for the Other service option.')
      return setStep(2)
    }
    if (step === 2) {
      if (!vehicle.type || !vehicle.year || !vehicle.make || !vehicle.model) return setError('Please complete your vehicle details.')
      if (!contact.name || !contact.phone || !contact.email) return setError('Please enter your contact details.')
      if (!normalizeUSPhone(contact.phone)) return setError('Enter a valid 10-digit US phone number, for example (404) 555-0123.')
      return setStep(3)
    }
    if (step === 3) {
      if (!location?.lat || !location?.lng || !location?.address && !location?.label) return setError('Confirm your Georgia service location to continue.')
      return setStep(4)
    }
    if (step === 4 && (!appointment.date || !appointment.time)) return setError('Choose a date and time.')
    setStep((current) => Math.min(5, current + 1))
  }

  async function completePayment() {
    setError('')
    if (!consent) return setError('Please accept the booking terms before paying.')

    const url = import.meta.env.VITE_SUPABASE_URL
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !anon) return setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')

    try {
      setLoading(true)
      const payload = {
        serviceId: selectedIds[0] || '',
        serviceName: selectedServices[0]?.name || (hasOther ? 'Other / Not Listed' : ''),
        serviceIds: selectedIds.filter((id) => id !== 'other'),
        serviceNames: selectedServices.map((service) => service.name),
        services: selectedServices.map((service) => ({ id: service.id, name: service.name })),
        hasOther,
        otherDescription: hasOther ? otherDescription.trim() : '',
        additionalInfo: additionalInfo.trim(),
        vehicle,
        appointment,
        contact: { ...contact, phone: normalizeUSPhone(contact.phone) },
        location: {
          address: location.label || location.address,
          city: location.city || '',
          state: location.state || 'Georgia',
          lat: location.lat,
          lng: location.lng,
          postalCode: location.postalCode || '',
        },
        distanceMiles: nearestTechnician?.distanceMiles ?? null,
        technicianId: nearestTechnician?.id || null,
        couponCode: couponPercent ? couponCode : '',
      }

      const response = await fetch(`${url}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Unable to start secure payment.')
      if (!result.checkoutUrl) throw new Error('Stripe did not return a checkout URL.')
      window.location.assign(result.checkoutUrl)
    } catch (requestError) {
      console.error(requestError)
      setError(requestError?.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const steps = ['Services', 'Vehicle', 'Location', 'When', 'Review & Pay']

  return (
    <main className="booking-page min-h-screen bg-paper text-ink">
      <div className="booking-pattern pointer-events-none fixed inset-0 -z-0" />
      <div className="relative z-10 mx-auto max-w-[1180px] px-5 pt-28 pb-20 sm:px-7 md:pt-32 md:pb-28">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue">Viso Mobile Autocare</p>
          <h1 className="mt-3 max-w-4xl text-[clamp(2.8rem,6vw,5.5rem)] leading-[.92] tracking-[-.05em] font-display">Let’s get your car sorted.</h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg leading-8 text-muted">Tell us what your vehicle needs, where it is, and when you want us there. We’ll take care of the rest.</p>
        </header>

        <div className="mb-8 grid grid-cols-5 gap-2">
          {steps.map((label, index) => {
            const number = index + 1
            return <div key={label} className="min-w-0">
              <div className={`h-1.5 rounded-full ${step >= number ? 'bg-blue' : 'bg-line'}`} />
              <div className={`mt-2 hidden text-[10px] uppercase tracking-wider sm:block ${step === number ? 'text-blue font-semibold' : 'text-ink/35'}`}>{label}</div>
            </div>
          })}
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <section className="booking-card rounded-[2rem] border border-line bg-white p-5 shadow-[0_18px_60px_rgba(35,35,55,.06)] md:p-8">
            {step === 1 && (
              <>
                <p className="eyebrow">01 / SERVICES</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-display">What does your car need?</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Select everything you want handled in this visit. You can combine services instead of creating separate bookings.</p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {services.map((service) => {
                    const selected = selectedIds.includes(service.id)
                    return <button key={service.id} type="button" onClick={() => toggleService(service.id)} data-cursor className={`rounded-2xl border p-5 text-left transition ${selected ? 'border-blue bg-blue/[.055] shadow-[0_8px_24px_rgba(51,53,156,.08)]' : 'border-line bg-white hover:border-blue/40 hover:-translate-y-0.5'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-ink">{service.name}</div>
                          <p className="mt-1 text-xs leading-5 text-muted">{service.blurb}</p>
                        </div>
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${selected ? 'border-blue bg-blue text-white' : 'border-line text-transparent'}`}>✓</span>
                      </div>
                      <div className="mt-4 text-sm font-label text-blue">{money(SERVICE_BOOKING_FEES[service.id])}</div>
                    </button>
                  })}

                  <button type="button" onClick={() => toggleService('other')} data-cursor className={`rounded-2xl border p-5 text-left transition ${hasOther ? 'border-blue bg-blue/[.055]' : 'border-dashed border-line bg-soft hover:border-blue/40'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold">Other / Not Listed</div>
                        <p className="mt-1 text-xs leading-5 text-muted">Tell us what you need. A fixed booking amount secures the visit, then the technician confirms any additional work before starting.</p>
                      </div>
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${hasOther ? 'border-blue bg-blue text-white' : 'border-line text-transparent'}`}>✓</span>
                    </div>
                    <div className="mt-4 text-sm font-label text-blue">{money(OTHER_BOOKING_FEE)} booking amount</div>
                  </button>
                </div>

                {hasOther && <div className="mt-5 rounded-2xl border border-blue/15 bg-blue/[.035] p-5">
                  <label className="text-sm font-medium">What do you need help with? <span className="text-blue">Required</span></label>
                  <textarea value={otherDescription} onChange={(e) => setOtherDescription(e.target.value)} rows={4} className="field mt-2 resize-none" placeholder="Describe the issue, request, or service you could not find above." />
                  <p className="mt-3 text-xs leading-5 text-muted">The booking amount secures your appointment. If the requested work costs more, the technician will explain the difference and get your approval before proceeding.</p>
                </div>}

                <div className="mt-5">
                  <label className="text-sm font-medium">Anything else we should know? <span className="text-ink/35">Optional</span></label>
                  <textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} rows={3} className="field mt-2 resize-none" placeholder="Stains, warning lights, unusual noises, parking instructions, or anything else useful." />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="eyebrow">02 / VEHICLE</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-display">Tell us about the car.</h2>
                <p className="mt-3 text-sm leading-6 text-muted">A little vehicle context helps us send the right technician and equipment.</p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <select value={vehicle.type} onChange={update(setVehicle, 'type')} className="field sm:col-span-2" aria-label="Vehicle type">
                    <option value="">Select vehicle type</option>
                    {VEHICLE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <input value={vehicle.year} onChange={update(setVehicle, 'year')} placeholder="Year" inputMode="numeric" className="field" />
                  <input value={vehicle.make} onChange={update(setVehicle, 'make')} placeholder="Make" className="field" />
                  <input value={vehicle.model} onChange={update(setVehicle, 'model')} placeholder="Model" className="field sm:col-span-2" />
                </div>

                <div className="mt-8 border-t border-line pt-7">
                  <p className="text-sm font-medium">How should we reach you?</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input value={contact.name} onChange={update(setContact, 'name')} placeholder="Full name" autoComplete="name" className="field" />
                    <input value={contact.phone} onChange={handlePhoneChange} placeholder="(404) 555-0123" inputMode="tel" autoComplete="tel" type="tel" maxLength="14" className="field" />
                    <input value={contact.email} onChange={update(setContact, 'email')} placeholder="Email address" type="email" autoComplete="email" className="field sm:col-span-2" />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className="eyebrow">03 / LOCATION</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-display">Bring us to the car.</h2>
                <p className="mt-3 text-sm leading-6 text-muted">Use your phone location, enter an address, or fine-tune the meeting point on the map. We currently accept Georgia locations only.</p>
                <div className="mt-7"><LocationPicker onConfirm={setLocation} /></div>
              </>
            )}

            {step === 4 && (
              <>
                <p className="eyebrow">04 / APPOINTMENT</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-display">When should we come?</h2>
                <p className="mt-3 text-sm leading-6 text-muted">Choose a day and a convenient time. Final technician availability is confirmed by Viso.</p>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium">Date<input min={today} type="date" value={appointment.date} onChange={update(setAppointment, 'date')} className="field mt-2" /></label>
                  <label className="text-sm font-medium">Preferred time<input type="time" value={appointment.time} onChange={update(setAppointment, 'time')} className="field mt-2" /></label>
                </div>
                <div className="mt-7 rounded-2xl border border-line bg-soft p-5">
                  <p className="text-sm font-semibold">About technician matching</p>
                  <p className="mt-2 text-sm leading-6 text-muted">When live dispatch data is available, Viso matches your booking to the closest eligible technician using their latest verified location. We never ask you to type your own mileage.</p>
                  {dispatchStatus === 'ready' && nearestTechnician && <p className="mt-3 text-sm text-blue font-medium">A nearby eligible technician is currently {nearestTechnician.distanceMiles.toFixed(1)} miles from your selected location.</p>}
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <p className="eyebrow">05 / REVIEW & PAY</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-display">Everything look right?</h2>
                <p className="mt-3 text-sm leading-6 text-muted">Review the booking before secure checkout.</p>

                <div className="mt-7 space-y-4 rounded-2xl border border-line bg-soft p-5 text-sm">
                  <ReviewRow label="Services" value={selectedServices.map((service) => service.name).join(', ') || '—'} />
                  {hasOther && <ReviewRow label="Other request" value={otherDescription} />}
                  {additionalInfo && <ReviewRow label="Additional information" value={additionalInfo} />}
                  <ReviewRow label="Vehicle" value={`${vehicle.year} ${vehicle.make} ${vehicle.model} · ${vehicle.type}`} />
                  <ReviewRow label="Appointment" value={`${appointment.date} at ${appointment.time}`} />
                  <ReviewRow label="Location" value={location?.label || '—'} />
                  <ReviewRow label="Contact" value={`${contact.name} · ${contact.email}`} />
                </div>

                <div className="mt-6 flex gap-2">
                  <input value={couponInput} onChange={(e) => { setCouponInput(e.target.value); setCouponMessage('') }} placeholder="Coupon code" className="field uppercase" />
                  <button type="button" onClick={() => setCouponMessage(couponPercent ? `${couponPercent}% discount applied.` : 'That coupon code is not valid.')} className="rounded-xl border border-line bg-white px-4 text-sm font-medium hover:border-blue hover:text-blue">Apply</button>
                </div>
                {couponMessage && <p className={`mt-2 text-xs ${couponPercent ? 'text-blue' : 'text-red-500'}`}>{couponMessage}</p>}

                <div className="mt-6 rounded-2xl border border-blue/15 bg-blue/[.035] p-5">
                  <p className="font-semibold">If you selected Other</p>
                  <p className="mt-2 text-sm leading-6 text-muted">The fixed booking amount secures the visit. If the technician finds that the requested work exceeds what is covered, they will explain the additional price and get your approval before any additional work begins.</p>
                </div>

                <label className="mt-6 flex gap-3 text-sm leading-6 text-muted">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[#33359C]" />
                  <span>I confirm these booking details are correct and agree to Viso Mobile Autocare’s booking and cancellation terms.</span>
                </label>

                <button type="button" disabled={loading || !consent} onClick={completePayment} data-cursor className="mt-7 w-full rounded-2xl bg-blue px-5 py-4 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(51,53,156,.18)] transition hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-40">
                  {loading ? 'Opening secure checkout…' : 'Continue to secure payment →'}
                </button>
              </>
            )}

            <div className="mt-9 flex justify-between border-t border-line pt-6">
              <button type="button" disabled={step === 1 || loading} onClick={() => { setError(''); setStep((current) => current - 1) }} className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-blue disabled:invisible">← Back</button>
              {step < 5 && <button type="button" onClick={next} data-cursor className="rounded-xl bg-blue px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(51,53,156,.15)] transition hover:bg-blue-deep">Continue →</button>}
            </div>
          </section>

          <aside className="booking-card h-fit rounded-[2rem] border border-line bg-white p-6 shadow-[0_18px_60px_rgba(35,35,55,.06)] lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[.25em] text-blue">Your booking</p>
            <h2 className="mt-2 text-2xl font-display">{selectedIds.length ? `${selectedIds.length} service${selectedIds.length > 1 ? 's' : ''} selected` : 'Start with a service'}</h2>

            <div className="my-6 space-y-3 text-sm">
              {selectedServices.map((service) => <ReviewRow key={service.id} label={service.name} value={money(SERVICE_BOOKING_FEES[service.id])} />)}
              {hasOther && <ReviewRow label="Other booking amount" value={money(OTHER_BOOKING_FEE)} />}
              {breakdown.discount > 0 && <ReviewRow label={`Coupon (${couponPercent}%)`} value={`−${money(breakdown.discount)}`} />}
            </div>

            <div className="border-t border-line pt-5">
              <div className="flex items-end justify-between gap-4">
                <span className="text-sm text-muted">Booking total</span>
                <strong className="text-3xl tracking-tight">{money(breakdown.total)}</strong>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">Travel distance is calculated from the assigned technician’s latest verified location. The customer never enters mileage manually.</p>
            </div>

            <div className="mt-5 rounded-2xl border border-line bg-soft p-4 text-xs leading-5 text-muted">
              Secure payment is handled by Stripe. Viso Mobile Autocare does not store your card details.
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .booking-page { position: relative; overflow-x: hidden; }
        .booking-pattern { opacity: .5; background-image: radial-gradient(circle at 10% 18%, rgba(51,53,156,.06) 0 2px, transparent 3px), radial-gradient(circle at 82% 12%, rgba(51,53,156,.045) 0 3px, transparent 4px), radial-gradient(circle at 22% 78%, rgba(51,53,156,.04) 0 2px, transparent 3px); background-size: 190px 190px, 250px 250px, 220px 220px; }
        .field { width: 100%; border: 1px solid #dedee6; background: rgba(255,255,255,.98); border-radius: .9rem; padding: .82rem 1rem; font-size: .875rem; line-height: 1.5; outline: none; color: #242538; box-shadow: 0 1px 2px rgba(35,35,55,.02); transition: border-color .18s ease, box-shadow .18s ease; }
        .field::placeholder { color: #9c9eab; }
        .field:focus { border-color: rgba(51,53,156,.55); box-shadow: 0 0 0 3px rgba(51,53,156,.08); }
        select.field { appearance: none; background-image: linear-gradient(45deg, transparent 50%, #737582 50%), linear-gradient(135deg, #737582 50%, transparent 50%); background-position: calc(100% - 18px) 52%, calc(100% - 13px) 52%; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; padding-right: 2.5rem; }
        input[type=date], input[type=time] { color-scheme: light; }
      `}</style>
    </main>
  )
}

function ReviewRow({ label, value }) {
  return <div className="flex justify-between gap-4"><span className="text-muted">{label}</span><span className="max-w-[68%] text-right text-ink">{value || '—'}</span></div>
}
