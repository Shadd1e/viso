const trust = ['Certified technicians', 'On-site service', 'Clear estimates']

export default function TrustStrip() {
  return (
    <section className="border-y border-line bg-[#FAFAF8]">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11 py-4 flex flex-wrap justify-center md:justify-between gap-x-8 gap-y-3 text-[12px] font-label uppercase tracking-widest text-muted">
        {trust.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  )
}
