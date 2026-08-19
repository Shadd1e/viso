import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white pt-14 pb-8">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 font-extrabold text-lg font-label">
              <span className="w-7 h-7 rounded-md bg-blue flex items-center justify-center text-white text-sm">V</span>
              VISO
            </div>
            <p className="text-sm text-muted max-w-sm leading-relaxed mt-4">Professional auto care delivered to you. Maintenance, diagnostics, detailing, and roadside help without the shop visit.</p>
          </div>
          <div>
            <h3 className="font-label text-[10px] uppercase tracking-widest mb-4">Navigate</h3>
            <div className="space-y-2.5 text-sm text-muted">
              <Link to="/" className="block hover:text-blue transition-colors">Home</Link>
              <a href="#services" className="block hover:text-blue transition-colors">Services</a>
              <a href="#faq" className="block hover:text-blue transition-colors">FAQ</a>
              <Link to="/fleet" className="block hover:text-blue transition-colors">Fleet</Link>
            </div>
          </div>
          <div>
            <h3 className="font-label text-[10px] uppercase tracking-widest mb-4">Get started</h3>
            <p className="text-sm text-muted leading-relaxed mb-4">Atlanta, Georgia & surrounding metro.</p>
            <Link to="/book" data-cursor className="text-sm font-label text-blue hover:text-blue-deep transition-colors">Book a service →</Link>
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
