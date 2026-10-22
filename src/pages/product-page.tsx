import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion"
import { Page, PageHeader, GradientText, Reveal, RevealItem } from "@/components/site/motion"
import { TUNNEL_IMAGES } from "@/components/ui/perspective-tunnel-hero"

const STEPS = [
  {
    title: "Connect your agent",
    body: "Change one line so your OpenAI or Anthropic calls go through AgentMinder, connect Intercom or Voiceflow, or upload a CSV of past chats.",
    code: 'baseURL: "https://proxy.agentminder.ai/v1"',
    img: TUNNEL_IMAGES[3],
  },
  {
    title: "Every chat gets read",
    body: "A small, cheap model reviews each conversation and tags it: resolved or not, risky actions, wrong answers, sentiment and cost.",
    code: "resolved · risky · wrong · cost",
    img: TUNNEL_IMAGES[2],
  },
  {
    title: "Only the few that matter reach you",
    body: "Out of hundreds of chats, you see the handful that need a human, with the transcript and a suggested fix.",
    code: "1,240 chats → 6 need you",
    img: TUNNEL_IMAGES[0],
  },
  {
    title: "Alerts where you already work",
    body: "Email and Slack the moment something goes wrong, plus a weekly health score you can forward to your team or your client.",
    code: "#support-alerts · weekly digest",
    img: TUNNEL_IMAGES[8],
  },
]

/* A live-looking stream: chats arrive and get tagged one after another. */
const STREAM = [
  { text: "Your order ships tomorrow.", tag: "Resolved", tone: "bg-indigo-400/20 text-indigo-100" },
  { text: "I've refunded the full amount.", tag: "Risky action", tone: "bg-orange-400/20 text-orange-100" },
  { text: "We're open Sundays till 9.", tag: "Wrong answer", tone: "bg-amber-300/20 text-amber-100" },
  { text: "Booked for Thursday 4:30.", tag: "Resolved", tone: "bg-indigo-400/20 text-indigo-100" },
  { text: "Let me check that again…", tag: "Cost spike", tone: "bg-sky-400/20 text-sky-100" },
  { text: "Email on file is r•••@…", tag: "Data leak", tone: "bg-fuchsia-400/20 text-fuchsia-100" },
]

function TagStream() {
  const [n, setN] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => v + 1), 1400)
    return () => window.clearInterval(id)
  }, [])
  const rows = Array.from({ length: 4 }, (_, i) => ({ ...STREAM[(n + i) % STREAM.length], key: n + i }))
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">
        <span>Live review</span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" /> streaming
        </span>
      </div>
      <AnimatePresence initial={false} mode="popLayout">
        {rows.map((r) => (
          <motion.div
            key={r.key}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-4 py-3"
          >
            <span className="min-w-0 truncate text-sm text-neutral-200">“{r.text}”</span>
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 400, damping: 18 }}
              className={`flex-none rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${r.tone}`}
            >
              {r.tag}
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function Step({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const imgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"])
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [index % 2 ? 4 : -4, 0, index % 2 ? -4 : 4])
  return (
    <div ref={ref} className="grid items-center gap-10 py-14 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`flex min-w-0 flex-col gap-5 ${index % 2 ? "lg:order-2" : ""}`}
      >
        <span className="font-mono text-sm text-fuchsia-300">Step {index + 1} of {STEPS.length}</span>
        <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">{step.title}</h2>
        <p className="max-w-[48ch] text-lg leading-relaxed text-neutral-400">{step.body}</p>
        <code className="self-start truncate rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-neutral-200">{step.code}</code>
      </motion.div>
      <motion.div style={{ rotate }} className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-white/10">
        <motion.img src={step.img} alt="" style={{ y: imgY, scale: 1.25 }} className="h-full w-full object-cover" />
        {index === 1 && (
          <div className="absolute inset-0 grid place-items-center bg-black/35 p-6">
            <div className="w-full max-w-sm">
              <TagStream />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function ProductPage() {
  const railRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start 70%", "end 60%"] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <Page>
      <PageHeader
        eyebrow="How it works"
        title="From every chat to the six that matter."
        lead="AgentMinder sits between your agent and the model, reads every conversation, and tells you in plain words what went wrong."
      />
      <section ref={railRef} className="relative mx-auto max-w-6xl overflow-x-clip px-5 pb-24">
        {/* progress rail fills as you scroll through the steps */}
        <div aria-hidden="true" className="absolute bottom-0 left-5 top-0 hidden w-px bg-white/10 lg:block">
          <motion.div style={{ scaleY: fill }} className="h-full w-full origin-top bg-gradient-to-b from-indigo-400 via-fuchsia-400 to-orange-300" />
        </div>
        <div className="lg:pl-12">
          {STEPS.map((s, i) => (
            <Step key={s.title} step={s} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-32">
        <Reveal className="grid gap-5 md:grid-cols-3">
          {[
            ["Fails open", "If logging ever breaks, your customers' messages still go through."],
            ["Private by default", "Encrypted at rest, never used to train models, deleted when your history window ends."],
            ["No engineers needed", "No-code bots connect in a few clicks. Custom agents change one line."],
          ].map(([t, b]) => (
            <RevealItem key={t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <h3 className="font-display text-2xl font-semibold text-white">{t}</h3>
              <p className="mt-3 leading-relaxed text-neutral-400">{b}</p>
            </RevealItem>
          ))}
        </Reveal>
        <div className="mt-16 flex flex-wrap items-center gap-4">
          <p className="font-display text-3xl font-bold text-white">
            See it on your own bot. <GradientText>Free audit.</GradientText>
          </p>
          <Link to="/waitlist" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-semibold text-neutral-950 transition-transform hover:scale-105">
            Join the waitlist
          </Link>
          <Link to="/demo" className="inline-flex min-h-12 items-center rounded-full px-6 font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/10">
            Try the live demo
          </Link>
        </div>
      </section>
    </Page>
  )
}
