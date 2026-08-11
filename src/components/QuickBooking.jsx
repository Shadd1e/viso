import BookButton from './BookButton.jsx'

export default function QuickBooking() {
  return (
    <section className="py-10 md:py-12">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="rounded-2xl border border-line bg-white px-6 py-5 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-label text-blue mb-1.5">Need the car handled?</p>
            <h2 className="text-xl md:text-2xl font-display">Pick a service. Pick a time. We’ll come to you.</h2>
          </div>
          <BookButton primary href="/book">Start a booking →</BookButton>
        </div>
      </div>
    </section>
  )
}
