import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  const ring = useRef(null)
  const dot = useRef(null)
  const glow = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined

    const pos = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    const glowPos = { x: -100, y: -100 }
    let inside = false

    const setTransform = (el, x, y) => {
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.22
      ringPos.y += (pos.y - ringPos.y) * 0.22
      glowPos.x += (pos.x - glowPos.x) * 0.10
      glowPos.y += (pos.y - glowPos.y) * 0.10

      setTransform(dot.current, pos.x, pos.y)
      setTransform(ring.current, ringPos.x, ringPos.y)
      setTransform(glow.current, glowPos.x, glowPos.y)
    }

    const show = () => {
      if (inside) return
      inside = true
      ring.current?.classList.add('cursor-visible')
      dot.current?.classList.add('cursor-visible')
      glow.current?.classList.add('cursor-visible')
    }

    const move = (event) => {
      pos.x = event.clientX
      pos.y = event.clientY
      show()
    }

    const leave = () => {
      inside = false
      ring.current?.classList.remove('cursor-visible')
      dot.current?.classList.remove('cursor-visible')
      glow.current?.classList.remove('cursor-visible')
      ring.current?.classList.remove('cursor-hover')
    }

    const overTarget = (event) => {
      if (event.target.closest('a, button, [data-cursor]')) {
        ring.current?.classList.add('cursor-hover')
      }
    }

    const outTarget = (event) => {
      if (event.target.closest('a, button, [data-cursor]')) {
        ring.current?.classList.remove('cursor-hover')
      }
    }

    gsap.ticker.add(tick)
    window.addEventListener('mousemove', move, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    document.addEventListener('mouseover', overTarget)
    document.addEventListener('mouseout', outTarget)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('mousemove', move)
      document.documentElement.removeEventListener('mouseleave', leave)
      document.removeEventListener('mouseover', overTarget)
      document.removeEventListener('mouseout', outTarget)
    }
  }, [])

  return (
    <>
      <div ref={glow} className="viso-cursor-glow" aria-hidden="true" />
      <div ref={ring} className="viso-cursor-ring" aria-hidden="true" />
      <div ref={dot} className="viso-cursor-dot" aria-hidden="true" />
    </>
  )
}
