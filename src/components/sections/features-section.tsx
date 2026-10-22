import { Link } from "react-router-dom"
import { FeatureGrid } from "@/components/features/feature-grid"
import { SectionHeading } from "./shared"

/** Home: the first four features, with a link to the full features page. */
export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-white/5 bg-neutral-950 py-28 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5">
        <SectionHeading
          eyebrow="What you get"
          title="Built for owners, not engineers."
          lead="Every feature answers a plain question: what did my bot say, what did it cost, and what should I fix? Click a card to open it."
        />
        <FeatureGrid limit={4} />
        <Link to="/features" className="inline-flex min-h-12 items-center gap-2 self-start rounded-full px-6 font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/10">
          See all 10 features <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
