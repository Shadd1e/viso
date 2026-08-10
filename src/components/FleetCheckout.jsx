import { useState } from 'react'

const FLEET_SERVICE_ID = 'fleet-service'
const FLEET_SERVICE_NAME = 'Fleet Service'

export default function FleetCheckout() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    businessName: '',
    fleetSize: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))

  async function startCheckout(event) {
    event.preventDefault()
    setError('')

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase is not configured. Check your Vite environment variables.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          serviceId: FLEET_SERVICE_ID,
          serviceName: FLEET_SERVICE_NAME,
          fleet: {
            businessName: form.businessName.trim(),
            fleetSize: form.fleetSize,
            contactName: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            notes: form.notes.trim(),
          },
          // Fleet pricing is intentionally calculated by the same
          // server-side Stripe checkout function used by normal bookings.
          // Do not send an amount from the browser.
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.error || 'Unable to start secure payment.')
      }

      if (!result.checkoutUrl) {
        throw new Error('Stripe did not return a checkout URL.')
      }

      window.location.assign(result.checkoutUrl)
    } catch (err) {
      console.error('Fleet Stripe checkout error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong starting payment.')
      setLoading(false)
    }
  }

  return (
    <section id="fleet-booking" className="py-20 md:py-28 border-t border-line">
      <div className="max-w-[900px] mx-auto px-6 md:px-11">
        {!open ? (
          <div className="rounded-[2rem] bg-navy text-white p-8 md:p-12 text-center">
            <p className="text-xs uppercase tracking-[.22em] text-white/45">FLEET BOOKING</p>
            <h2 className="mt-4 text-[clamp(2.4rem,5vw,4.5rem)] leading-[.95] tracking-[-.045em] font-display">
              Ready to put your fleet on a better maintenance schedule?
            </h2>
            <p className="mt-5 mx-auto max-w-2xl text-white/60 leading-7">
              Start your fleet service request here. You will stay on the Fleet
              page until you are ready to continue to secure Stripe checkout.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              data-cursor
              className="mt-8 inline-flex rounded-full bg-blue px-7 py-3.5 text-sm font-label text-white hover:bg-blue-deep transition-colors"
            >
              Book Fleet Service
            </button>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-line bg-white p-7 md:p-10">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="eyebrow">FLEET CHECKOUT</p>
                <h2 className="mt-3 text-3xl md:text-4xl font-display tracking-[-.03em]">
                  Tell us about your fleet.
                </h2>
                <p className="mt-3 text-ink/60 leading-7">
                  Once you submit this, the same secure Stripe checkout used by
                  Viso's regular bookings will open.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-ink/45 hover:text-ink"
              >
                Close
              </button>
            </div>

            <form onSubmit={startCheckout} className="mt-8 grid sm:grid-cols-2 gap-4">
              <label className="text-sm font-label">
                Business name
                <input
                  required
                  value={form.businessName}
                  onChange={update('businessName')}
                  className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-sans outline-none focus:border-blue"
                  placeholder="Your company"
                />
              </label>

              <label className="text-sm font-label">
                Fleet size
                <select
                  required
                  value={form.fleetSize}
                  onChange={update('fleetSize')}
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-sans outline-none focus:border-blue"
                >
                  <option value="">Select</option>
                  <option value="1-5">1–5 vehicles</option>
                  <option value="6-10">6–10 vehicles</option>
                  <option value="11-25">11–25 vehicles</option>
                  <option value="26-50">26–50 vehicles</option>
                  <option value="51+">51+ vehicles</option>
                </select>
              </label>

              <label className="text-sm font-label">
                Contact name
                <input
                  required
                  value={form.name}
                  onChange={update('name')}
                  className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-sans outline-none focus:border-blue"
                  placeholder="Your name"
                />
              </label>

              <label className="text-sm font-label">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-sans outline-none focus:border-blue"
                  placeholder="you@company.com"
                />
              </label>

              <label className="text-sm font-label sm:col-span-2">
                Phone
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-sans outline-none focus:border-blue"
                  placeholder="Your phone number"
                />
              </label>

              <label className="text-sm font-label sm:col-span-2">
                What do you need?
                <textarea
                  value={form.notes}
                  onChange={update('notes')}
                  rows="4"
                  className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-sans outline-none focus:border-blue resize-y"
                  placeholder="Tell us what your fleet needs..."
                />
              </label>

              {error && (
                <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="sm:col-span-2 rounded-xl bg-soft p-5">
                <p className="text-xs uppercase tracking-[.18em] text-ink/40">Secure payment</p>
                <p className="mt-2 text-sm leading-6 text-ink/60">
                  Your card details are handled by Stripe. Viso's site does not
                  collect or store card numbers.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  data-cursor
                  className="w-full mt-5 py-3.5 rounded-xl font-label text-sm bg-blue text-white hover:bg-blue-deep transition-colors disabled:opacity-50"
                >
                  {loading ? 'Opening secure checkout…' : 'Continue to Secure Payment →'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}
