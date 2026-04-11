import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ScrollAnimations from '@/components/effects/ScrollAnimations'
import HeroSceneWrapper from '@/components/scenes/HeroSceneWrapper'
import HeroSection from '@/components/sections/HeroSection'
import ProblemSection from '@/components/sections/ProblemSection'
import TransformSection from '@/components/sections/TransformSection'
import DemoSection from '@/components/sections/DemoSection'
import CurriculumSection from '@/components/sections/CurriculumSection'
import PricingSection from '@/components/sections/PricingSection'
import SubscriptionsSection from '@/components/sections/SubscriptionsSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import LeadMagnetSection from '@/components/sections/LeadMagnetSection'
import FAQSection from '@/components/sections/FAQSection'
import ObjectionSection from '@/components/sections/ObjectionSection'
import FinalCTASection from '@/components/sections/FinalCTASection'

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />

      {/* ── DARK ZONE: Hero, Problem, Transform, Demo ── */}
      <div id="dark-zone" className="relative text-[#F1F5F9]">
        <div className="aurora-container">
          <div className="aurora-lime" />
          <div className="aurora-cyan" />
        </div>
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
          <HeroSceneWrapper />
        </div>

        <HeroSection />
        <ProblemSection />
        <TransformSection />
        <DemoSection />
      </div>

      {/* ── LIGHT ZONE: Curriculum, Pricing, Subscriptions, etc. ── */}
      <div id="light-zone" className="relative bg-ivory text-obsidian circuit-bg">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-obsidian to-transparent z-10 pointer-events-none" />

        <CurriculumSection />
        <PricingSection />
        <SubscriptionsSection />
        <TestimonialsSection />
        <LeadMagnetSection />
        <FAQSection />
        <ObjectionSection />
      </div>

      {/* ── FINAL DARK ZONE: Countdown + CTA ── */}
      <div id="final-dark" className="relative bg-obsidian text-white overflow-hidden">
        <div className="aurora-container">
          <div className="aurora-lime" style={{ top: '-30%', left: '10%' }} />
          <div className="aurora-cyan" style={{ top: '0', right: '-30%' }} />
        </div>

        <FinalCTASection />
      </div>

      <Footer />
    </>
  )
}
