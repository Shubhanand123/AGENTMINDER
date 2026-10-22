import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { AGENTS } from "@/data/agents"
import { Page, PageHeader, Reveal, RevealItem } from "@/components/site/motion"

export default function AgentsPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Agents"
        title="Nine kinds of bots. One minder."
        lead="Each agent type breaks in its own way. Open one to see the chats AgentMinder flags, the numbers it tracks, and what it watches for."
      />
      <section className="mx-auto max-w-6xl px-5 pb-32">
        <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {AGENTS.map((a, i) => (
            <RevealItem key={a.slug} as="article">
              <Link to={`/agents/${a.slug}`} className="keep-dark group block focus-visible:outline-none" aria-label={`Open ${a.title}`}>
                <motion.div
                  layoutId={`agent-img-${a.slug}`}
                  className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-white/10 transition-shadow duration-500 group-hover:shadow-[0_30px_80px_-30px_rgba(232,121,249,0.55)] group-focus-visible:ring-2 group-focus-visible:ring-indigo-300"
                >
                  <img src={a.image} alt="" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <span className="absolute left-4 top-4 font-mono text-xs text-white/70">{String(i + 1).padStart(2, "0")}</span>
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
                    <motion.h2 layoutId={`agent-title-${a.slug}`} className="font-display text-2xl font-bold text-white">
                      {a.title}
                    </motion.h2>
                    <p className="max-w-[30ch] text-sm leading-relaxed text-white/75">{a.caption}</p>
                    <span className="mt-1 inline-flex translate-y-2 items-center gap-2 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      Open page <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </motion.div>
              </Link>
            </RevealItem>
          ))}
        </Reveal>
      </section>
    </Page>
  )
}
