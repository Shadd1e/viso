import { homepageMedia } from '../data/homepageMedia.js'

export default function CarCare() {
  return (
    <section className="py-24 md:py-28 border-t border-line">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11 grid md:grid-cols-[.9fr_1.1fr] gap-10 items-center">
        <div>
          <span className="text-blue text-xs font-label uppercase tracking-widest">Wash & detailing</span>
          <h2 className="text-3xl md:text-5xl font-display mt-3 mb-5">More than repairs. <span className="text-blue">More care.</span></h2>
          <p className="text-muted leading-relaxed max-w-lg mb-7">Keep the outside sharp and the inside fresh without losing half a Saturday at a car wash. We bring the finish to you too.</p>
          <div className="flex flex-wrap gap-2.5">
            {['Exterior wash', 'Interior detail', 'Vacuum & wipe-down', 'Tyre care'].map((x) => <span key={x} className="px-4 py-2 rounded-full border border-line text-sm">{x}</span>)}
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden border border-line aspect-[16/10]">
          <img src={homepageMedia.detailing} alt="Professional car detailing service" loading="lazy" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  )
}
