export default function ServiceArea() {
  return (
    <section className="py-24 md:py-28 border-t border-line">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="rounded-3xl bg-[#FAFAF8] border border-line p-8 md:p-12 flex flex-col md:flex-row justify-between gap-8 items-start">
          <div>
            <span className="text-blue text-xs font-label uppercase tracking-widest">Service area</span>
            <h2 className="text-3xl md:text-4xl font-display mt-3 mb-3">Wherever you park in the <span className="text-blue">Atlanta metro.</span></h2>
            <p className="text-muted max-w-xl leading-relaxed">Coverage can vary by service and technician availability. Enter your location during booking and we’ll confirm it before you commit.</p>
          </div>
          <div className="shrink-0 border border-line rounded-2xl px-5 py-4 bg-white"><div className="text-xs text-muted uppercase tracking-widest mb-1">Check at booking</div><div className="font-semibold">Your exact address →</div></div>
        </div>
      </div>
    </section>
  )
}
