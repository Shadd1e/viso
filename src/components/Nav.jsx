import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/images/logo.png'
import BookButton from './BookButton.jsx'

const links = [
  { label: 'What We Do', href: '/#what-we-do' },
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About Us', href: '/about', route: true },
  { label: 'FAQ', href: '/#faq' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-[500] border-b border-line backdrop-blur-md bg-white/90">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11 h-16 flex items-center justify-between gap-6">
        <Link to="/" aria-label="Viso Mobile Autocare" className="group flex items-center shrink-0" onClick={() => setOpen(false)}>
          <img src={logo} alt="Viso Mobile Autocare" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-[13px] font-label">
          {links.map((link) => {
            const className = 'group relative py-2 opacity-75 transition-colors duration-200 hover:opacity-100 hover:text-blue'
            return link.route ? (
              <Link key={link.label} to={link.href} data-cursor className={className}>
                {link.label}<span className="absolute left-0 -bottom-0.5 h-[1.5px] w-full origin-left scale-x-0 bg-blue transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ) : (
              <a key={link.label} href={link.href} data-cursor className={className}>
                {link.label}<span className="absolute left-0 -bottom-0.5 h-[1.5px] w-full origin-left scale-x-0 bg-blue transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            )
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3.5">
          <BookButton primary href="/book">Book Service</BookButton>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden w-11 h-11 rounded-xl border border-line grid place-items-center text-ink"
        >
          <span className="sr-only">Menu</span>
          <span className="space-y-1.5">
            <span className={`block h-px w-5 bg-current transition-transform ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
            <span className={`block h-px w-5 bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-5 bg-current transition-transform ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
          </span>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-line bg-white px-6 py-5 shadow-xl">
          <div className="grid gap-1">
            {links.map((link) => link.route ? (
              <Link key={link.label} to={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3.5 font-label text-sm hover:bg-[#F7F7F3]">{link.label}</Link>
            ) : (
              <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3.5 font-label text-sm hover:bg-[#F7F7F3]">{link.label}</a>
            ))}
            <Link to="/book" onClick={() => setOpen(false)} className="mt-2 rounded-xl bg-blue px-4 py-3.5 text-center font-label text-sm text-white">Book Service</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
