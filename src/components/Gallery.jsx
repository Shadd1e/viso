import { homepageMedia } from '../data/homepageMedia.js'

const photos = [
  { src: homepageMedia.mobileCare, tall: true, caption: 'Mobile service at the customer location' },
  { src: homepageMedia.services.brakes, caption: 'Brake service, driveway' },
  { src: homepageMedia.services.battery, caption: 'Battery service' },
  { src: homepageMedia.detailing, tall: true, caption: 'Full detail' },
  { src: homepageMedia.services.wash, caption: 'Wash & detail' },
  { src: homepageMedia.diagnostics, caption: 'Diagnostics on-site' },
]

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 md:py-28 border-t border-line">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="flex flex-wrap justify-between items-end gap-8 mb-12">
          <div><span className="text-blue text-xs font-label uppercase tracking-widest">The Viso way</span><h2 className="text-3xl md:text-5xl font-display mt-3 tracking-tight">On the job, <span className="text-blue">everywhere.</span></h2></div>
          <p className="text-muted max-w-xs text-[15px]">Driveways, office lots, curbs — this is what mobile care looks like when the shop comes to you.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((p, i) => <div key={i} className={'group relative overflow-hidden rounded-2xl border border-line ' + (p.tall ? 'row-span-2 aspect-[3/4]' : 'aspect-square')}><img src={p.src} alt={p.caption} loading="lazy" className="w-full h-full object-cover grayscale-[18%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" /><div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-ink/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"><span className="text-white text-xs font-label">{p.caption}</span></div></div>)}
        </div>
      </div>
    </section>
  )
}
