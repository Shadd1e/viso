import { useState } from 'react'

const faqs = [
  {
    q: 'How does mobile service actually work?',
    a: "You pick a service and location when you book. A certified technician drives to you — your driveway, office lot, or curb — with everything needed to do the job on-site. No drop-off, no shop visit.",
  },
  {
    q: 'How is the price calculated?',
    a: "Each service has a flat booking fee, plus a mileage charge based on how far the technician has to travel to reach you. You'll see the full breakdown, and can apply a coupon code, before you confirm.",
  },
  {
    q: "What if my car needs more than what I booked?",
    a: "Your technician will explain what they found and why, and get your OK before doing any extra work. You'd only ever pay the difference for that added work — never a surprise charge.",
  },
  {
    q: 'What areas do you cover?',
    a: 'Viso currently dispatches across the greater Atlanta metro, with more cities on the way. Enter your address at booking to confirm coverage for your location.',
  },
  {
    q: 'How do I pay?',
    a: 'Card payments are processed securely through Stripe. CashApp and Venmo are on the way as additional options.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="py-24 md:py-28 border-t border-line">
      <div className="max-w-[820px] mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-display font-normal tracking-tight mb-12 text-center">
          Questions, <span className="text-blue">answered</span>
        </h2>

        <div className="divide-y divide-line border-t border-b border-line">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  data-cursor
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-medium text-[15px]">{f.q}</span>
                  <span
                    className={
                      'shrink-0 w-6 h-6 rounded-full border border-line flex items-center justify-center text-sm transition-transform duration-300 ' +
                      (isOpen ? 'rotate-45 border-blue text-blue' : '')
                    }
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="text-muted text-sm leading-relaxed pb-5 pr-8">{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
