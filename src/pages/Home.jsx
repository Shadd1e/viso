import Hero from '../components/Hero.jsx'
import MobileCare from '../components/MobileCare.jsx'
import Services from '../components/Services.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import WhyViso from '../components/WhyViso.jsx'
import Gallery from '../components/Gallery.jsx'
import ServiceArea from '../components/ServiceArea.jsx'
import Testimonials from '../components/Testimonials.jsx'
import FAQ from '../components/FAQ.jsx'
import FinalCTA from '../components/FinalCTA.jsx'
import TrustStrip from '../components/TrustStrip.jsx'

export default function Home({ ready }) {
  return (
    <>
      <Hero ready={ready} />
      <TrustStrip />

      <section id="what-we-do" className="scroll-mt-20">
        <MobileCare />
      </section>

      <section className="border-t border-line bg-[#F7F7F3] py-20 md:py-24">
        <div className="max-w-[1320px] mx-auto px-6 md:px-11 grid md:grid-cols-[.8fr_1.2fr] gap-10 items-start">
          <div>
            <span className="text-blue text-xs font-label uppercase tracking-widest">The Viso promise</span>
            <h2 className="text-3xl md:text-5xl font-display mt-3 tracking-tight">Car care should fit <span className="text-blue">your life.</span></h2>
          </div>
          <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl">We bring the technician to the place your car already is. That means less rearranging, clearer decisions, and a service experience designed around your day — not around a waiting room.</p>
        </div>
      </section>

      <Services />
      <HowItWorks />
      <WhyViso />
      <Gallery />
      <ServiceArea />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  )
}
