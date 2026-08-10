import logo from '../assets/images/logo.png'
import { homepageMedia } from '../data/homepageMedia.js'

export default function About() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <section className="pt-28 md:pt-36 pb-20 md:pb-28">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11">
          <div className="max-w-4xl">
            <p className="eyebrow">ABOUT VISO</p>
            <h1 className="mt-4 text-[clamp(3rem,7vw,6.5rem)] leading-[.92] tracking-[-.055em] font-display">
              Car care that
              <span className="block text-blue">comes to you.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl leading-8 text-ink/65">
              Viso Mobile Auto Care was built around a simple idea: getting your car
              serviced should fit into your day, not take over it.
            </p>
          </div>

          <div className="mt-14 md:mt-20 grid md:grid-cols-[1.4fr_.6fr] gap-5">
            <div className="overflow-hidden rounded-[2rem] bg-navy min-h-[360px] md:min-h-[560px]">
              <img
                src={homepageMedia.mobileCare}
                alt="Technician working on a vehicle"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="rounded-[2rem] border border-line bg-soft p-7 md:p-10 flex flex-col justify-between">
              <img src={logo} alt="VISO" className="h-11 w-auto object-contain object-left" />
              <div>
                <p className="eyebrow">OUR APPROACH</p>
                <h2 className="mt-3 text-3xl md:text-4xl tracking-[-.035em] font-display">
                  Professional care. Less disruption.
                </h2>
                <p className="mt-5 leading-7 text-ink/60">
                  We bring practical, professional automotive service to where your
                  vehicle already is. That means less waiting around, clearer
                  communication, and a more convenient way to keep your car moving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-navy text-white">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[.22em] uppercase text-white/50">WHY WE EXIST</p>
            <h2 className="mt-5 text-[clamp(2.5rem,5vw,5rem)] leading-[.95] tracking-[-.045em] font-display">
              Your time matters as much as your vehicle.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
              Traditional car care can mean rearranging your schedule, driving to a
              shop, waiting for an opening, and losing hours you could have spent
              elsewhere. Viso is designed to remove as much of that friction as
              possible.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10">
            {[
              ['01', 'Convenience first', 'We meet you where the vehicle is, making routine care easier to fit into real life.'],
              ['02', 'Straightforward service', 'Clear expectations, practical communication, and no need to make car care feel complicated.'],
              ['03', 'People over process', 'The technology supports the experience. The goal is still simple: take good care of people and their vehicles.'],
            ].map(([number, title, text]) => (
              <div key={number} className="bg-navy p-7 md:p-9">
                <span className="text-xs tracking-[.18em] text-white/35">{number}</span>
                <h3 className="mt-16 text-2xl font-display tracking-[-.02em]">{title}</h3>
                <p className="mt-4 leading-7 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <p className="eyebrow">THE VISO PROMISE</p>
            <h2 className="mt-4 text-[clamp(2.5rem,5vw,4.8rem)] leading-[.96] tracking-[-.045em] font-display">
              Better car care,
              <span className="block text-blue">without the detour.</span>
            </h2>
          </div>

          <div className="space-y-7 text-lg leading-8 text-ink/60">
            <p>
              Whether you need routine maintenance, diagnostics, detailing, or
              help getting a vehicle back on the road, Viso is built to make the
              experience feel simpler from the first booking to the final check.
            </p>
            <p>
              We are building a service people can trust with their vehicles and
              their schedules — one appointment at a time.
            </p>
            <a
              href="/book"
              className="inline-flex items-center justify-center rounded-full bg-blue px-6 py-3.5 text-white text-sm font-label transition-transform hover:-translate-y-0.5"
              data-cursor
            >
              Book a service
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
