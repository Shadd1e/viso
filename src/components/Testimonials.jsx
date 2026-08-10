import { motion } from 'framer-motion'
import { testimonialAvatars } from '../data/homepageMedia.js'

const items = [
  ['Patrick Maxwell', '★★★★★', 'The tech showed up on time and had my brakes done before I finished my coffee. Didn\'t think mobile could feel this dialed in.'],
  ['Dana Whitfield', '★★★★★', 'Booked at 9pm, had a technician at my office by 11am. The kind of service you tell your coworkers about.'],
  ['Marcus Reyes', '★★★★☆', 'Towing saved me on a Sunday night. Fast, no attitude, fair price. Would book again in a heartbeat.'],
  ['Priya Anand', '★★★★★', 'AC repair without giving up my whole Saturday. This is how car care should\'ve always worked.'],
]

export default function Testimonials() {
  return (
    <section className="py-24 md:py-28 border-t border-line">
      <div className="max-w-[1320px] mx-auto px-6 md:px-11">
        <div className="flex justify-between items-end gap-8 mb-10"><div><span className="text-blue text-xs font-label uppercase tracking-widest">Customer stories</span><h2 className="text-3xl md:text-5xl font-display mt-3 tracking-tight">From our <span className="text-blue">community.</span></h2></div><p className="hidden md:block text-muted text-sm max-w-xs">The best part of mobile care is getting your time back.</p></div>
        <div className="overflow-hidden cursor-grab active:cursor-grabbing">
          <motion.div className="flex gap-5 w-max" drag="x" dragConstraints={{ left: -((340 + 20) * (items.length - 1)), right: 0 }} dragElastic={0.15} dragTransition={{ bounceStiffness: 300, bounceDamping: 24 }}>
            {items.map(([n, s, q], i) => <div key={i} className="w-[340px] shrink-0 border border-line rounded-2xl p-7 select-none bg-[#FAFAF8]"><div className="text-blue mb-4 text-sm tracking-widest">{s}</div><p className="text-[15px] leading-relaxed mb-5">&ldquo;{q}&rdquo;</p><div className="flex items-center gap-3"><img src={testimonialAvatars[i % testimonialAvatars.length]} alt="" loading="lazy" className="w-9 h-9 rounded-full object-cover" /><div><div className="font-semibold text-sm">{n}</div><div className="text-xs text-muted">Verified Customer</div></div></div></div>)}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
