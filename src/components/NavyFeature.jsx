import { homepageMedia } from '../data/homepageMedia.js'

export default function NavyFeature() {
  return (
    <section className="py-24 md:py-28">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="relative overflow-hidden rounded-3xl bg-ink min-h-[430px] grid md:grid-cols-2 items-stretch">
          <div className="relative p-8 md:p-14 flex flex-col justify-center z-10">
            <span className="text-[#C9A227] text-xs font-label uppercase tracking-widest">Know before we touch it</span>
            <h2 className="text-3xl md:text-5xl font-display text-white mt-3 mb-5">Clear diagnostics. <span className="text-[#C9A227]">Clear decisions.</span></h2>
            <p className="text-white/65 max-w-md leading-relaxed">We explain what’s wrong, what it means, and what it will cost before extra work starts. No mystery repairs. No awkward surprises.</p>
          </div>
          <div className="min-h-[280px] md:min-h-0 overflow-hidden">
            <img src={homepageMedia.diagnostics} alt="Technician performing vehicle diagnostics" loading="lazy" className="w-full h-full object-cover opacity-75" />
          </div>
        </div>
      </div>
    </section>
  )
}
