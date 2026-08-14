import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/images/logo.png'

const links = [
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/#faq' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-[500] border-b border-[#e8e8ed]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-7 lg:px-10">

          <Link
            to="/"
            onClick={close}
            aria-label="Viso Mobile Autocare home"
            className="flex shrink-0 items-center"
          >
            <img
              src={logo}
              alt="Viso Mobile Autocare"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative py-2 text-[14px] font-medium text-[#4b4c5b] transition hover:text-[#3531a4]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/book"
              className="rounded-full bg-[#3531a4] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#29267f]"
            >
              Book a Service
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#dedee7] bg-white text-[#28293c] md:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-[2px] w-5 rounded-full bg-current transition ${
                  open ? 'translate-y-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-[2px] w-5 rounded-full bg-current transition ${
                  open ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-[2px] w-5 rounded-full bg-current transition ${
                  open ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>
        </div>

        {/* Mobile navigation */}
        <div
          className={`overflow-hidden border-t border-[#eeeeF2] bg-white transition-all duration-300 md:hidden ${
            open ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mx-auto max-w-[1280px] px-5 pb-6 pt-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={close}
                className="block border-b border-[#eeeeF2] py-4 text-[16px] font-medium text-[#303143]"
              >
                {link.label}
              </a>
            ))}

            <Link
              to="/book"
              onClick={close}
              className="mt-5 block rounded-full bg-[#3531a4] px-5 py-3.5 text-center text-[15px] font-semibold text-white"
            >
              Book a Service
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}