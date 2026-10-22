import { useEffect, useState, type ComponentType } from "react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  AlertStack,
  CostBars,
  DigestType,
  FlagFeed,
  HealthGauge,
  IntegrationMarquee,
  KbFix,
  PolicyToggles,
  RedactScan,
  ReportFan,
} from "./visuals"

export type Feature = {
  id: string
  title: string
  short: string
  long: string
  points: string[]
  plan: string
  Visual: ComponentType
  span?: string
}

export const FEATURES: Feature[] = [
  {
    id: "risk-detection",
    title: "Risk detection",
    short: "Every chat is checked for refunds, discounts and promises your policy doesn't allow.",
    long: "AgentMinder reads each conversation and flags the moment your bot commits you to something: money back, a discount, a delivery date, a feature you don't have.",
    points: ["Refunds, credits and discounts", "Delivery and service promises", "Made-up features and policies", "Every flag links to the transcript"],
    plan: "All plans",
    Visual: FlagFeed,
    span: "lg:col-span-2",
  },
  {
    id: "health-score",
    title: "Weekly health score",
    short: "One number for how your agent did this week, and why it moved.",
    long: "The health score blends resolution rate, risky actions, wrong answers and customer sentiment into one number you can track week to week and forward to your team.",
    points: ["Resolution rate", "Risk and accuracy", "Customer sentiment", "Week-on-week change, explained"],
    plan: "All plans",
    Visual: HealthGauge,
  },
  {
    id: "cost-tracking",
    title: "Cost tracking",
    short: "Spend per chat and per resolution, with the exact chats that caused a spike.",
    long: "See what your agent costs by day, by bot and by resolved ticket. When spend jumps, AgentMinder points to the conversations that caused it.",
    points: ["Cost per conversation", "Cost per resolved ticket", "Spike alerts with the cause", "Works across OpenAI, Anthropic and Gemini"],
    plan: "All plans",
    Visual: CostBars,
  },
  {
    id: "plain-digest",
    title: "Plain-language digest",
    short: "A short Monday summary written for owners, not engineers.",
    long: "Instead of traces and dashboards, you get a few sentences: what happened, what needs you, and the one thing to fix first.",
    points: ["Every Monday by email", "What needs a human, in order", "The fix with the biggest impact", "Forwardable to clients"],
    plan: "All plans",
    Visual: DigestType,
    span: "lg:col-span-2",
  },
  {
    id: "alerts",
    title: "Instant alerts",
    short: "Slack and email the moment something goes wrong.",
    long: "Choose which flags are urgent. AgentMinder posts them to Slack or email within a minute, with the transcript one click away.",
    points: ["Slack channels per bot", "Email for owners", "Choose what counts as urgent", "Quiet hours"],
    plan: "Starter and up",
    Visual: AlertStack,
  },
  {
    id: "pii-redaction",
    title: "PII redaction",
    short: "Emails, phone numbers and card digits are removed before anything is stored.",
    long: "Personal details are detected and blacked out before conversations reach storage, so your monitoring never becomes a privacy risk of its own.",
    points: ["Emails, phones and addresses", "Card and account numbers", "Runs before storage", "Audit log of every redaction"],
    plan: "Business",
    Visual: RedactScan,
  },
  {
    id: "risk-policies",
    title: "Custom risk policies",
    short: "Write your own rules in plain English and get flagged when the bot breaks them.",
    long: "Your business has its own limits. Write them down once, like \"max discount 15%\", and AgentMinder checks every chat against them.",
    points: ["Rules in plain English", "Per-bot or company-wide", "Severity levels", "Test a rule on last week's chats"],
    plan: "Growth and up",
    Visual: PolicyToggles,
  },
  {
    id: "kb-fixes",
    title: "Knowledge-base fixes",
    short: "When the bot is wrong, we show the doc to fix and what to change.",
    long: "Most wrong answers come from an outdated doc. AgentMinder finds the source and suggests the exact edit, so one fix stops a whole class of mistakes.",
    points: ["Finds the outdated source", "Suggests the exact edit", "Groups repeat mistakes", "Shows how many chats a fix affects"],
    plan: "Starter and up",
    Visual: KbFix,
  },
  {
    id: "client-reports",
    title: "Client reports for agencies",
    short: "Branded monthly reports for every client bot you run.",
    long: "Group bots by client and send each one a branded report: health score, wins, risks caught and fixes made. It turns monitoring into something you can sell.",
    points: ["Group bots by client", "Your logo and colours", "Monthly PDF or link", "Show the value you deliver"],
    plan: "Growth and up",
    Visual: ReportFan,
    span: "lg:col-span-2",
  },
  {
    id: "integrations",
    title: "Works with your stack",
    short: "One line for custom agents. A few clicks for no-code bots.",
    long: "Route OpenAI, Anthropic or Gemini calls through AgentMinder, or connect Intercom, Voiceflow and others directly. You can also upload a CSV of past chats.",
    points: ["OpenAI, Anthropic, Gemini", "Intercom, Voiceflow, Zendesk", "Slack and WhatsApp alerts", "CSV upload for a quick audit"],
    plan: "All plans",
    Visual: IntegrationMarquee,
    span: "sm:col-span-2 lg:col-span-3",
  },
]

function Tile({ f, onOpen }: { f: Feature; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative flex min-w-0 flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 text-left transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
        f.span,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative">
        <f.Visual />
      </div>
      <div className="relative mt-auto flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <motion.h3 className="font-display text-xl font-semibold text-white">
            {f.title}
          </motion.h3>
          <span className="flex-none text-sm text-neutral-500 transition-transform group-hover:translate-x-1" aria-hidden="true">
            Open →
          </span>
        </div>
        <p className="text-[15px] leading-relaxed text-neutral-400">{f.short}</p>
      </div>
    </motion.button>
  )
}

function Detail({ f, onClose }: { f: Feature; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <motion.div
        className="absolute inset-0 bg-neutral-950/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "transform, opacity" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`feature-dialog-${f.id}`}
        className="relative grid max-h-[90svh] w-full max-w-4xl gap-8 overflow-auto rounded-3xl border border-white/10 bg-neutral-900 p-6 shadow-2xl sm:p-10 md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full text-xl text-neutral-300 ring-1 ring-white/15 hover:bg-white/10"
        >
          ×
        </button>
        <div className="flex min-w-0 flex-col justify-center">
          <f.Visual />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <span className="self-start rounded-full bg-white/[0.06] px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-indigo-300">{f.plan}</span>
          <motion.h3 id={`feature-dialog-${f.id}`} className="font-display text-3xl font-bold text-white sm:text-4xl">
            {f.title}
          </motion.h3>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="leading-relaxed text-neutral-300">
            {f.long}
          </motion.p>
          <motion.ul
            className="flex flex-col gap-2"
            initial="h"
            animate="s"
            variants={{ h: {}, s: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } }}
          >
            {f.points.map((p) => (
              <motion.li key={p} variants={{ h: { opacity: 0, x: 12 }, s: { opacity: 1, x: 0 } }} className="flex gap-2.5 text-neutral-200">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-r from-indigo-300 to-fuchsia-300" />
                {p}
              </motion.li>
            ))}
          </motion.ul>
          <Link to="/waitlist" className="mt-2 inline-flex min-h-12 items-center self-start rounded-full bg-white px-6 font-semibold text-neutral-950 transition-transform hover:scale-105">
            Get early access
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

/** Bento grid of features. Each tile runs its own live visual and opens into a detail card. */
export function FeatureGrid({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<string | null>(null)
  const list = limit ? FEATURES.slice(0, limit) : FEATURES
  const current = FEATURES.find((f) => f.id === open)
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((f) => (
          <Tile key={f.id} f={f} onOpen={() => setOpen(f.id)} />
        ))}
      </div>
      <AnimatePresence>{current && <Detail key={current.id} f={current} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  )
}
