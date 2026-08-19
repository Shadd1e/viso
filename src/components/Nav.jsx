import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/images/logo.png'
import BookButton from './BookButton.jsx'

const links = [
  { label: 'What We Do', href: '/#what-we-do' },
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About Us', href: '/about', route: true },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Become a Technician', href: '/technicians/apply', route: true },
  { label: 'My Account', href: '/account', route: true },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname, location.hash])

  return (
    <nav className="fixed top-0 left-0 right-0 z-[500] border-b border-line/80 bg-white/90 backdrop-blur-xl">
      <div className="max-w-[1320px] mx-auto px-5 md:px-11 h-[68px] flex items-center justify-between gap-6">
        <Link to="/" aria-label="Viso Mobile Autocare home" className="group flex items-center shrink-0" data-cursor>
          <img src={logo} alt="Viso Mobile Autocare" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-[13px] font-label">
          {links.map((link) => {
            const className = 'group relative py-2 text-ink/70 transition-colors duration-200 hover:text-blue'
            return link.route ? (
              <Link key={link.label} to={link.href} data-cursor className={className}>
                {link.label}
                <span className="absolute left-0 -bottom-0.5 h-px w-full origin-left scale-x-0 bg-blue transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ) : (
              <a key={link.label} href={link.href} data-cursor className={className}>
                {link.label}
                <span className="absolute left-0 -bottom-0.5 h-px w-full origin-left scale-x-0 bg-blue transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            )
          })}
        </div>

        <div className="hidden lg:block shrink-0">
          <BookButton primary href="/book">Book Service</BookButton>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden relative z-[510] grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink"
        >
          <span className="sr-only">Menu</span>
          <span className="relative block h-4 w-5">
            <span className={`absolute left-0 top-0 h-px w-5 bg-current transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`absolute left-0 top-2 h-px w-5 bg-current transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute left-0 top-4 h-px w-5 bg-current transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </span>
        </button>
      </div>

      <div className={`lg:hidden overflow-hidden border-t border-line bg-paper transition-[max-height,opacity] duration-300 ${open ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="max-w-[1320px] mx-auto px-5 py-5">
          <div className="grid gap-1">
            {links.map((link, index) => (
              link.route ? (
                <Link key={link.label} to={link.href} className="flex items-center justify-between rounded-2xl px-4 py-4 text-lg font-display hover:bg-white" data-cursor>
                  <span>{link.label}</span><span className="text-blue">0{index + 1}</span>
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="flex items-center justify-between rounded-2xl px-4 py-4 text-lg font-display hover:bg-white" data-cursor>
                  <span>{link.label}</span><span className="text-blue">0{index + 1}</span>
                </a>
              )
            ))}
          </div>
          <Link to="/book" className="mt-3 flex items-center justify-between rounded-2xl bg-blue px-5 py-4 text-sm font-label text-white" data-cursor>
            <span>Book Service</span><span>→</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
