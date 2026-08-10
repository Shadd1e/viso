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
    return {
      bookingFee,
      mileageCharge,
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
      distance,
    }
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
      if (!vehicle.year || !vehicle.make || !vehicle.model) {
        return setError('Please enter your vehicle details.')
      }
      if (!contact.name || !contact.phone || !contact.email) {
        return setError('Please enter your contact details.')
      }
      if (!normalizeUSPhone(contact.phone)) {
        return setError('Enter a valid 10-digit US phone number, for example (404) 555-0123.')
      }
      if (!location.address) return setError('Please enter the service address.')
    }

    if (step === 3 && (!appointment.date || !appointment.time)) {
      return setError('Choose a date and time.')
    }

    setStep((s) => Math.min(4, s + 1))
  }

  async function completePayment() {
    setError('')
    if (!consent) return setError('Please accept the booking terms before paying.')
    if (!service) return setError('Please select a service.')

    const url = import.meta.env.VITE_SUPABASE_URL
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!url || !anon) {
      return setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.')
    }

    try {
      setLoading(true)

      const response = await fetch(`${url}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          vehicle,
          appointment,
          contact: { ...contact, phone: normalizeUSPhone(contact.phone) },
          location,
          distanceMiles: breakdown.distance,
          couponCode: couponPercent ? couponCode : '',
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
    <main className="booking-page min-h-screen bg-white text-[#22243a]">
      <div className="booking-pattern pointer-events-none fixed inset-0 -z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:px-7 md:py-12">
        <header className="mb-8 md:mb-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full border border-[#3531a4]/10 bg-white shadow-sm">
                <span className="text-lg font-black tracking-[-0.08em] text-[#3531a4]">V</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#77798a]">Viso</p>
                <p className="text-sm font-semibold text-[#27283b]">Mobile Auto Care</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full bg-[#3531a4] px-4 py-2 text-xs font-semibold text-white shadow-sm">
                Book Service
              </span>
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#3531a4]">Book Viso</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-[#25263a] md:text-5xl">
            Let’s get your car sorted.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#77798a] md:text-base">
            Pick a service, tell us where and when, then pay securely through Stripe.
          </p>
        </header>

        <div className="mb-7 grid grid-cols-4 gap-2 md:mb-8">
          {steps.map((label, i) => (
            <div key={label} className="flex min-w-0 items-center gap-2">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold transition ${
                  step >= i + 1
                    ? 'bg-[#3531a4] text-white shadow-sm'
                    : 'border border-[#dedee7] bg-white text-[#9a9baa]'
                }`}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span
                className={`hidden truncate text-xs sm:block ${
                  step === i + 1 ? 'font-semibold text-[#3531a4]' : 'text-[#999aaa]'
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="booking-card rounded-[24px] border border-[#e3e3e9] bg-white p-5 shadow-[0_12px_40px_rgba(38,38,70,.06)] md:p-8">
            {step === 1 && (
              <>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#28293c]">What do you need?</h2>
                <p className="mt-2 text-sm text-[#858696]">Choose the service that best matches the job.</p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {SERVICES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceId(s.id)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        serviceId === s.id
                          ? 'border-[#3531a4] bg-[#3531a4]/[.06] shadow-[0_5px_18px_rgba(53,49,164,.08)]'
                          : 'border-[#e2e2e8] bg-white hover:border-[#b9b9c9] hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-[#303143]">{s.name}</span>
                        <span className="text-sm font-semibold text-[#3531a4]">{money(s.fee)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#28293c]">
                  Tell us about you and the car.
                </h2>

                <div className="mt-7 space-y-7">
                  <div>
                    <p className="mb-3 text-sm font-medium text-[#666879]">Vehicle</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input value={vehicle.year} onChange={update(setVehicle, 'year')} placeholder="Year" className="field" />
                      <input value={vehicle.make} onChange={update(setVehicle, 'make')} placeholder="Make" className="field" />
                      <input value={vehicle.model} onChange={update(setVehicle, 'model')} placeholder="Model" className="field" />
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium text-[#666879]">Contact</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={contact.name} onChange={update(setContact, 'name')} placeholder="Full name" className="field" />
                      <input
                        value={contact.phone}
                        onChange={handlePhoneChange}
                        placeholder="(404) 555-0123"
                        inputMode="tel"
                        autoComplete="tel"
                        type="tel"
                        maxLength="14"
                        className="field"
                      />
                      <input
                        value={contact.email}
                        onChange={update(setContact, 'email')}
                        placeholder="Email address"
                        type="email"
                        className="field sm:col-span-2"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium text-[#666879]">Service location</p>
                    <input value={location.address} onChange={update(setLocation, 'address')} placeholder="Street address" className="field w-full" />
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input value={location.city} onChange={update(setLocation, 'city')} placeholder="City / suburb" className="field" />
                      <input
                        value={distanceMiles}
                        onChange={(e) => setDistanceMiles(e.target.value)}
                        type="number"
                        min="0"
                        step=".1"
                        placeholder="Distance in miles"
                        className="field"
                      />
                    </div>
                    <textarea
                      value={location.notes}
                      onChange={update(setLocation, 'notes')}
                      rows="3"
                      placeholder="Anything we should know? (optional)"
                      className="field mt-3 w-full resize-none"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#28293c]">When works for you?</h2>
                <p className="mt-2 text-sm text-[#858696]">Choose a date and convenient time.</p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-[#666879]">
                    Date
                    <input
                      min={today}
                      type="date"
                      value={appointment.date}
                      onChange={update(setAppointment, 'date')}
                      className="field mt-2 w-full"
                    />
                  </label>

                  <label className="text-sm font-medium text-[#666879]">
                    Time
                    <input
                      type="time"
                      value={appointment.time}
                      onChange={update(setAppointment, 'time')}
                      className="field mt-2 w-full"
                    />
                  </label>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#28293c]">Review & Pay</h2>
                <p className="mt-2 text-sm text-[#858696]">Check your details, then continue to Stripe.</p>

                <div className="mt-7 space-y-3 rounded-2xl border border-[#e3e3e9] bg-[#fafafd] p-5 text-sm">
                  <Row label="Service" value={service?.name} />
                  <Row label="Vehicle" value={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
                  <Row label="Appointment" value={`${appointment.date} at ${appointment.time}`} />
                  <Row label="Location" value={location.address} />
                  <Row label="Email" value={contact.email} />
                </div>

                <div className="mt-6 flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value)
                      setCouponMessage('')
                    }}
                    placeholder="Coupon code"
                    className="field min-w-0 flex-1 uppercase"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCouponMessage(
                        couponPercent
                          ? `${couponPercent}% discount applied.`
                          : 'That coupon code is not valid.'
                      )
                    }
                    className="rounded-xl border border-[#d9d9e1] bg-white px-4 text-sm font-medium text-[#4c4d5e] transition hover:border-[#3531a4] hover:text-[#3531a4]"
                  >
                    Apply
                  </button>
                </div>

                {couponMessage && (
                  <p className={`mt-2 text-xs ${couponPercent ? 'text-[#3531a4]' : 'text-red-500'}`}>
                    {couponMessage}
                  </p>
                )}

                <label className="mt-6 flex gap-3 text-sm text-[#77798a]">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 accent-[#3531a4]"
                  />
                  <span>I confirm these booking details are correct and agree to Viso’s booking and cancellation terms.</span>
                </label>

                <button
                  type="button"
                  disabled={loading || !consent}
                  onClick={completePayment}
                  className="mt-7 w-full rounded-xl bg-[#3531a4] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(53,49,164,.18)] transition hover:bg-[#2f2b92] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? 'Opening secure checkout…' : `Continue to secure payment · ${money(breakdown.total)}`}
                </button>
              </>
            )}

            <div className="mt-9 flex justify-between border-t border-[#e8e8ed] pt-6">
              <button
                type="button"
                disabled={step === 1 || loading}
                onClick={() => {
                  setError('')
                  setStep((s) => s - 1)
                }}
                className="rounded-full px-4 py-2 text-sm font-medium text-[#6d6e7d] transition hover:text-[#3531a4] disabled:invisible"
              >
                ← Back
              </button>

              {step < 4 && (
                <button
                  type="button"
                  onClick={next}
                  className="rounded-xl bg-[#3531a4] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(53,49,164,.15)] transition hover:bg-[#2f2b92]"
                >
                  Continue →
                </button>
              )}
            </div>
          </section>

          <aside className="booking-card h-fit rounded-[24px] border border-[#e3e3e9] bg-white p-6 shadow-[0_12px_40px_rgba(38,38,70,.06)] lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-[.25em] text-[#3531a4]">Your booking</p>
            <h2 className="mt-2 text-xl font-semibold text-[#292a3d]">{service?.name || 'Select a service'}</h2>

            <div className="my-6 space-y-3 text-sm">
              <Row label="Service fee" value={money(breakdown.bookingFee)} />
              <Row label={`${breakdown.distance.toFixed(1)} mi × $0.75`} value={money(breakdown.mileageCharge)} />
              {breakdown.discount > 0 && (
                <Row label={`Coupon (${couponPercent}%)`} value={`−${money(breakdown.discount)}`} />
              )}
            </div>

            <div className="flex items-end justify-between border-t border-[#e8e8ed] pt-5">
              <span className="text-sm text-[#858696]">Total</span>
              <strong className="text-3xl tracking-tight text-[#292a3d]">{money(breakdown.total)}</strong>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#9a9baa]">
              Payment is processed securely by Stripe. Viso does not store your card details.
            </p>
          </aside>
        </div>
      </div>

      <style>{`
        .booking-page {
          font-family: inherit;
          position: relative;
          overflow-x: hidden;
        }

        .booking-pattern {
          opacity: .55;
          background-image:
            radial-gradient(circle at 8% 18%, rgba(53,49,164,.055) 0 2px, transparent 3px),
            radial-gradient(circle at 78% 12%, rgba(53,49,164,.045) 0 3px, transparent 4px),
            radial-gradient(circle at 24% 74%, rgba(53,49,164,.045) 0 2px, transparent 3px),
            radial-gradient(circle at 91% 62%, rgba(53,49,164,.05) 0 3px, transparent 4px);
          background-size: 180px 180px, 240px 240px, 210px 210px, 260px 260px;
        }

        .field {
          width: 100%;
          border: 1px solid #dfdfe6;
          background: rgba(255,255,255,.96);
          border-radius: .8rem;
          padding: .78rem 1rem;
          font-size: .875rem;
          line-height: 1.5;
          outline: none;
          color: #2c2d3e;
          box-shadow: 0 1px 2px rgba(35,35,55,.02);
          transition: border-color .18s ease, box-shadow .18s ease;
        }

        .field::placeholder {
          color: #a0a1ae;
        }

        .field:focus {
          border-color: rgba(53,49,164,.55);
          box-shadow: 0 0 0 3px rgba(53,49,164,.08);
        }

        input[type="date"],
        input[type="time"] {
          color-scheme: light;
        }
      `}</style>
    </main>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[#858696]">{label}</span>
      <span className="max-w-[65%] text-right text-[#3d3e4e]">{value || '—'}</span>
    </div>
  )
}
