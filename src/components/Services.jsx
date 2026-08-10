import { Link } from 'react-router-dom'
import { services } from '../data/services.js'
import { homepageMedia } from '../data/homepageMedia.js'

const serviceImages = {
  diagnostics: homepageMedia.services.diagnostics,
  'oil-change': homepageMedia.services.oil,
  'brake-service': homepageMedia.services.brakes,
  battery: homepageMedia.services.battery,
  'air-conditioning': homepageMedia.services.ac,
  'wash-detail': homepageMedia.services.wash,
}

const visualServices = [
  ['diagnostics', 'Diagnostics', 'See what is actually going on under the hood.'],
  ['oil-change', 'Oil Change', 'Fresh oil and filters without the shop stop.'],
  ['brake-service', 'Brake Service', 'Pads, rotors, inspection and the answers you need.'],
  ['battery', 'Battery', 'Test, replace, and get moving again.'],
  ['air-conditioning', 'Air Conditioning', 'Keep the cabin cool without losing your day.'],
  ['wash-detail', 'Wash & Detail', 'A proper clean, brought right to your parking spot.'],
]

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-28">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="flex flex-wrap justify-between items-end gap-8 mb-12">
          <div>
            <span className="text-blue text-xs font-label uppercase tracking-widest">Services</span>
            <h2 className="text-3xl md:text-5xl font-display mt-3 tracking-tight">Whatever your car needs, <span className="text-blue">we come.</span></h2>
          </div>
          <p className="text-muted max-w-xs text-[15px]">From routine maintenance to roadside help and detailing, one mobile team can handle the lot.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {visualServices.map(([id, name, blurb]) => (
            <Link key={id} to={`/book?service=${id}`} data-cursor className="group rounded-2xl overflow-hidden border border-line bg-white hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="aspect-[16/10] overflow-hidden bg-[#F1F1EE]">
                <img src={serviceImages[id]} alt={name} loading="lazy" className="w-full h-full object-cover grayscale-[22%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4"><h3 className="font-semibold text-lg">{name}</h3><span className="text-blue">↗</span></div>
                <p className="text-muted text-sm leading-relaxed mt-2">{blurb}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {services.filter((s) => !visualServices.some(([id]) => id === s.id)).map((s) => (
            <Link key={s.id} to={`/book?service=${s.id}`} data-cursor className="px-4 py-2.5 rounded-full border border-line text-sm hover:border-blue hover:text-blue transition-colors">{s.name}</Link>
          ))}
        </div>
      </div>
    </section>
  )
}
