import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import carSvg from '../assets/car-top-down.svg'

// Real, functional quick-links that live in the car's lane. These are actual
// interactive elements (not decoration) — Matter.js only ever touches these,
// never page copy. The old letter-physics "OUR SERVICES" concept is gone.
const LANE_LINKS = [
  { label: 'Diagnostics', href: '#services', lane: 0.32 },
  { label: 'AC & Cooling', href: '#services', lane: 0.55 },
  { label: 'Towing', href: '#services', lane: 0.75 },
]

const CAR_LEN = 210
const CAR_WID = 100
const PIN_VH = 2.6 // scroll distance (in viewport heights) the section stays pinned for
const MAX_TRAIL = 4000

export default function CarTransition({ onProgress }) {
  const wrapperRef = useRef(null)
  const stickyRef = useRef(null)
  const canvasRef = useRef(null)
  const linkRefs = useRef([])
  const progressLabelRef = useRef(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const sticky = stickyRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let W = 0, H = 0
    const sizeCanvas = () => {
      W = sticky.clientWidth
      H = sticky.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    sizeCanvas()

    // ---------- Matter world: only the real lane buttons are simulated ----------
    const { Engine, World, Bodies, Body } = Matter
    const engine = Engine.create()
    engine.gravity.x = 0
    engine.gravity.y = 0
    const world = engine.world

    let bounds = []
    const buildBounds = () => {
      World.remove(world, bounds)
      const t = 80
      bounds = [
        Bodies.rectangle(W / 2, -t / 2, W * 2, t, { isStatic: true }),
        Bodies.rectangle(W / 2, H + t / 2, W * 2, t, { isStatic: true }),
      ]
      World.add(world, bounds)
    }
    buildBounds()

    // car: kinematic — position comes directly from scroll progress every frame,
    // never from the engine. It still participates in collisions so it can push
    // the lane buttons, but it is never pushed back.
    const car = Bodies.rectangle(W + CAR_LEN, H / 2, CAR_LEN, CAR_WID, {
      friction: 0, frictionAir: 0, restitution: 0,
    })
    Body.setInertia(car, Infinity)
    World.add(world, car)
    let lastCarX = car.position.x

    // lane buttons: dynamic bodies synced 1:1 to the real DOM <a> elements
    const laneOrigin = (i) => ({ x: W * LANE_LINKS[i].lane, y: H * 0.5 + (i % 2 === 0 ? -70 : 70) })
    const linkBodies = LANE_LINKS.map((link, i) => {
      const el = linkRefs.current[i]
      const w = el?.offsetWidth || 140
      const h = el?.offsetHeight || 44
      const origin = laneOrigin(i)
      const body = Bodies.rectangle(origin.x, origin.y, w, h, {
        friction: 0.35, frictionAir: 0.12, restitution: 0.22, density: 0.0016,
      })
      World.add(world, body)
      if (el) { el._origX = origin.x; el._origY = origin.y }
      return { body, el, origin, w, h }
    })

    // ---------- tire marks: persistent trail, locally faded near lane buttons ----------
    let trail = [] // { x, y, faded }  in canvas space
    const nearAnyButton = (x, y) => {
      const pad = 18
      return linkBodies.some(({ body, w, h }) => {
        const dx = Math.abs(x - body.position.x)
        const dy = Math.abs(y - body.position.y)
        return dx < w / 2 + pad && dy < h / 2 + pad
      })
    }

    // ---------- car art ----------
    const carImg = new window.Image()
    carImg.src = carSvg

    // rear tire contact points, relative to car center, in the car's *local* frame
    // (computed once art loads; car is drawn nose-left, so the tail/rear is at +x)
    const tireOffsets = () => {
      if (!carImg.complete || carImg.naturalWidth === 0) return null
      const scale = CAR_LEN / carImg.naturalHeight
      const drawW = carImg.naturalWidth * scale
      const drawH = carImg.naturalHeight * scale
      return { rear: drawH * 0.42, track: drawW * 0.3, drawW, drawH }
    }

    const drawCar = (x, y) => {
      const dims = tireOffsets()
      if (!dims) return
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-Math.PI / 2) // portrait asset -> pointing left (direction of travel)
      ctx.drawImage(carImg, -dims.drawW / 2, -dims.drawH / 2, dims.drawW, dims.drawH)
      ctx.restore()
    }

    // ---------- scroll-driven progress ----------
    let progress = 0
    let urlIsServices = false
    const RESET_MARGIN = 40 // how far the car must back off past a button before it re-arms

    const applyProgress = (p) => {
      progress = p
      const startX = W + CAR_LEN
      const endX = -CAR_LEN
      const x = startX + (endX - startX) * p
      const dx = x - lastCarX
      Body.setPosition(car, { x, y: H / 2 })
      Body.setVelocity(car, { x: dx, y: 0 })
      lastCarX = x

      Engine.update(engine, 16.667)

      // lay tire marks while the car is actually on-stage
      const dims = tireOffsets()
      if (dims && p > 0.001 && p < 0.999) {
        const rearX = x + dims.rear
        trail.push({ x: rearX, y: H / 2 - dims.track, faded: nearAnyButton(rearX, H / 2 - dims.track) })
        trail.push({ x: rearX, y: H / 2 + dims.track, faded: nearAnyButton(rearX, H / 2 + dims.track) })
        if (trail.length > MAX_TRAIL) trail.splice(0, trail.length - MAX_TRAIL)
      }

      // re-arm any lane button the car has fully backed away from (keeps this reversible)
      linkBodies.forEach(({ body, origin }) => {
        if (car.position.x > origin.x + CAR_LEN / 2 + RESET_MARGIN) {
          Body.setPosition(body, origin)
          Body.setAngle(body, 0)
          Body.setVelocity(body, { x: 0, y: 0 })
          Body.setAngularVelocity(body, 0)
        }
      })

      // sync real DOM buttons to their physics bodies
      linkBodies.forEach(({ body, el }) => {
        if (!el) return
        const dxEl = body.position.x - el._origX
        const dyEl = body.position.y - el._origY
        el.style.transform = `translate(-50%, -50%) translate(${dxEl}px, ${dyEl}px) rotate(${body.angle}rad)`
      })

      // cosmetic URL handoff — no navigation, no remount
      const shouldBeServices = p > 0.985
      if (shouldBeServices !== urlIsServices) {
        urlIsServices = shouldBeServices
        window.history.replaceState(window.history.state, '', shouldBeServices ? '/services' : '/')
      }

      if (progressLabelRef.current) progressLabelRef.current.textContent = Math.round(p * 100) + '%'
      onProgress?.(p)
    }

    let rafId
    const render = () => {
      ctx.clearRect(0, 0, W, H)

      trail.forEach((pt) => {
        ctx.fillStyle = pt.faded ? 'rgba(11,11,20,0.10)' : 'rgba(11,11,20,0.34)'
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2)
        ctx.fill()
      })

      if (progress > 0.001 && progress < 0.999) drawCar(car.position.x, H / 2)

      rafId = requestAnimationFrame(render)
    }
    render()

    // ---------- scroll listener (drives everything; no timers, no autoplay) ----------
    let ticking = false
    const measure = () => {
      ticking = false
      const rect = wrapper.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const raw = total > 0 ? -rect.top / total : 0
      applyProgress(Math.min(1, Math.max(0, raw)))
    }
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(measure) }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    measure()

    const onResize = () => {
      sizeCanvas()
      buildBounds()
      linkBodies.forEach(({ body, origin, el }, i) => {
        const newOrigin = laneOrigin(i)
        origin.x = newOrigin.x
        origin.y = newOrigin.y
        if (el) { el._origX = newOrigin.x; el._origY = newOrigin.y }
        Body.setPosition(body, newOrigin)
        Body.setAngle(body, 0)
      })
      measure()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      Engine.clear(engine)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      ref={wrapperRef}
      className="relative"
      style={{ height: `${PIN_VH * 100}vh` }}
      aria-label="Car driving through to Services"
    >
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden bg-white">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {LANE_LINKS.map((link, i) => (
          <a
            key={link.label}
            ref={(el) => (linkRefs.current[i] = el)}
            href={link.href}
            data-cursor
            className="absolute z-10 px-5 py-2.5 rounded-full border border-line bg-white/95 backdrop-blur-sm text-sm font-label text-ink shadow-sm hover:border-blue hover:text-blue will-change-transform"
            style={{
              left: `${link.lane * 100}%`,
              top: i % 2 === 0 ? 'calc(50% - 70px)' : 'calc(50% + 70px)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {link.label}
          </a>
        ))}

        <div className="absolute top-4 left-6 md:left-11 z-10 text-[11px] uppercase tracking-wider font-label text-muted">
          Scroll to drive through
        </div>
        <div ref={progressLabelRef} className="absolute top-4 right-6 md:right-11 z-10 text-[11px] font-label text-muted tabular-nums">
          0%
        </div>
      </div>
    </section>
  )
}
