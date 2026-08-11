import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import BookButton from './BookButton.jsx'
import CarHotspotDiagram from './CarHotspotDiagram.jsx'

export default function Hero({ ready }) {
  const titleRef = useRef(null)
  const statRefs = useRef([])

  useEffect(() => {
    if (!ready) return
    const words = titleRef.current.querySelectorAll('.word')
    gsap.set(words, { yPercent: 120 })
    gsap.to(words, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.12, delay: 0.15 })
    gsap.from('.eyebrow', { opacity: 0, y: 10, duration: 0.7, delay: 0.05 })
    gsap.from('.hero-sub', { opacity: 0, y: 14, duration: 0.8, delay: 0.75 })
    gsap.from('.hero-actions', { opacity: 0, y: 14, duration: 0.8, delay: 0.9 })
    gsap.from('.hero-visual', { opacity: 0, x: 26, duration: 1, delay: 0.5, ease: 'power3.out' })

    const obj = { done: false }
    gsap.delayedCall(1.4, () => {
      statRefs.current.forEach((el) => {
        const target = parseInt(el.dataset.n, 10)
        const counter = { v: 0 }
        gsap.to(counter, {
          v: target, duration: 1.2, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(counter.v) + (el.dataset.suffix || '') },
        })
      })
    })
  }, [ready])

  return (
    <section className="pt-14 min-h-screen flex items-center">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11 grid md:grid-cols-2 gap-10 items-center py-16">
        <div>
          <div className="eyebrow inline-flex items-center gap-2.5 text-[12.5px] font-semibold tracking-wider uppercase text-blue mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-blue" />
            Mobile Auto Care · Atlanta, GA
          </div>

          <h1 ref={titleRef} className="text-[38px] md:text-[64px] font-display font-normal leading-[1.06] tracking-tight mb-7">
            <span className="block overflow-hidden"><span className="word inline-block">Your Car.</span></span>
            <span className="block overflow-hidden"><span className="word inline-block">Our <span className="text-blue">Expertise</span>.</span></span>
            <span className="block overflow-hidden"><span className="word inline-block">Wherever You Are.</span></span>
          </h1>

          <p className="hero-sub text-[17px] leading-relaxed text-muted max-w-md mb-9">
            Certified technicians dispatched to your driveway, office, or curb — diagnostics to detailing,
            even a tow when things go sideways. No shop, no waiting room, no wasted afternoon.
          </p>

          <div className="hero-actions flex items-center gap-4 flex-wrap mb-11">
            <BookButton primary href="/book">Book a Service →</BookButton>
            <a href="#services" className="text-sm font-label text-ink/60 hover:text-blue transition-colors" data-cursor>See what we do</a>
          </div>

          <div className="flex gap-9 flex-wrap">
            {[
              ['12', '+', 'Years Experience'],
              ['14', '+', 'Service Types'],
              ['24', '/7', 'Dispatch Ready'],
            ].map(([n, suf, label], i) => (
              <div key={label}>
                <div ref={(el) => (statRefs.current[i] = el)} data-n={n} data-suffix={suf} className="text-[28px] font-stat font-normal text-blue">
                  0
                </div>
                <div className="text-xs text-muted mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <CarHotspotDiagram ready={ready} />
        </div>
      </div>
    </section>
  )
}
