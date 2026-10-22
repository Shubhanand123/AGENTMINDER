import { SectionHeading } from "./shared"

const STEPS = [
  {
    n: "01",
    title: "Connect your agent",
    body: "Change one line to route calls through AgentMinder, connect Intercom or Voiceflow, or upload a CSV of past chats.",
    detail: "baseURL: \"https://proxy.agentminder.ai/v1\"",
  },
  {
    n: "02",
    title: "Every chat gets reviewed",
    body: "Each conversation is tagged: resolved or not, risky actions, wrong answers, sentiment and cost.",
    detail: "resolved · risky · wrong · cost",
  },
  {
    n: "03",
    title: "You get the short version",
    body: "A weekly health score, the transcripts that matter, and alerts in email or Slack the moment something goes wrong.",
    detail: "Slack · email · weekly digest",
  },
]

/** Section 4 — three steps. */
export function HowSection() {
  return (
    <section id="how" className="border-t border-white/5 bg-neutral-950 py-28 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-5">
        <SectionHeading
          eyebrow="How it works"
          title="Connected in ten minutes. Useful the same day."
          lead="No engineering project. If your bot runs on a no-code platform, you connect it in a few clicks."
        />
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative flex min-w-0 flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-7">
              <span className="font-mono text-sm text-emerald-400">{s.n}</span>
              <h3 className="font-display text-2xl font-semibold text-white">{s.title}</h3>
              <p className="leading-relaxed text-neutral-400">{s.body}</p>
              <code className="mt-auto truncate rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-neutral-300">
                {s.detail}
              </code>
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="absolute -right-4 top-1/2 hidden h-px w-3 bg-emerald-400/50 md:block" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
