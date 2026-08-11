export default function QuickBooking() {
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="grid gap-5 md:grid-cols-[.8fr_1.2fr] rounded-3xl border border-line bg-white p-7 md:p-9">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-label text-blue mb-2">The Viso idea</p>
            <h2 className="text-2xl md:text-3xl font-display tracking-tight">Your car stays where it is. The service moves.</h2>
          </div>
          <p className="text-muted leading-7 max-w-2xl md:pl-8 md:border-l md:border-line">
            A routine service should not turn into a morning of traffic, drop-off logistics, and waiting rooms. Viso Mobile Autocare is built around the vehicle's real location — home, work, or another suitable place — so professional care can fit around the rest of your day.
          </p>
        </div>
      </div>
    </section>
  )
}
