import { etaMinutes } from '../lib/geo.js'

// Shown before payment. On purpose this is NOT a live map — just a minutes-
// away estimate — so the technician's real-time position is only exposed
// once the booking is actually paid for.
export default function EtaPreview({ distance }) {
  const eta = etaMinutes(distance)
  return (
    <div className="p-5 rounded-xl border border-line flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="text-sm font-bold">Nearest available technician</div>
        <div className="text-xs text-muted mt-0.5">
          Live map unlocks once your booking is paid for.
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-blue leading-none">~{eta} min</div>
        <div className="text-xs text-muted mt-1">away right now</div>
      </div>
    </div>
  )
}
