import { homepageMedia } from '../data/homepageMedia.js'

const reasons = [
  ['Convenience', 'The technician comes to the car, not the other way around.'],
  ['Straight answers', 'Clear estimates and approval before additional work.'],
  ['One place', 'Maintenance, diagnostics, detailing, and roadside help under one roof.'],
]

export default function WhyViso() {
  return (
    <section className="py-24 md:py-28 border-t border-line">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11 grid md:grid-cols-2 gap-10 items-center">
        <div className="rounded-3xl overflow-hidden border border-line aspect-[4/3] md:order-2">
          <img src={homepageMedia.whyViso} alt="Automotive technician working with a customer" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="md:order-1">
          <span className="text-blue text-xs font-label uppercase tracking-widest">Why Viso</span>
          <h2 className="text-3xl md:text-5xl font-display mt-3 mb-8">The easy part should be <span className="text-blue">easy.</span></h2>
          <div className="space-y-6">
            {reasons.map(([title, body], i) => <div key={title} className="flex gap-4"><span className="text-blue text-xs font-label mt-1">0{i + 1}</span><div><h3 className="font-semibold mb-1">{title}</h3><p className="text-muted text-sm leading-relaxed max-w-md">{body}</p></div></div>)}
          </div>
        </div>
      </div>
    </section>
  )
}
