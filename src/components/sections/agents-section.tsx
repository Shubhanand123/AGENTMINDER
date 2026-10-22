import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel"
import { AGENTS } from "@/data/agents"
import { SectionHeading } from "./shared"

const ITEMS: WorksWheelItem[] = AGENTS.map((a) => ({ title: a.title, image: a.image, href: `/agents/${a.slug}` }))

/** Section 3 — the works wheel: a ring of agent types that turns into a drum as you scroll. */
export function AgentsSection() {
  return (
    <section id="agents" className="relative border-t border-white/5 bg-background pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Works with every agent"
          title="Whatever your bot does, AgentMinder watches it."
          lead="Scroll over the ring to turn it into a wheel, then click any agent to open its page."
        />
      </div>
      <div className="relative mt-6 h-[88svh] min-h-[560px] w-full">
        <WorksWheel items={ITEMS} label="Agents '26" action="Open" className="font-display" />
      </div>
    </section>
  )
}
