import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { services, getServiceById } from '../data/services.js'
import { getPricing, validateCoupon } from '../data/pricing.js'
import { DEPOT, milesBetween } from '../lib/geo.js'
import LocationPicker from '../components/LocationPicker.jsx'
import EtaPreview from '../components/EtaPreview.jsx'
import LiveTracking from '../components/LiveTracking.jsx'
import TechnicianChat from '../components/TechnicianChat.jsx'
import PaymentMethod from '../components/PaymentMethod.jsx'

const DEFAULT_DISTANCE = 8.4
const SERVICE_STATE = (import.meta.env.VITE_SERVICE_STATE || '').trim()

const VEHICLE_YEARS = [
  '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016',
  '2015', '2014', '2013', '2012', '2011', '2010',
]

const VEHICLE_MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
  'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus',
  'Lincoln', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Ram', 'Subaru', 'Tesla',
  'Toyota', 'Volkswagen', 'Volvo', 'Other',
]

const STEPS = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'When' },
  { id: 4, label: 'Review & pay' },
]

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
]

export default function Booking() {
  const [searchParams, setSearchParams] = useSearchParams()
  const preselected = searchParams.get('service')

  const [step, setStep] = useState(1)
  const [pricing, setPricing] = useState(null)
  const [vehicle, setVehicle] = useState({ year: '', make: '', model: '' })
  const [serviceId, setServiceId] = useState(preselected || services[0].id)
  const [location, setLocation] = useState(null)
  const [appointment, setAppointment] = useState({ mode: 'asap', date: new Date().toISOString().slice(0, 10), time: 'ASAP' })
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [consent, setConsent] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    getPricing().then(setPricing)
  }, [])

  useEffect(() => {
    if (preselected && preselected !== serviceId) setServiceId(preselected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselected])

  const service = getServiceById(serviceId)
  const activeBonus = pricing?.bonuses.find((b) => b.id === pricing.activeBonusId)
  const distance = location ? milesBetween(DEPOT, location) : DEFAULT_DISTANCE

  const breakdown = useMemo(() => {
    if (!pricing) return null
    const bookingFee = pricing.bookingFees[serviceId] ?? 0
    const rate = pricing.mileageRate * (activeBonus?.multiplier ?? 1)
    const mileageCharge = distance * rate
    const subtotal = bookingFee + mileageCharge
    const discount = coupon?.valid ? subtotal * (coupon.percentOff / 100) : 0
    const total = Math.max(subtotal - discount, 0)
    return { bookingFee, rate, mileageCharge, subtotal, discount, total }
  }, [pricing, serviceId, distance, activeBonus, coupon])

  function pickService(id) {
    setServiceId(id)
    setSearchParams({ service: id })
    setPaymentError('')
  }

  function handleLocationConfirm(nextLocation) {
    setLocationError('')

    if (!nextLocation) {
      setLocation(null)
      return
    }

    const state = String(
      nextLocation.state || nextLocation.region || nextLocation.addressState || ''
    ).trim()

    if (!SERVICE_STATE) {
      setLocationError('Viso service area is not configured yet. Add VITE_SERVICE_STATE to your environment variables before accepting bookings.')
      setLocation(null)
      return
    }

    if (state && state.toLowerCase() !== SERVICE_STATE.toLowerCase()) {
      setLocation(null)
      setLocationError(
        `We currently only serve customers in and around ${SERVICE_STATE}. We’re working on expanding to more areas.`
      )
      return
    }

    setLocation(nextLocation)
  }

  function validateStep(currentStep) {
    if (currentStep === 1) return Boolean(serviceId)
    if (currentStep === 2) {
      return Boolean(vehicle.year && vehicle.make && vehicle.model.trim() && location && !locationError)
    }
    if (currentStep === 3) {
      const visitValid = appointment.mode === 'asap'
        ? Boolean(appointment.date && appointment.time === 'ASAP')
        : Boolean(appointment.date && appointment.time)
      return Boolean(
        visitValid &&
          contact.name.trim().length > 1 &&
          contact.phone.replace(/\D/g, '').length >= 10 &&
          /\S+@\S+\.\S+/.test(contact.email)
      )
    }
    return true
  }

  function nextStep() {
    setPaymentError('')
    if (validateStep(step)) setStep((current) => Math.min(current + 1, 4))
  }

  function previousStep() {
    setPaymentError('')
    setStep((current) => Math.max(current - 1, 1))
  }

  async function applyCoupon() {
    setCouponError('')
    if (!couponInput.trim()) return
    const result = await validateCoupon(couponInput)
    if (result.valid) {
      setCoupon(result)
    } else {
      setCoupon(null)
      setCouponError('That code doesn’t look right — check it and try again.')
    }
  }

  async function completePayment() {
    setPaymentError('')

    if (!consent) {
      setPaymentError('Please check the box above before continuing to payment.')
      return
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setPaymentError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.')
      return
    }

    try {
      setPaymentLoading(true)

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            serviceId: service.id,
            serviceName: service.name,
            vehicle,
            appointment,
            contact,
            location,
            distanceMiles: Number(distance.toFixed(2)),
            couponCode: coupon?.valid ? couponInput.trim().toUpperCase() : '',
          }),
        }
      )

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.error || 'Unable to start secure payment.')
      }

      if (!result.checkoutUrl) {
        throw new Error('Stripe did not return a checkout URL.')
      }

      window.location.assign(result.checkoutUrl)
    } catch (error) {
      console.error('Stripe checkout error:', error)
      setPaymentError(
        error instanceof Error
          ? error.message
          : 'Something went wrong starting payment. Please try again.'
      )
      setPaymentLoading(false)
    }
  }

  if (!pricing || !breakdown) {
    return (
      <div className="pt-32 pb-24 max-w-[720px] mx-auto px-6 text-center text-muted">
        Loading pricing…
      </div>
    )
  }

  return (
    <div className="pt-28 pb-28 max-w-[840px] mx-auto px-6 md:px-11">
      <div className="mb-8">
        <span className="text-blue text-xs font-label uppercase tracking-widest">Book a service</span>
        <h1 className="text-3xl md:text-5xl font-display font-normal tracking-tight mt-2">
          Let’s get your car <span className="text-blue">sorted</span>.
        </h1>
        <p className="text-muted text-[15px] mt-3 max-w-md">
          Four quick steps. No fuss. You’ll see the estimate before you pay.
        </p>
      </div>

      <div className="mb-10" aria-label="Booking progress">
        <div className="flex items-center gap-2 md:gap-3">
          {STEPS.map((item, index) => {
            const active = item.id === step
            const complete = item.id < step
            return (
              <div key={item.id} className="flex items-center gap-2 md:gap-3 flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => item.id < step && setStep(item.id)}
                  className="flex items-center gap-2 text-left min-w-0"
                  aria-current={active ? 'step' : undefined}
                >
                  <span
                    className={
                      'w-7 h-7 rounded-full border flex items-center justify-center text-xs shrink-0 transition-colors ' +
                      (active || complete ? 'border-blue bg-blue text-white' : 'border-line text-muted')
                    }
                  >
                    {complete ? '✓' : item.id}
                  </span>
                  <span className={'hidden sm:block text-xs font-label truncate ' + (active ? 'text-ink' : 'text-muted')}>
                    {item.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && <div className="h-px bg-line flex-1 min-w-2" />}
              </div>
            )
          })}
        </div>
      </div>

      {paymentError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {paymentError}
        </div>
      )}

      {step === 1 && (
        <section>
          <StepHeading eyebrow="Step 1 of 4" title="What does your car need?" copy="Pick the service that sounds right. We’ll handle the rest." />
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {services.map((s) => {
              const active = s.id === serviceId
              const fee = pricing.bookingFees[s.id] ?? 0
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pickService(s.id)}
                  data-cursor
                  className={
                    'text-left p-4 rounded-xl border transition-all ' +
                    (active
                      ? 'border-blue bg-blue/5 ring-1 ring-blue'
                      : 'border-line hover:border-blue/60 hover:-translate-y-0.5')
                  }
                >
                  <div className="font-bold text-sm mb-1">{s.name}</div>
                  <div className="text-xs text-muted mb-2 leading-relaxed">{s.blurb}</div>
                  <div className="text-blue text-sm font-label">from ${fee}</div>
                </button>
              )
            })}
          </div>
          <StepActions onNext={nextStep} nextLabel="That’s the one →" />
        </section>
      )}

      {step === 2 && (
        <section>
          <StepHeading eyebrow="Step 2 of 4" title="Tell us about your car." copy="And show us where it’s parked. That helps us give you a better estimate." />

          <div className="p-5 rounded-xl border border-line mb-5">
            <h2 className="font-label text-sm uppercase tracking-wide text-muted mb-4">Your vehicle</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <SelectField label="Year" value={vehicle.year} onChange={(value) => setVehicle((v) => ({ ...v, year: value }))} options={VEHICLE_YEARS} placeholder="Year" extraOption={{ value: 'older', label: '2009 or older' }} />
              <SelectField label="Make" value={vehicle.make} onChange={(value) => setVehicle((v) => ({ ...v, make: value }))} options={VEHICLE_MAKES} placeholder="Make" />
              <InputField label="Model" value={vehicle.model} onChange={(value) => setVehicle((v) => ({ ...v, model: value }))} placeholder="e.g. Camry, Accord, F-150" />
            </div>
          </div>

          <div>
            <h2 className="font-label text-sm uppercase tracking-wide text-muted mb-4">Where should we come?</h2>
            <LocationPicker onConfirm={handleLocationConfirm} />
            {locationError && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {locationError}
              </div>
            )}
            {location && (
              <p className="text-xs text-muted mt-3">
                Nice — that’s about {distance.toFixed(1)} mi from our nearest dispatch point.
              </p>
            )}
          </div>

          <StepActions onBack={previousStep} onNext={nextStep} nextLabel="Next: pick a time →" disabled={!validateStep(2)} />
        </section>
      )}

      {step === 3 && (
        <section>
          <StepHeading eyebrow="Step 3 of 4" title="When should we arrive?" copy="Pick a time that works, then leave us a way to reach you." />

          <div className="p-5 rounded-xl border border-line mb-5">
            <h2 className="font-label text-sm uppercase tracking-wide text-muted mb-4">Your visit</h2>
            <div className="mb-4">
              <label className="text-xs text-muted mb-1.5 block">When would you like us?</label>
              <select
                value={appointment.mode}
                onChange={(e) => setAppointment((v) => ({
                  ...v,
                  mode: e.target.value,
                  date: e.target.value === 'asap' ? new Date().toISOString().slice(0, 10) : v.date,
                  time: e.target.value === 'asap' ? 'ASAP' : (v.time === 'ASAP' ? '' : v.time),
                }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue bg-white"
              >
                <option value="asap">ASAP — as soon as we can get to you</option>
                <option value="scheduled">Schedule a time</option>
              </select>
            </div>
            {appointment.mode === 'scheduled' && (
              <div className="grid sm:grid-cols-2 gap-3">
                <InputField label="Date" type="date" value={appointment.date} onChange={(value) => setAppointment((v) => ({ ...v, date: value }))} />
                <SelectField
                  label="Preferred time"
                  value={appointment.time}
                  onChange={(value) => setAppointment((v) => ({ ...v, time: value }))}
                  options={TIME_SLOTS}
                  placeholder="Choose a time"
                />
              </div>
            )}
            {appointment.mode === 'asap' && (
              <p className="text-xs text-muted leading-relaxed">
                We’ll dispatch the nearest available technician and contact you with the expected arrival time.
              </p>
            )}
          </div>

          <div className="p-5 rounded-xl border border-line">
            <h2 className="font-label text-sm uppercase tracking-wide text-muted mb-4">How can we reach you?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <InputField label="Full name" value={contact.name} onChange={(value) => setContact((v) => ({ ...v, name: value }))} placeholder="Your name" />
              <InputField label="Phone number" type="tel" value={contact.phone} onChange={(value) => setContact((v) => ({ ...v, phone: value }))} placeholder="080…" />
              <div className="sm:col-span-2">
                <InputField label="Email" type="email" value={contact.email} onChange={(value) => setContact((v) => ({ ...v, email: value }))} placeholder="you@example.com" />
                <p className="text-[11px] text-muted mt-1.5">We’ll use this for your booking confirmation and receipt.</p>
              </div>
            </div>
          </div>

          <StepActions onBack={previousStep} onNext={nextStep} nextLabel="Review my booking →" disabled={!validateStep(3)} />
        </section>
      )}

      {step === 4 && (
        <section>
          <StepHeading eyebrow="Step 4 of 4" title="Looks good? Let’s wrap it up." copy="Have a quick look. If everything checks out, you can head securely to payment." />

          <div className="rounded-xl border border-line overflow-hidden mb-5">
            <div className="p-5 border-b border-line bg-[#FAFAF8]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-widest font-label mb-1">Service</p>
                  <h2 className="text-xl font-bold">{service?.name}</h2>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs font-label text-blue hover:underline">Change</button>
              </div>
            </div>

            <div className="p-5 grid sm:grid-cols-2 gap-x-8 gap-y-5">
              <SummaryItem label="Vehicle" value={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
              <SummaryItem label="Visit" value={appointment.mode === 'asap' ? `ASAP · ${appointment.date}` : `${appointment.date} · ${appointment.time}`} />
              <SummaryItem label="Location" value={location?.label || 'Confirmed location'} />
              <SummaryItem label="Contact" value={`${contact.name} · ${contact.phone}`} />
              <SummaryItem label="Email" value={contact.email} />
            </div>

            <div className="p-5 border-t border-line">
              <Row label={`${service?.name} booking fee`} value={breakdown.bookingFee} />
              <Row label={`Mileage (${distance.toFixed(1)} mi × $${breakdown.rate.toFixed(2)}/mi)`} value={breakdown.mileageCharge} />
              {activeBonus && activeBonus.id !== 'standard' && <p className="text-xs text-blue mb-2">{activeBonus.label} rate applied</p>}

              <div className="flex items-center gap-2 my-4">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Got a coupon?"
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue"
                />
                <button type="button" onClick={applyCoupon} data-cursor className="px-4 py-2.5 rounded-lg border border-line text-sm font-label hover:border-blue hover:text-blue transition-colors">Apply</button>
              </div>
              {couponError && <p className="text-xs text-red-600 mb-3">{couponError}</p>}
              {coupon?.valid && <Row label={`Coupon — ${coupon.label}`} value={-breakdown.discount} highlight />}

              <div className="border-t border-line mt-3 pt-3 flex justify-between items-baseline">
                <span className="font-bold">Estimated total</span>
                <span className="font-bold text-xl">${breakdown.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 p-5 rounded-xl border border-line cursor-pointer mb-5">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue shrink-0" />
            <span className="text-sm text-muted leading-relaxed">
              This estimate covers <b className="text-ink">{service?.name}</b>. If your technician finds the job needs something extra once they’re on-site, they’ll explain it first and get your OK before doing any additional work. No surprise charges.
            </span>
          </label>

          <EtaPreview distance={distance} />

          <div className="mt-6">
            <h2 className="font-label text-sm uppercase tracking-wide text-muted mb-4">Secure payment</h2>
            {consent ? (
              <PaymentMethod
                total={breakdown.total}
                onConfirm={completePayment}
                loading={paymentLoading}
              />
            ) : (
              <p className="text-center text-sm text-muted p-5 rounded-xl border border-dashed border-line">
                Give the booking a quick once-over and check the box above when you’re happy with it.
              </p>
            )}
          </div>

          <StepActions onBack={previousStep} hideNext />
        </section>
      )}
    </div>
  )
}

function StepHeading({ eyebrow, title, copy }) {
  return (
    <div className="mb-6">
      <span className="text-blue text-xs font-label uppercase tracking-widest">{eyebrow}</span>
      <h2 className="text-2xl md:text-3xl font-display mt-2 tracking-tight">{title}</h2>
      <p className="text-sm text-muted mt-2 max-w-lg leading-relaxed">{copy}</p>
    </div>
  )
}

function StepActions({ onBack, onNext, nextLabel, disabled = false, hideNext = false }) {
  return (
    <div className="flex items-center justify-between gap-3 mt-8">
      {onBack ? (
        <button type="button" onClick={onBack} className="px-4 py-3 text-sm font-label text-muted hover:text-ink transition-colors">← Back</button>
      ) : <span />}
      {!hideNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={disabled}
          data-cursor
          className="px-5 py-3 rounded-lg font-label text-sm bg-blue text-white hover:bg-blue-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder, extraOption }) {
  return (
    <div>
      <label className="text-xs text-muted mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
        {extraOption && <option value={extraOption.value}>{extraOption.label}</option>}
      </select>
    </div>
  )
}

function InputField({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs text-muted mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-1 focus:ring-blue focus:border-blue bg-white"
      />
    </div>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-label text-muted mb-1">{label}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between text-sm py-1 gap-4">
      <span className={highlight ? 'text-blue' : 'text-muted'}>{label}</span>
      <span className={highlight ? 'text-blue font-medium' : ''}>
        {value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}
      </span>
    </div>
  )
}
