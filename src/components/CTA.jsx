import BookButton from './BookButton.jsx'

export default function CTA() {
  return (
    <section className="py-20 md:py-24 border-t border-line">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 md:px-16 md:py-20 text-center">
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: 'radial-gradient(circle at 30% 20%, rgba(51,53,156,0.55), transparent 55%)' }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-display font-normal tracking-tight text-white mb-4">
              Your car, wherever it's parked.
            </h2>
            <p className="text-white/65 max-w-md mx-auto mb-9 text-[15px] leading-relaxed">
              Certified technicians, dispatched on your schedule. No shop, no waiting room, no wasted afternoon.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <BookButton primary href="/book">Book a Service →</BookButton>
              <BookButton light href="#services">Explore Services</BookButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
