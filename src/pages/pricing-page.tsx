import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ConfettiButton } from "@/components/ui/confetti"
import { Page, PageHeader, Reveal, RevealItem } from "@/components/site/motion"
import { cn } from "@/lib/utils"

type Plan = { name: string; usd: number; inr: number; badge?: string; blurb: string; features: string[] }

const PLANS: Plan[] = [
  { name: "Free", usd: 0, inr: 0, blurb: "Try it on one bot.", features: ["1 agent", "1,000 conversations / mo", "7-day history", "Email alerts"] },
  { name: "Starter", usd: 49, inr: 1999, blurb: "For a small business with a bot or two.", features: ["3 agents", "10,000 conversations / mo", "30-day history", "Slack alerts"] },
  { name: "Growth", usd: 199, inr: 7999, badge: "For agencies", blurb: "Report bot quality to every client.", features: ["10 agents", "100,000 conversations / mo", "90-day history", "Custom risk policies", "5 seats"] },
  { name: "Business", usd: 599, inr: 24999, blurb: "Many agents, stricter rules.", features: ["Unlimited agents", "500,000 conversations / mo", "1-year history", "PII redaction", "Audit export, SSO"] },
]

const FAQ = [
  ["What counts as a conversation?", "One chat or call between a customer and your agent, however many messages it has."],
  ["What happens if I go over my limit?", "Nothing breaks. Extra conversations are $5 (₹399) per 10,000, and we email you before it happens."],
  ["Do you store my customers' data?", "Only for your history window. Conversations are encrypted at rest and never used to train any model. Business plans can redact personal data before it's stored."],
  ["Can agencies bill clients separately?", "Yes. Growth and Business let you group agents by client and export a branded report for each one."],
  ["Is there a discount for paying yearly?", "Yearly billing saves 20%. Waitlist members also lock in founding prices for their first year."],
]

const COLORS = ["#818cf8", "#e879f9", "#fb923c", "#38bdf8", "#f472b6"]

function Price({ value, symbol }: { value: number; symbol: string }) {
  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="inline-block tabular-nums"
        >
          {symbol}
          {value.toLocaleString("en-IN")}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)
  const [inr, setInr] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const navigate = useNavigate()

  const amount = (p: Plan) => {
    const base = inr ? p.inr : p.usd
    return yearly ? Math.round(base * 0.8) : base
  }

  return (
    <Page>
      <PageHeader eyebrow="Pricing" title="Start free. Pay as your agents grow." lead="Every plan includes the free agent audit. Change or cancel any time.">
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { on: yearly, set: setYearly, a: "Monthly", b: "Yearly −20%", id: "billing" },
            { on: inr, set: setInr, a: "USD $", b: "INR ₹", id: "currency" },
          ].map((t) => (
            <div key={t.id} role="group" aria-label={t.id} className="relative flex rounded-full bg-white/5 p-1 ring-1 ring-white/10">
              {[t.a, t.b].map((label, i) => {
                const active = (i === 1) === t.on
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => t.set(i === 1)}
                    className={cn("relative min-h-10 rounded-full px-4 text-sm font-medium transition-colors", active ? "text-neutral-950" : "text-neutral-300 hover:text-white")}
                  >
                    {active && (
                      <motion.span
                        layoutId={`toggle-${t.id}`}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-orange-200"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative">{label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {PLANS.map((p) => {
            const featured = Boolean(p.badge)
            return (
              <RevealItem
                key={p.name}
                as="article"
                className={cn(
                  "group relative flex flex-col gap-6 overflow-hidden rounded-3xl border p-7 transition-transform duration-500 hover:-translate-y-1.5",
                  featured ? "border-transparent bg-neutral-900" : "border-white/10 bg-white/[0.02]",
                )}
              >
                {featured && (
                  <>
                    <div aria-hidden="true" className="absolute -inset-px -z-0 rounded-3xl bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-orange-300 opacity-80" />
                    <div aria-hidden="true" className="absolute inset-px rounded-[calc(1.5rem-1px)] bg-neutral-950" />
                  </>
                )}
                <div className="relative flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-white">{p.name}</h2>
                  {p.badge && <span className="rounded-full bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-orange-200 px-2.5 py-1 text-xs font-semibold text-neutral-950">{p.badge}</span>}
                </div>
                <div className="relative">
                  <span className="font-display text-5xl font-bold text-white">
                    <Price value={amount(p)} symbol={inr ? "₹" : "$"} />
                  </span>
                  {p.usd > 0 && <span className="text-neutral-400"> / month</span>}
                  <p className="mt-2 text-sm text-neutral-400">{p.blurb}</p>
                </div>
                <ul className="relative flex flex-col gap-2.5 text-sm text-neutral-300">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 flex-none text-fuchsia-300" aria-hidden="true">
                        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <ConfettiButton
                  size="lg"
                  variant={featured ? "default" : "outline"}
                  className={cn("relative mt-auto h-12 rounded-xl text-[15px]", featured ? "bg-white text-neutral-950 hover:bg-white/90" : "bg-transparent")}
                  options={{ particleCount: featured ? 140 : 70, spread: featured ? 100 : 65, colors: COLORS }}
                  onClick={() => window.setTimeout(() => navigate(`/waitlist?plan=${p.name.toLowerCase()}`), 700)}
                >
                  {p.usd === 0 ? "Start free" : `Reserve ${p.name}`}
                </ConfettiButton>
              </RevealItem>
            )
          })}
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-32 lg:grid-cols-[1fr_1.4fr]">
        <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Questions about pricing</h2>
        <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
          {FAQ.map(([q, a], i) => {
            const open = openFaq === i
            return (
              <div key={q}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left text-lg font-medium text-white"
                >
                  {q}
                  <motion.span animate={{ rotate: open ? 45 : 0 }} className="grid h-8 w-8 flex-none place-items-center rounded-full ring-1 ring-white/20 text-xl leading-none" aria-hidden="true">
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[60ch] pb-6 leading-relaxed text-neutral-400">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>
    </Page>
  )
}
