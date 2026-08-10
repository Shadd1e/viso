import { Link } from 'react-router-dom'
import { homepageMedia } from '../data/homepageMedia.js'

const benefits = [
  ['01','Minimize downtime','Keep vehicles operational by servicing them where they are instead of taking them out of service.'],
  ['02','Reduce operating friction','Cut down on towing, rental vehicles, staff time, and disruption from off-site service.'],
  ['03','Scheduled maintenance','Build proactive maintenance around your business schedule instead of waiting for a breakdown.'],
  ['04','Service visibility','Keep a clear record of work performed so vehicle maintenance is easier to manage.'],
]
const services = [
  ['Fleet maintenance',['Scheduled preventive maintenance','Oil changes and filter replacements','Brake system maintenance','Battery and electrical service','Cooling system maintenance','Multi-point vehicle inspections']],
  ['Emergency repairs',['On-site diagnostic services','Breakdown assistance','Priority service scheduling','Mobile parts coordination','Temporary repair solutions','Road-readiness checks']],
  ['Fleet management',['Customized maintenance schedules','Vehicle history tracking','Service cost visibility','Preventive maintenance reminders','Fleet performance reporting','Service documentation']],
]

export default function Fleet() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 bg-navy text-white">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11 grid lg:grid-cols-[.9fr_1.1fr] gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[.22em] text-white/45">VISO FLEET CARE</p>
            <h1 className="mt-5 text-[clamp(3rem,7vw,6.5rem)] leading-[.9] tracking-[-.055em] font-display">Fleet care<span className="block text-blue">without the downtime.</span></h1>
            <p className="mt-7 max-w-xl text-lg md:text-xl leading-8 text-white/65">Professional mobile automotive services designed to keep business vehicles on the road and your operations running smoothly.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/book" className="rounded-full bg-blue px-6 py-3.5 text-sm font-label text-white" data-cursor>Schedule fleet service</Link>
              <a href="#fleet-services" className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-label text-white/80" data-cursor>View fleet services</a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] min-h-[360px] md:min-h-[500px] border border-white/10">
            <img src={homepageMedia.fleet} alt="Vehicles prepared for fleet service" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/55 to-transparent" />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-soft">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11">
          <p className="eyebrow">WHY MOBILE FLEET SERVICE</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(2.5rem,5vw,4.8rem)] leading-[.96] tracking-[-.045em] font-display">Keep the vehicles working. Keep the business moving.</h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map(([n,t,x]) => <div key={n} className="rounded-[1.5rem] bg-white border border-line p-6 md:p-7"><span className="text-xs tracking-[.18em] text-ink/30">{n}</span><h3 className="mt-12 text-xl font-display">{t}</h3><p className="mt-3 leading-7 text-ink/60">{x}</p></div>)}
          </div>
        </div>
      </section>

      <section id="fleet-services" className="py-20 md:py-28">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11">
          <p className="eyebrow">COMPREHENSIVE FLEET SERVICES</p>
          <h2 className="mt-4 text-[clamp(2.5rem,5vw,4.8rem)] leading-[.96] tracking-[-.045em] font-display">Built around your operation.</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {services.map(([title,items]) => <div key={title} className="rounded-[1.75rem] border border-line p-7 md:p-8"><h3 className="text-2xl font-display">{title}</h3><ul className="mt-7 space-y-3">{items.map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-ink/60"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue shrink-0" />{item}</li>)}</ul></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-soft">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11">
          <p className="eyebrow">FLEET TYPES</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(2.5rem,5vw,4.8rem)] leading-[.96] tracking-[-.045em] font-display">Different vehicles. Same goal: uptime.</h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Delivery fleets','Keep delivery vehicles running smoothly with regular maintenance and quick repairs.'],
              ['Company vehicles','Professional maintenance for executive, sales, and company vehicles.'],
              ['Commercial trucks','Practical service for light commercial trucks and work vehicles.'],
              ['Service vehicles','Maintenance for contractors, technicians, and field-service vehicles.'],
            ].map(([title,text],i) => (
              <div key={title} className="overflow-hidden rounded-[1.5rem] border border-line bg-white">
                <div className="h-40 overflow-hidden"><img src={[homepageMedia.fleet,homepageMedia.services?.wash,homepageMedia.services?.oil,homepageMedia.services?.diagnostics][i]} alt="" className="h-full w-full object-cover" /></div>
                <div className="p-6"><h3 className="text-xl font-display">{title}</h3><p className="mt-3 text-sm leading-6 text-ink/60">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-blue text-white text-center">
        <div className="max-w-[1000px] mx-auto px-6 md:px-11">
          <p className="text-xs uppercase tracking-[.22em] text-white/55">LET'S TALK</p>
          <h2 className="mt-5 text-[clamp(2.8rem,6vw,5.8rem)] leading-[.92] tracking-[-.05em] font-display">Ready to streamline your fleet care?</h2>
          <p className="mt-6 mx-auto max-w-2xl text-lg leading-8 text-white/70">Tell Viso about your vehicles, schedule, and support needs.</p>
          <Link to="/book" className="inline-flex mt-8 rounded-full bg-white px-7 py-3.5 text-sm font-label text-blue" data-cursor>Schedule fleet service</Link>
        </div>
      </section>
    </main>
  )
}
