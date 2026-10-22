import { Nav } from "@/components/sections/nav"
import { HeroSection } from "@/components/sections/hero-section"
import { ProblemSection } from "@/components/sections/problem-section"
import { DemoSection } from "@/components/sections/demo-section"
import { HowSection } from "@/components/sections/how-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { WaitlistSection } from "@/components/sections/waitlist-section"
import { Logo } from "@/components/sections/shared"

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Nav />
      <main>
        <HeroSection />
        <ProblemSection />
        <DemoSection />
        <HowSection />
        <PricingSection />
        <WaitlistSection />
      </main>
      <footer className="border-t border-white/5 bg-neutral-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10 text-sm text-neutral-500">
          <Logo />
          <span>© 2026 AgentMinder · agentminder.ai</span>
          <a href="#top" className="transition-colors hover:text-white">Back to top</a>
        </div>
      </footer>
    </div>
  )
}
