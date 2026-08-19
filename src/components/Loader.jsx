import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import carSvg from '../assets/car-top-down.svg'
import logo from '../assets/images/logo.png'

export default function Loader({ onDone }) {
  const [pct, setPct] = useState(0)
  const carRef = useRef(null)
  const skidRef = useRef(null)
  const trackRef = useRef(null)
  const rootRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  useEffect(() => {
    gsap.set(carRef.current, { rotation: 90, x: 0 })
    gsap.set(skidRef.current, { scaleX: 0, opacity: 0 })

    const state = { v: 0 }
    gsap.to(state, {
      v: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = Math.round(state.v)
        setPct(val)
        const trackW = trackRef.current.offsetWidth
        const carW = carRef.current.offsetWidth
        gsap.set(carRef.current, { x: (state.v / 100) * (trackW - carW) })
      },
      onComplete: () => {
        const tl = gsap.timeline({ onComplete: onDone })
        // quick skid as it "arrives" at 100%
        tl.to(skidRef.current, { scaleX: 1, opacity: 0.55, duration: 0.18, ease: 'power1.out' })
          .to(skidRef.current, { opacity: 0, duration: 0.35, delay: 0.1 })
          // car keeps driving right off the loader, straight into the hero's entrance
          .to(carRef.current, { x: '+=90', duration: 0.6, ease: 'power2.in' }, '<')
          .to(rootRef.current, { opacity: 0, duration: 0.25 }, '-=0.3')
          // tiny unlatch flick, then both doors swing open on their hinges
          .to([leftRef.current, rightRef.current], { rotateY: (i) => (i === 0 ? 4 : -4), duration: 0.08, ease: 'power1.out' }, '-=0.1')
          .to(leftRef.current, { rotateY: -108, duration: 0.5, ease: 'power2.in' })
          .to(rightRef.current, { rotateY: 108, duration: 0.5, ease: 'power2.in' }, '<')
      },
    })
  }, [onDone])

  return (
    <>
      <div className="fixed inset-0 z-[9000] flex" style={{ perspective: '1500px' }}>
        <div
          ref={leftRef}
          className="relative w-1/2 h-full bg-ink"
          style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
        >
          <div className="absolute top-0 bottom-0 right-6 w-px bg-white/10" />
          <div className="absolute right-9 top-1/2 -translate-y-1/2 w-1.5 h-14 rounded-full bg-blue" />
        </div>
        <div
          ref={rightRef}
          className="relative w-1/2 h-full bg-ink"
          style={{ transformOrigin: 'right center', backfaceVisibility: 'hidden' }}
        >
          <div className="absolute top-0 bottom-0 left-6 w-px bg-white/10" />
          <div className="absolute left-9 top-1/2 -translate-y-1/2 w-1.5 h-14 rounded-full bg-blue" />
        </div>
      </div>
      <div ref={rootRef} className="fixed inset-0 z-[9001] flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <div className="mb-9 inline-flex items-center justify-center rounded-xl bg-white/95 px-5 py-3 shadow-2xl shadow-black/20">
            <img src={logo} alt="VISO Mobile Auto Care" className="h-14 w-auto object-contain" />
          </div>

          <div ref={trackRef} className="relative w-64 h-8 mx-auto">
            {/* dashed lane line the car drives along */}
            <div
              className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px]"
              style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.45) 0 8px, transparent 8px 14px)', backgroundSize: '14px 2px', backgroundRepeat: 'repeat-x' }}
            />
            {/* skid mark, flashes on arrival */}
            <div ref={skidRef} className="absolute left-1 bottom-0.5 w-6 h-[3px] bg-ink/70 rounded origin-left" />
            <img
              ref={carRef}
              src={carSvg}
              alt=""
              className="absolute top-1/2 left-0 w-8 h-8 -translate-y-1/2 will-change-transform"
              style={{ transformOrigin: 'center' }}
            />
          </div>

          <div className="mt-5 text-sm text-white/75 tabular-nums">Bringing the shop to you — {pct}%</div>
        </div>
      </div>
    </>
  )
}
