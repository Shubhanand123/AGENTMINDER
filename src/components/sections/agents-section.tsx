import { useNavigate } from "react-router-dom"
import OrbitGallery from "@/components/ui/orbit-gallery"
import { AGENTS } from "@/data/agents"
import { SectionHeading } from "./shared"

/** Section 3 — the ring gallery of agent types. */
export function AgentsSection() {
  const navigate = useNavigate()
  const items = AGENTS.map((a) => ({ src: a.image, title: a.title, caption: a.caption }))
  return (
    <section id="agents" className="relative overflow-hidden border-t border-white/5 bg-neutral-950 py-28 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_45%_50%,rgba(129,140,248,0.12),transparent)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5">
        <SectionHeading
          eyebrow="Works with every agent"
          title="Whatever your bot does, AgentMinder watches it."
          lead="Spin the ring, pick an agent, and open its page to see the chats we'd flag."
        />
        <OrbitGallery
          items={items}
          centerLabel="Agents '26"
          openLabel="Open"
          onOpen={(_, i) => navigate(`/agents/${AGENTS[i].slug}`)}
        />
      </div>
    </section>
  )
}
