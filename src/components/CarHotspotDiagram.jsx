import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import carSvg from '../assets/car-top-down.svg'

const hotspots = [
  { top: '12%', left: '28%', title: 'Diagnostics', text: 'Full computer scan, right at the hood.' },
  { top: '46%', left: '70%', title: 'AC & Cooling', text: 'Climate systems checked and recharged.' },
  { top: '82%', left: '32%', title: 'Towing', text: "Stuck? We'll get your car to safety, fast." },
]

export default function CarHotspotDiagram({ ready }) {
  const carRef = useRef(null)
  const shadowRef = useRef(null)
  const dotsRef = useRef(null)
  const streakRefs = useRef([])

  useEffect(() => {
    if (!ready) return
    const tl = gsap.timeline({ delay: 0.45 })

    // car drives in from off-screen right, angled like it's turning into frame
    tl.set(carRef.current, { x: 340, y: -18, rotate: 9, opacity: 0 })
    tl.set(shadowRef.current, { opacity: 0, scaleX: 0.6 })
    tl.set(dotsRef.current, { opacity: 0 })
    tl.set(streakRefs.current, { opacity: 0, scaleX: 0 })

    tl.to(carRef.current, { opacity: 1, duration: 0.05 })
      .to(streakRefs.current, {
        opacity: 0.5, scaleX: 1, duration: 0.35, stagger: 0.06, ease: 'power1.out',
      }, '<')
      .to(carRef.current, {
        x: 0, y: 0, rotate: 0, duration: 1, ease: 'power3.out',
      }, '<0.05')
      .to(shadowRef.current, { opacity: 1, scaleX: 1, duration: 1, ease: 'power3.out' }, '<')
      .to(streakRefs.current, { opacity: 0, duration: 0.4, stagger: 0.04 }, '-=0.55')
      // gentle continuous idle motion so the car reads as "running", not parked
      .to(carRef.current, {
        y: -5, rotate: 0.6, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1,
      })
      .to(shadowRef.current, {
        scaleX: 0.94, opacity: 0.85, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1,
      }, '<')
      .to(dotsRef.current, { opacity: 1, duration: 0.5 }, '-=1.9')

    return () => tl.kill()
  }, [ready])

  return (
    <div className="relative w-[300px] mx-auto overflow-visible">
      {/* motion streaks the car "drives through" as it arrives */}
      <div className="absolute inset-0 flex flex-col justify-center gap-3 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => (streakRefs.current[i] = el)}
            className="h-[2px] bg-blue/40 rounded-full origin-right"
            style={{ marginLeft: `${20 + i * 14}%`, width: `${34 - i * 6}%` }}
          />
        ))}
      </div>

      <div
        ref={shadowRef}
        className="absolute left-1/2 bottom-[6%] w-[62%] h-4 -translate-x-1/2 rounded-full bg-ink/15 blur-md"
      />

      <img ref={carRef} src={carSvg} alt="Viso service vehicle, top view" className="relative w-full will-change-transform" />

      <div ref={dotsRef}>
        {hotspots.map((h, i) => (
          <div key={i} className="group absolute" style={{ top: h.top, left: h.left }}>
            <div className="relative w-4 h-4">
              <span className="absolute inset-0 rounded-full bg-blue" />
              <span className="absolute inset-0 rounded-full bg-blue animate-ping opacity-60" />
            </div>
            <div className="absolute left-6 -top-2 w-48 bg-white border border-line rounded-lg p-3.5 text-xs shadow-xl opacity-0 translate-y-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-10">
              <b className="block text-blue mb-1">{h.title}</b>
              <p className="text-muted leading-relaxed">{h.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
