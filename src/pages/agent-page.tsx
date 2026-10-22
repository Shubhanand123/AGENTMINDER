import { Link, Navigate, useParams } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { AGENTS, FLAG_STYLE, agentBySlug } from "@/data/agents"
import { CountUp, GradientText, Reveal, RevealItem } from "@/components/site/motion"

export default function AgentPage() {
  const { slug } = useParams()
  const agent = agentBySlug(slug)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12])

  if (!agent) return <Navigate to="/agents" replace />

  const index = AGENTS.findIndex((a) => a.slug === agent.slug)
  const next = AGENTS[(index + 1) % AGENTS.length]

  return (
    <article key={agent.slug}>
      {/* Hero: the card from the grid grows into this image (shared layoutId). */}
      <div ref={heroRef} className="relative h-[78svh] min-h-[520px] overflow-hidden">
        <motion.div layoutId={`agent-img-${agent.slug}`} className="absolute inset-0 overflow-hidden" transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}>
          <motion.img src={agent.image} alt="" style={{ y: imgY, scale: imgScale }} className="h-full w-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-6xl flex-col gap-4 px-5 pb-14">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Link to="/agents" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black/40 px-4 text-sm text-white/85 ring-1 ring-white/15 backdrop-blur transition-colors hover:text-white">
              <span aria-hidden="true">←</span> All agents
            </Link>
          </motion.div>
          <motion.h1 layoutId={`agent-title-${agent.slug}`} className="font-display text-5xl font-bold tracking-tight text-white sm:text-8xl">
            {agent.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-[56ch] text-lg leading-relaxed text-white/80"
          >
            {agent.intro}
          </motion.p>
        </div>
      </div>

      {/* Sample numbers count up as they come into view */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">A sample week · illustrative numbers</p>
        <Reveal className="grid gap-5 sm:grid-cols-3">
          {agent.stats.map((s) => (
            <RevealItem key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} className="font-display text-5xl font-bold text-white sm:text-6xl" />
              <p className="mt-2 text-neutral-400">{s.label}</p>
            </RevealItem>
          ))}
        </Reveal>
      </section>

      {/* Flagged chats slide in one by one */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="mb-10 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Chats we'd <GradientText>flag for you</GradientText>
        </h2>
        <Reveal className="flex flex-col gap-5" stagger={0.15}>
          {agent.chats.map((c, i) => (
            <RevealItem key={i} as="article" className="grid gap-5 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 sm:p-8 lg:grid-cols-[1fr_280px]">
              <div className="flex min-w-0 flex-col gap-3">
                <div className="max-w-[80%] self-start rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-neutral-100">{c.customer}</div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="max-w-[80%] self-end rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-500/80 to-fuchsia-500/80 px-4 py-3 text-white"
                >
                  {c.bot}
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55, type: "spring", stiffness: 260, damping: 20 }}
                className="flex flex-col justify-center gap-2 rounded-2xl bg-black/30 p-5 ring-1 ring-white/10"
              >
                <span className={`self-start rounded-md px-2 py-1 font-mono text-[11px] uppercase tracking-widest ring-1 ${FLAG_STYLE[c.flag.tone]}`}>{c.flag.label}</span>
                <p className="text-sm leading-relaxed text-neutral-300">{c.note}</p>
              </motion.div>
            </RevealItem>
          ))}
        </Reveal>
      </section>

      {/* What we watch: checklist draws in */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-10 rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 lg:grid-cols-2">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">What AgentMinder watches in a {agent.title.toLowerCase()}</h2>
          <Reveal as="ul" className="flex flex-col gap-4" stagger={0.12}>
            {agent.watches.map((w) => (
              <motion.li
                key={w}
                variants={{ hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0 } }}
                className="flex items-start gap-3 text-lg text-neutral-200"
              >
                <svg viewBox="0 0 24 24" className="mt-0.5 h-6 w-6 flex-none" aria-hidden="true">
                  <circle cx="12" cy="12" r="11" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                  <motion.path
                    d="M7 12.5l3.2 3.2L17 9"
                    fill="none"
                    stroke="url(#chk)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.5, delay: 0.15 } } }}
                  />
                  <defs>
                    <linearGradient id="chk" x1="0" x2="1">
                      <stop offset="0" stopColor="#a5b4fc" />
                      <stop offset="1" stopColor="#f0abfc" />
                    </linearGradient>
                  </defs>
                </svg>
                {w}
              </motion.li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Next agent: the card previews the next page */}
      <section className="mx-auto max-w-6xl px-5 pb-32">
        <Link to={`/agents/${next.slug}`} className="group relative block h-64 overflow-hidden rounded-3xl ring-1 ring-white/10">
          <motion.div layoutId={`agent-img-${next.slug}`} className="absolute inset-0">
            <img src={next.image} alt="" className="h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
          <div className="relative flex h-full flex-col justify-end gap-1 p-8">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/70">Next agent</span>
            <motion.span layoutId={`agent-title-${next.slug}`} className="font-display text-4xl font-bold text-white sm:text-5xl">
              {next.title} <span className="inline-block transition-transform group-hover:translate-x-2" aria-hidden="true">→</span>
            </motion.span>
          </div>
        </Link>
      </section>
    </article>
  )
}
