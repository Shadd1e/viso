import BookButton from './BookButton.jsx'
import { homepageMedia } from '../data/homepageMedia.js'

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="relative overflow-hidden rounded-3xl bg-ink min-h-[360px] flex items-center justify-center text-center px-6">
          <img src={homepageMedia.cta} alt="Technician providing mobile vehicle service" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-ink/55" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-[#C9A227] text-xs font-label uppercase tracking-widest">Whenever you're ready</span>
            <h2 className="text-3xl md:text-5xl font-display text-white mt-3 mb-4">Your car. Your place. <span className="text-[#C9A227]">Your time.</span></h2>
            <p className="text-white/65 mb-8">Tell us what your car needs and we’ll take it from there.</p>
            <div className="flex justify-center"><BookButton primary href="/book">Book a Service →</BookButton></div>
          </div>
        </div>
      </div>
    </section>
  )
}
