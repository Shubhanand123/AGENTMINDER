import { SectionHeading } from "./shared"

const PROBLEMS = [
  {
    title: "It makes promises",
    body: "Refunds, discounts and delivery dates you never approved, said in your brand's name.",
    tag: "Risky action",
    tone: "text-orange-300",
  },
  {
    title: "It gets things wrong",
    body: "Outdated prices, made-up policies and confident answers to questions it should hand off.",
    tag: "Wrong answer",
    tone: "text-amber-200",
  },
  {
    title: "It costs more than you think",
    body: "Long loops and retries quietly inflate your AI bill, with no way to see which chats caused it.",
    tag: "Cost spike",
    tone: "text-sky-200",
  },
]

/** Section 2 — why this matters. */
export function ProblemSection() {
  return (
    <section id="problem" className="relative border-t border-white/5 bg-neutral-950 py-28 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-5">
        <SectionHeading
          eyebrow="The problem"
          title={<>Your bot talks to hundreds of customers a day. <span className="text-neutral-500">Who's reading those chats?</span></>}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {PROBLEMS.map((p) => (
            <article
              key={p.title}
              className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
            >
              <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${p.tone}`}>{p.tag}</span>
              <h3 className="font-display text-2xl font-semibold text-white">{p.title}</h3>
              <p className="leading-relaxed text-neutral-400">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
