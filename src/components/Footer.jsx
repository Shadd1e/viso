import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white pt-16 pb-8">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_.7fr_.8fr] pb-14">
          <div>
            <div className="flex items-center gap-3 font-label text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-white text-sm">V</span>
              <span>Viso Mobile Autocare</span>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted">
              Mobile automotive care for the moments when taking your car to a shop simply does not fit the day.
              Viso brings maintenance, diagnostics, detailing, and roadside help to where your vehicle already is.
            </p>
            <p className="mt-5 text-xs uppercase tracking-[.18em] text-ink/40">Atlanta, Georgia & surrounding metro</p>
          </div>

          <div>
            <h3 className="font-label text-[10px] uppercase tracking-widest mb-4">Explore</h3>
            <div className="space-y-3 text-sm text-muted">
              <a href="/#what-we-do" className="block hover:text-blue transition-colors">What We Do</a>
              <a href="/#services" className="block hover:text-blue transition-colors">Services</a>
              <a href="/#how-it-works" className="block hover:text-blue transition-colors">How It Works</a>
              <Link to="/about" className="block hover:text-blue transition-colors">About Us</Link>
              <a href="/#faq" className="block hover:text-blue transition-colors">FAQ</a>
            </div>
          </div>

          <div>
            <h3 className="font-label text-[10px] uppercase tracking-widest mb-4">For business</h3>
            <div className="space-y-3 text-sm text-muted">
              <Link to="/fleet" className="block hover:text-blue transition-colors">Fleet Care</Link>
              <Link to="/book" className="block hover:text-blue transition-colors">Book a Service</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between text-[11px] text-muted">
          <span>© 2026 Viso Mobile Autocare. All rights reserved.</span>
          <span>Developed by GoddyWhyte Technologies</span>
        </div>
      </div>
    </footer>
  )
}
