import { HeroSection } from "@/components/sections/hero-section"
import { ProblemSection } from "@/components/sections/problem-section"
import { AgentsSection } from "@/components/sections/agents-section"
import { DemoSection } from "@/components/sections/demo-section"
import { HowSection } from "@/components/sections/how-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { WaitlistSection } from "@/components/sections/waitlist-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <AgentsSection />
      <DemoSection />
      <HowSection />
      <PricingSection />
      <WaitlistSection />
    </>
  )
}
