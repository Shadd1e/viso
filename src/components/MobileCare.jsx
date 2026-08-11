import { homepageMedia } from '../data/homepageMedia.js'

export default function MobileCare() {
  return (
    <section id="what-we-do" className="scroll-mt-24 py-24 md:py-28 border-t border-line">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11 grid md:grid-cols-2 gap-10 items-center">
        <div className="rounded-3xl overflow-hidden border border-line aspect-[4/3]">
          <img src={homepageMedia.mobileCare} alt="Viso technician working on a vehicle at a customer location" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="md:pl-8">
          <span className="text-blue text-xs font-label uppercase tracking-widest">Mobile auto care</span>
          <h2 className="text-3xl md:text-5xl font-display mt-3 mb-5 tracking-tight">Your parking spot is the <span className="text-blue">shop.</span></h2>
          <p className="text-muted leading-relaxed max-w-lg mb-7">From routine maintenance to diagnostics and roadside help, Viso brings the technician, tools, and know-how to wherever your car is already sitting.</p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {['Home', 'Office', 'Driveway', 'Curbside'].map((x) => <div key={x} className="border border-line rounded-xl px-4 py-3 text-sm font-medium">{x}</div>)}
          </div>
        </div>
      </div>
    </section>
  )
}
