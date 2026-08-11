import { Link } from 'react-router-dom'
import logo from '../assets/images/logo.png'
import { homepageMedia } from '../data/homepageMedia.js'

const values = [
  ['01','Convenience without compromise','Quality automotive service should not require you to lose half a day. We bring professional care to your home, office, or another convenient location.'],
  ['02','Clear, honest service','We keep the experience straightforward — clear expectations, practical communication, and pricing you can understand before work begins.'],
  ['03','People first','The technology makes booking easier, but the experience is still about people, their vehicles, and earning trust one visit at a time.'],
]

export default function About() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <section className="pt-28 md:pt-36 pb-20 md:pb-28">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11">
          <p className="eyebrow">ABOUT VISO</p>
          <h1 className="mt-4 max-w-5xl text-[clamp(3rem,7vw,6.5rem)] leading-[.91] tracking-[-.055em] font-display">
            Your car.<span className="block text-blue">Our expertise.</span><span className="block">Wherever you are.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl leading-8 text-ink/65">
            Viso Mobile Auto Care brings professional automotive service directly to your location across Atlanta and surrounding areas — because good car care should fit around your life.
          </p>
          <div className="mt-14 grid md:grid-cols-[1.45fr_.55fr] gap-5">
            <div className="relative overflow-hidden rounded-[2rem] bg-navy min-h-[390px] md:min-h-[570px]">
              <img src={homepageMedia.mobileCare} alt="Professional technician servicing a vehicle" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-transparent to-transparent" />
              <div className="absolute left-7 bottom-7 md:left-10 md:bottom-10 max-w-md text-white">
                <p className="text-xs uppercase tracking-[.22em] text-white/55">THE VISO IDEA</p>
                <p className="mt-3 text-2xl md:text-3xl font-display leading-tight">Professional care, delivered where the vehicle already is.</p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-line bg-soft p-7 md:p-10 flex flex-col justify-between">
              <img src={logo} alt="VISO Mobile Auto Care" className="h-11 w-auto object-contain object-left" />
              <div className="mt-12">
                <p className="eyebrow">OUR STORY</p>
                <h2 className="mt-3 text-3xl md:text-4xl tracking-[-.035em] font-display">Less waiting. Less disruption. Better access to car care.</h2>
                <p className="mt-5 leading-7 text-ink/60">Traditional service can turn a routine vehicle need into a scheduling headache. Viso is built to remove that friction while keeping the standard of care high.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-navy text-white">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11">
          <p className="text-xs uppercase tracking-[.22em] text-white/45">WHY WE EXIST</p>
          <h2 className="mt-5 max-w-4xl text-[clamp(2.5rem,5vw,5rem)] leading-[.95] tracking-[-.045em] font-display">Your time matters as much as your vehicle.</h2>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">Our mission is to make professional, reliable automotive service more convenient without turning convenience into an excuse for lower standards.</p>
          <div className="mt-14 grid md:grid-cols-3 gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10">
            {values.map(([number,title,text]) => (
              <div key={number} className="bg-navy p-7 md:p-9">
                <span className="text-xs tracking-[.18em] text-white/35">{number}</span>
                <h3 className="mt-16 text-2xl font-display">{title}</h3>
                <p className="mt-4 leading-7 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11 grid lg:grid-cols-[.8fr_1.2fr] gap-12 lg:gap-24">
          <div>
            <p className="eyebrow">WHAT WE DO</p>
            <h2 className="mt-4 text-[clamp(2.5rem,5vw,4.8rem)] leading-[.96] tracking-[-.045em] font-display">More than a trip to the shop.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['Routine maintenance','Oil changes, brakes, batteries, inspections, and everyday work that keeps a vehicle dependable.'],
              ['Diagnostics & repairs','Professional diagnostic work and practical repairs brought to the vehicle.'],
              ['Detailing & care','Cleaning and appearance services that help your vehicle feel as good as it runs.'],
              ['Fleet support','Scheduled mobile maintenance designed to keep business vehicles working.'],
            ].map(([title,text]) => (
              <div key={title} className="rounded-[1.5rem] border border-line p-6 md:p-7">
                <h3 className="text-xl font-display">{title}</h3><p className="mt-3 leading-7 text-ink/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-soft">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="eyebrow">WHERE WE SERVE</p>
            <h2 className="mt-4 text-[clamp(2.5rem,5vw,4.8rem)] leading-[.96] tracking-[-.045em] font-display">Atlanta and the communities around it.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/60">Viso currently focuses on Atlanta and surrounding communities. If your location is outside our current service area, we will let you know rather than promising a visit we cannot reliably provide.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {['Atlanta','Buckhead','Midtown','Downtown','Decatur','Sandy Springs','Brookhaven'].map(area => <span key={area} className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink/65">{area}</span>)}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] min-h-[390px] bg-navy"><img src={homepageMedia.fleet} alt="Vehicles ready for professional fleet service" className="h-full w-full object-cover" /></div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-blue text-white text-center">
        <div className="max-w-[1000px] mx-auto px-6 md:px-11">
          <p className="text-xs uppercase tracking-[.22em] text-white/55">READY WHEN YOU ARE</p>
          <h2 className="mt-5 text-[clamp(2.8rem,6vw,5.8rem)] leading-[.92] tracking-[-.05em] font-display">Better car care, without the detour.</h2>
          <p className="mt-6 mx-auto max-w-2xl text-lg leading-8 text-white/70">Tell us what your vehicle needs and let Viso bring the service to you.</p>
          <Link to="/book" className="inline-flex mt-8 rounded-full bg-white px-7 py-3.5 text-sm font-label text-blue" data-cursor>Book a service</Link>
        </div>
      </section>
    </main>
  )
}
