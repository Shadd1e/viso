import { homepageMedia } from '../data/homepageMedia.js'
import BookButton from './BookButton.jsx'

export default function FleetPreview() {
  return (
    <section className="py-24 md:py-28 border-t border-line">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-3xl border border-line">
          <div className="aspect-[4/3] md:aspect-auto overflow-hidden"><img src={homepageMedia.fleet} alt="Commercial fleet vehicles ready for service" loading="lazy" className="w-full h-full object-cover" /></div>
          <div className="p-8 md:p-14 bg-[#FAFAF8] flex flex-col justify-center">
            <span className="text-blue text-xs font-label uppercase tracking-widest">Fleet care</span>
            <h2 className="text-3xl md:text-4xl font-display mt-3 mb-4">Keep the whole fleet <span className="text-blue">moving.</span></h2>
            <p className="text-muted leading-relaxed mb-7">Need routine service across several vehicles? Viso can coordinate mobile maintenance around your team's schedule.</p>
            <div><BookButton href="/fleet">Explore fleet service →</BookButton></div>
          </div>
        </div>
      </div>
    </section>
  )
}
