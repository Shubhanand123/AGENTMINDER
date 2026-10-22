import MorphOrb from "@/components/ui/ai-thiking-orb-and-input"
import { Eyebrow } from "./shared"

/* Sample answers for the demo. In the product these come from the user's real conversation data. */
function answer(question: string): string {
  const q = question.toLowerCase()
  if (/(refund|promise|discount|policy)/.test(q))
    return "3 chats this week promised refunds outside your 30-day policy. I've flagged all three with transcripts so you can follow up."
  if (/(cost|spend|bill|expensive|money|token)/.test(q))
    return "Spend rose this week. One chat on Tuesday looped 41 times and caused most of it. Add a hand-off after 5 retries."
  if (/(wrong|price|hallucinat|mistake|incorrect|accura)/.test(q))
    return "2 answers quoted last month's shipping price. Update the pricing page in your knowledge base to fix both."
  if (/(leak|privacy|personal|data|email|phone)/.test(q))
    return "1 chat shared a customer's email with someone who wasn't verified. I'd turn on PII redaction for this bot."
  return "This week your support bot resolved most chats on its own. 6 need a human look, mostly refund promises and one pricing error."
}

/** Section 4 — ask AgentMinder a question; the orb thinks and answers. */
export function DemoSection() {
  return (
    <section id="demo" className="keep-dark relative h-[100svh] min-h-[700px] overflow-hidden border-t border-white/5 bg-neutral-950">
      <MorphOrb onSubmit={(text) => new Promise((res) => setTimeout(() => res(answer(text)), 1800))} minThinkMs={2600} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-4 px-5 pt-20 text-center sm:pt-28">
        <Eyebrow>Live demo · sample data</Eyebrow>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">Just ask your agent's minder.</h2>
        <p className="max-w-[52ch] text-neutral-400">
          Type a question below, like <span className="text-neutral-200">"did my bot promise any refunds?"</span> or{" "}
          <span className="text-neutral-200">"why did costs go up?"</span>
        </p>
      </div>
    </section>
  )
}
