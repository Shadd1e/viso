import Hero from '../components/Hero.jsx'
import TrustStrip from '../components/TrustStrip.jsx'
import QuickBooking from '../components/QuickBooking.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Services from '../components/Services.jsx'
import MobileCare from '../components/MobileCare.jsx'
import NavyFeature from '../components/NavyFeature.jsx'
import CarCare from '../components/CarCare.jsx'
import Gallery from '../components/Gallery.jsx'
import WhyViso from '../components/WhyViso.jsx'
import FleetPreview from '../components/FleetPreview.jsx'
import ServiceArea from '../components/ServiceArea.jsx'
import Testimonials from '../components/Testimonials.jsx'
import FAQ from '../components/FAQ.jsx'
import FinalCTA from '../components/FinalCTA.jsx'

export default function Home({ ready }) {
  return (
    <>
      <Hero ready={ready} />
      <TrustStrip />
      <QuickBooking />
      <HowItWorks />
      <Services />
      <MobileCare />
      <NavyFeature />
      <CarCare />
      <Gallery />
      <WhyViso />
      <FleetPreview />
      <ServiceArea />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  )
}
