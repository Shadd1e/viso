import { Link } from 'react-router-dom'

export default function MobileCTA() {
  return (
    <div className="fixed md:hidden bottom-3 left-3 right-3 z-[450] rounded-2xl border border-white/10 bg-ink/95 backdrop-blur-lg shadow-2xl px-4 py-3 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="font-label text-[10px] uppercase tracking-wider text-white">Need auto service?</div>
        <div className="text-[11px] text-white/55 mt-0.5">We come to you.</div>
      </div>
      <Link to="/book" data-cursor className="shrink-0 rounded-lg bg-blue text-white px-4 py-2.5 text-xs font-label hover:bg-blue-deep transition-colors">Book Now →</Link>
    </div>
  )
}
