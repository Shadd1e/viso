import { Link } from 'react-router-dom'
import logo from '../assets/images/logo.png'

export default function Footer() {
  return (
    <footer className="bg-[#171823] py-12 text-white">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-7 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              aria-label="Viso Mobile Autocare"
              className="inline-flex items-center"
            >
              <img
                src={logo}
                alt="Viso Mobile Autocare"
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 max-w-[390px] text-sm leading-6 text-white/45">
              Professional mobile auto care designed around your vehicle,
              your location and your schedule.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-white/30">
              Explore
            </p>

            <div className="mt-4 space-y-3 text-sm text-white/60">
              <a href="/#services" className="block hover:text-white">
                Services
              </a>
              <a href="/#how-it-works" className="block hover:text-white">
                How It Works
              </a>
              <Link to="/about" className="block hover:text-white">
                About
              </Link>
              <a href="/#faq" className="block hover:text-white">
                FAQ
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-white/30">
              Get started
            </p>

            <div className="mt-4 space-y-3 text-sm text-white/60">
              <Link to="/book" className="block hover:text-white">
                Book a Service
              </Link>
              <span className="block">
                Technician applications — Coming soon
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Viso Mobile Autocare. All rights reserved.
          </span>

          <span>
            Developed by GoddyWhyte Technologies
          </span>
        </div>
      </div>
    </footer>
  )
}
