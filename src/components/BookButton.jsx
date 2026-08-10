import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'

export default function BookButton({ primary, light, children, href = '#', onClick }) {
  const btn = useRef(null)

  useEffect(() => {
    const el = btn.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - r.left - r.width / 2) * 0.22)
      yTo((e.clientY - r.top - r.height / 2) * 0.32)
    }
    const leave = () => { xTo(0); yTo(0) }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])

  const className =
    'group relative isolate inline-flex items-center gap-2 px-6 py-3 rounded-lg font-label text-sm border overflow-hidden transition-colors animate-idle-pulse ' +
    (primary
      ? 'bg-blue text-white border-transparent hover:bg-blue-deep'
      : light
        ? 'bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10'
        : 'bg-transparent text-ink border-line hover:border-blue hover:text-blue')

  const sheen = (
    <>
      {/* diagonal sheen sweep on hover, replaces the old tire-skid effect */}
      <span className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
        <span className="absolute top-0 -left-1/2 h-full w-1/3 -skew-x-[20deg] bg-white/35 -translate-x-[220%] transition-transform duration-700 ease-out group-hover:translate-x-[420%]" />
      </span>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  )

  // internal route ("/book" etc.) uses client-side routing; anchors and
  // external links fall back to a plain <a>
  const isInternal = href.startsWith('/')

  if (isInternal) {
    return (
      <Link to={href} ref={btn} data-cursor onClick={onClick} className={className}>
        {sheen}
      </Link>
    )
  }

  return (
    <a href={href} ref={btn} data-cursor onClick={onClick} className={className}>
      {sheen}
    </a>
  )
}
