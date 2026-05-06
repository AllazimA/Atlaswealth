import Navbar from '@/components/lavish/Navbar'
import Footer from '@/components/lavish/Footer'
import LoadingScreen from '@/components/lavish/LoadingScreen'
import HeroSection from '@/components/lavish/HeroSection'
import AboutSection from '@/components/lavish/AboutSection'
import StatsSection from '@/components/lavish/StatsSection'
import ServicesSection from '@/components/lavish/ServicesSection'
import WhyUsSection from '@/components/lavish/WhyUsSection'
import ExperiencesSection from '@/components/lavish/ExperiencesSection'
import Testimonials from '@/components/lavish/Testimonials'
import TrustedPartners from '@/components/lavish/TrustedPartners'
import CTASection from '@/components/lavish/CTASection'

export default function LavishMoroccoHome() {
  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <StatsSection />
        <ServicesSection />
        <WhyUsSection />
        <ExperiencesSection />
        <Testimonials />
        <TrustedPartners />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
