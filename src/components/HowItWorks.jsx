import { homepageMedia } from '../data/homepageMedia.js'

const steps = [
  ['01', 'Choose what you need', 'Pick the service, tell us where the car is, and give us a little context.', homepageMedia.howItWorks[0]],
  ['02', 'We come to you', 'A technician heads to your driveway, office lot, or safe curbside location.', homepageMedia.howItWorks[1]],
  ['03', 'Get back to your day', 'We handle the work, keep you updated, and leave you ready to move again.', homepageMedia.howItWorks[2]],
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 md:py-28 border-t border-line">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="max-w-xl mb-12">
          <span className="text-blue text-xs font-label uppercase tracking-widest">How it works</span>
          <h2 className="text-3xl md:text-5xl font-display mt-3 tracking-tight">Car care without the <span className="text-blue">detour.</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map(([n, title, body, image]) => (
            <article key={n} className="group border border-line rounded-2xl overflow-hidden bg-white">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
              </div>
              <div className="p-6 md:p-7">
                <div className="text-blue text-xs font-label mb-3">{n}</div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
