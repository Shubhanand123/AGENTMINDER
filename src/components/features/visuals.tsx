import { useEffect, useRef, useState } from "react"
import { AnimatePresence, animate, motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

/* Small, self-running product visuals, one per feature. They use the site's
   neutral tokens, so they work in both light and dark mode. */

function useTicker(ms: number, run = true) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    const id = window.setInterval(() => setN((v) => v + 1), ms)
    return () => window.clearInterval(id)
  }, [ms, run])
  return n
}

const TAG = {
  risk: "bg-orange-400/15 text-orange-300",
  wrong: "bg-amber-300/15 text-amber-200",
  cost: "bg-sky-400/15 text-sky-200",
  good: "bg-indigo-400/15 text-indigo-200",
  leak: "bg-fuchsia-400/15 text-fuchsia-200",
}

/** 1. Risk detection: chats arrive and get tagged. */
export function FlagFeed() {
  const rows = [
    { t: "I've refunded the full ₹4,800.", tag: "Risky action", k: "risk" as const },
    { t: "Your order ships tomorrow.", tag: "Resolved", k: "good" as const },
    { t: "We're open Sundays till 9.", tag: "Wrong answer", k: "wrong" as const },
    { t: "Sure, 50% off your renewal.", tag: "Risky action", k: "risk" as const },
    { t: "Let me check that again…", tag: "Cost spike", k: "cost" as const },
    { t: "Email on file is r•••@…", tag: "Data leak", k: "leak" as const },
  ]
  const n = useTicker(1500)
  const shown = Array.from({ length: 3 }, (_, i) => ({ ...rows[(n + i) % rows.length], key: n + i }))
  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false} mode="popLayout">
        {shown.map((r) => (
          <motion.div
            key={r.key}
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.05] px-3 py-2.5"
          >
            <span className="min-w-0 truncate text-[13px] text-neutral-200">“{r.t}”</span>
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 420, damping: 18 }}
              className={cn("flex-none rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", TAG[r.k])}
            >
              {r.tag}
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** 2. Health score: a gauge sweeps up and the number counts. */
export function HealthGauge({ value = 82 }: { value?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, value, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) })
    return () => c.stop()
  }, [inView, value])
  const R = 52
  const C = Math.PI * R // half circle
  return (
    <div ref={ref} className="flex items-center gap-5">
      <svg viewBox="0 0 132 76" className="w-40 flex-none" aria-hidden="true">
        <defs>
          <linearGradient id="gauge-g" x1="0" x2="1">
            <stop offset="0" stopColor="#818cf8" />
            <stop offset="0.6" stopColor="#e879f9" />
            <stop offset="1" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <path d="M14 66 A52 52 0 0 1 118 66" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="11" strokeLinecap="round" className="text-white" />
        <motion.path
          d="M14 66 A52 52 0 0 1 118 66"
          fill="none"
          stroke="url(#gauge-g)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: inView ? C * (1 - value / 100) : C }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div>
        <div className="font-display text-5xl font-bold tabular-nums text-white">{shown}</div>
        <div className="text-sm text-neutral-400">Health score, this week</div>
        <div className="mt-1 font-mono text-xs text-indigo-300">▲ 6 vs last week</div>
      </div>
    </div>
  )
}

/** 3. Cost tracking: daily spend bars grow in, Tuesday's spike pulses. */
export function CostBars() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const days = [
    { d: "Mon", v: 34 },
    { d: "Tue", v: 92, spike: true },
    { d: "Wed", v: 38 },
    { d: "Thu", v: 41 },
    { d: "Fri", v: 36 },
    { d: "Sat", v: 22 },
    { d: "Sun", v: 19 },
  ]
  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div className="flex h-28 items-end gap-2">
        {days.map((x, i) => (
          <div key={x.d} className="relative flex h-full flex-1 items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: inView ? `${x.v}%` : 0 }}
              transition={{ delay: i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={cn("w-full rounded-t-md", x.spike ? "bg-gradient-to-t from-fuchsia-500 to-orange-400" : "bg-white/15")}
            />
            {x.spike && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: inView ? 1 : 0, y: 0 }}
                transition={{ delay: 0.9 }}
                className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-orange-400 px-1.5 py-0.5 font-mono text-[10px] text-[#0a0a0a]"
              >
                41-turn loop
              </motion.span>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 font-mono text-[10px] text-neutral-500">
        {days.map((x) => (
          <span key={x.d} className="flex-1 text-center">{x.d}</span>
        ))}
      </div>
    </div>
  )
}

/** 4. Plain-language digest: the summary types itself out. */
export function DigestType() {
  const text =
    "This week your support bot handled 1,240 chats. 6 need you: 3 refund promises outside policy, 2 old prices and 1 loop. Fix the pricing page first."
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    setN(0)
    let i = 0
    const id = window.setInterval(() => {
      i += 2
      setN(i)
      if (i >= text.length + 60) i = 0 // pause at the end, then retype
    }, 40)
    return () => window.clearInterval(id)
  }, [inView, text.length])
  return (
    <div ref={ref} className="rounded-xl bg-white/[0.04] p-4">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-indigo-300">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" /> Monday digest
      </div>
      <p className="min-h-[5.5rem] text-[14px] leading-relaxed text-neutral-200">
        {text.slice(0, n)}
        <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-fuchsia-300" />
      </p>
    </div>
  )
}

/** 5. Alerts: Slack-style notifications stack up. */
export function AlertStack() {
  const alerts = [
    { ch: "#support-alerts", msg: "Risky action: refund outside policy", t: "now" },
    { ch: "#support-alerts", msg: "Cost spike: one chat looped 41 times", t: "2m" },
    { ch: "email", msg: "Weekly health score: 82 (▲6)", t: "Mon" },
    { ch: "#sales-bot", msg: "Unapproved 50% discount quoted", t: "5m" },
  ]
  const n = useTicker(1800)
  const shown = Array.from({ length: 3 }, (_, i) => ({ ...alerts[(n + i) % alerts.length], key: n + i }))
  return (
    <div className="relative h-36">
      <AnimatePresence initial={false}>
        {shown.map((a, i) => (
          <motion.div
            key={a.key}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1 - i * 0.28, y: i * 40, scale: 1 - i * 0.04 }}
            exit={{ opacity: 0, y: 130, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            style={{ zIndex: 10 - i }}
            className="absolute inset-x-0 top-0 flex items-center gap-3 rounded-xl bg-neutral-900 px-3 py-2.5 shadow-lg ring-1 ring-white/10"
          >
            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-orange-300 text-xs font-bold text-[#0a0a0a]">A</span>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between font-mono text-[10px] text-neutral-500">
                <span>{a.ch}</span>
                <span>{a.t}</span>
              </div>
              <div className="truncate text-[13px] text-neutral-100">{a.msg}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** 6. PII redaction: a scan line passes and personal data is blacked out. */
export function RedactScan() {
  const n = useTicker(3200)
  const on = n % 2 === 1
  const Secret = ({ children }: { children: string }) => (
    <span className="relative inline-block">
      <span className={cn("transition-all duration-500", on && "blur-[1px] opacity-0")}>{children}</span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0 rounded-sm bg-white"
        initial={false}
        animate={{ width: on ? "100%" : "0%" }}
        transition={{ duration: 0.45, delay: on ? 0.35 : 0 }}
      />
    </span>
  )
  return (
    <div className="relative overflow-hidden rounded-xl bg-white/[0.04] p-4 font-mono text-[13px] leading-7 text-neutral-200">
      <motion.div
        key={n}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-fuchsia-400/30 to-transparent"
        initial={{ left: "-20%" }}
        animate={{ left: "110%" }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      <div>
        <span className="text-neutral-500">bot:</span> Your email is <Secret>riya.k@gmail.com</Secret>
      </div>
      <div>
        <span className="text-neutral-500">bot:</span> Card ending <Secret>4417</Secret>, phone <Secret>98220 41xxx</Secret>
      </div>
      <div className="mt-1 text-[11px] text-fuchsia-300">{on ? "3 details redacted before storage" : "scanning for personal data…"}</div>
    </div>
  )
}

/** 7. Custom risk policies: rules switch on one after another. */
export function PolicyToggles() {
  const rules = ["Max discount 15%", "Refunds only within 30 days", "Never share account details", "Hand off after 5 retries"]
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="flex flex-col gap-2">
      {rules.map((r, i) => (
        <div key={r} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5">
          <span className="text-[13px] text-neutral-200">{r}</span>
          <span className="relative h-5 w-9 flex-none rounded-full bg-white/15">
            <motion.span
              className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ delay: 0.3 + i * 0.25 }}
            />
            <motion.span
              className="absolute top-0.5 h-4 w-4 rounded-full bg-[#fff] shadow"
              initial={{ left: 2 }}
              animate={{ left: inView ? 18 : 2 }}
              transition={{ delay: 0.3 + i * 0.25, type: "spring", stiffness: 500, damping: 30 }}
            />
          </span>
        </div>
      ))}
    </div>
  )
}

/** 8. Knowledge-base fixes: the wrong fact gets struck out and replaced. */
export function KbFix() {
  const n = useTicker(2600)
  const fixed = n % 2 === 1
  return (
    <div className="rounded-xl bg-white/[0.04] p-4 text-[14px] leading-relaxed">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">pricing.md · suggested fix</div>
      <p className="text-neutral-200">
        Shipping to Pune is{" "}
        <span className="relative inline-block">
          <span className={cn("transition-colors", fixed && "text-neutral-500")}>₹49 flat</span>
          <motion.span className="absolute left-0 top-1/2 h-[2px] bg-orange-400" initial={false} animate={{ width: fixed ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
        </span>{" "}
        <AnimatePresence>
          {fixed && (
            <motion.span
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded bg-indigo-400/15 px-1.5 font-semibold text-indigo-200"
            >
              ₹79 flat
            </motion.span>
          )}
        </AnimatePresence>
      </p>
      <p className="mt-2 text-[12px] text-neutral-500">Fixes 2 wrong answers from this week.</p>
    </div>
  )
}

/** 9. Integrations: two rows drifting in opposite directions. */
export function IntegrationMarquee() {
  const a = ["OpenAI", "Anthropic", "Gemini", "Intercom", "Voiceflow", "Zendesk"]
  const b = ["Slack", "WhatsApp", "Zapier", "n8n", "Freshdesk", "CSV upload"]
  const Row = ({ items, dir }: { items: string[]; dir: 1 | -1 }) => (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
      <motion.div
        className="flex flex-none gap-2 pr-2"
        animate={{ x: dir === 1 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: 16, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items].map((x, i) => (
          <span key={i} className="whitespace-nowrap rounded-full bg-white/[0.06] px-3 py-1.5 text-[13px] text-neutral-200 ring-1 ring-white/10">
            {x}
          </span>
        ))}
      </motion.div>
    </div>
  )
  return (
    <div className="flex flex-col gap-2.5">
      <Row items={a} dir={1} />
      <Row items={b} dir={-1} />
    </div>
  )
}

/** 10. Client reports: branded report cards fan out on hover. */
export function ReportFan() {
  const clients = [
    { name: "Coastal Clinics", score: 88, c: "from-indigo-400 to-fuchsia-400" },
    { name: "Goa Stays", score: 74, c: "from-fuchsia-400 to-orange-300" },
    { name: "Panjim Retail", score: 91, c: "from-sky-400 to-indigo-400" },
  ]
  return (
    <div className="group relative mx-auto h-36 w-56">
      {clients.map((cl, i) => (
        <div
          key={cl.name}
          style={{ ["--r" as string]: `${(i - 1) * 9}deg`, ["--x" as string]: `${(i - 1) * 62}px`, zIndex: i === 1 ? 3 : 1 }}
          className="absolute inset-x-6 top-2 rounded-xl bg-neutral-900 p-3 shadow-xl ring-1 ring-white/10 transition-transform duration-500 ease-out [transform:rotate(calc(var(--r)*0.35))] group-hover:[transform:translateX(var(--x))_rotate(var(--r))]"
        >
          <div className={cn("mb-2 h-1.5 w-10 rounded-full bg-gradient-to-r", cl.c)} />
          <div className="text-[12px] font-semibold text-neutral-100">{cl.name}</div>
          <div className="font-mono text-[10px] text-neutral-500">Monthly bot report</div>
          <div className="mt-2 font-display text-2xl font-bold text-white">{cl.score}</div>
        </div>
      ))}
    </div>
  )
}
