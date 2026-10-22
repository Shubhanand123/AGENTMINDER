import { Link } from "react-router-dom"
import { Page, PageHeader, GradientText } from "@/components/site/motion"
import { FeatureGrid } from "@/components/features/feature-grid"

export default function FeaturesPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Features"
        title="Everything you need to trust your AI agent."
        lead="Ten features, one job: tell you what your bot said, what it cost and what to fix. Open any card to see how it works and which plan includes it."
      />
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <FeatureGrid />
      </section>
      <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 pb-32">
        <p className="font-display text-3xl font-bold text-white">
          Pick the features you need. <GradientText>Start free.</GradientText>
        </p>
        <Link to="/pricing" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-semibold text-neutral-950 transition-transform hover:scale-105">
          See pricing
        </Link>
      </section>
    </Page>
  )
}
