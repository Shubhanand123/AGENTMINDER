import { ConfettiButton } from "@/components/ui/confetti"
import { cn } from "@/lib/utils"
import { SectionHeading } from "./shared"

const PLANS = [
  { name: "Free", price: "$0", inr: "₹0", features: ["1 agent", "1,000 conversations / mo", "7-day history", "Email alerts"] },
  { name: "Starter", price: "$49", inr: "₹1,999", features: ["3 agents", "10,000 conversations / mo", "30-day history", "Slack alerts"] },
  {
    name: "Growth",
    price: "$199",
    inr: "₹7,999",
    badge: "For agencies",
    features: ["10 agents", "100,000 conversations / mo", "90-day history", "Custom risk policies, 5 seats"],
  },
  { name: "Business", price: "$599", inr: "₹24,999", features: ["Unlimited agents", "500,000 conversations / mo", "1-year history", "PII redaction, audit export, SSO"] },
]

const goToWaitlist = () => {
  window.setTimeout(() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" }), 650)
}

/** Section 5 — pricing, with confetti on the plan buttons. */
export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-white/5 bg-neutral-950 py-28 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-5">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Pay as your agents grow."
          lead="Save 20% with annual billing. Waitlist members get founding prices locked in for a year."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => {
            const featured = Boolean(p.badge)
            return (
              <article
                key={p.name}
                className={cn(
                  "flex flex-col gap-6 rounded-2xl border p-7",
                  featured
                    ? "border-emerald-400/60 bg-emerald-400/[0.06] shadow-[0_0_60px_-20px_rgba(52,211,153,0.5)]"
                    : "border-white/10 bg-white/[0.02]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                  {p.badge && (
                    <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-xs font-semibold text-emerald-950">{p.badge}</span>
                  )}
                </div>
                <div>
                  <span className="font-display text-5xl font-bold text-white">{p.price}</span>
                  {p.price !== "$0" && <span className="text-neutral-400"> / month</span>}
                  <p className="mt-1 font-mono text-xs text-neutral-500">{p.inr} / month in India</p>
                </div>
                <ul className="flex flex-col gap-2.5 text-sm text-neutral-300">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 flex-none text-emerald-400" aria-hidden="true">
                        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <ConfettiButton
                  size="lg"
                  variant={featured ? "default" : "outline"}
                  className={cn("mt-auto h-12 rounded-xl text-[15px]", !featured && "bg-transparent")}
                  options={{
                    particleCount: featured ? 120 : 60,
                    spread: featured ? 90 : 60,
                    colors: ["#34d399", "#6ee7b7", "#38bdf8", "#ffffff"],
                  }}
                  onClick={goToWaitlist}
                >
                  {p.price === "$0" ? "Start free" : `Reserve ${p.name}`}
                </ConfettiButton>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
