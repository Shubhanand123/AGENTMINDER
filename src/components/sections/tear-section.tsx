import { useEffect, useState } from "react"
import TigerTearReveal from "@/components/ui/tiger-tear-reveal"

/** Paper and ink that suit the current theme; re-reads when the theme toggle flips. */
function usePosterColors() {
  const read = () => (typeof document !== "undefined" && document.documentElement.classList.contains("light") ? "light" : "dark")
  const [theme, setTheme] = useState<"light" | "dark">(read)
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(read()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => mo.disconnect()
  }, [])
  return theme === "light"
    ? { paper: "#f2f1ee", ink: "#c026d3", taglineColor: "#2a2a2a" }
    : { paper: "#0e0e12", ink: "#e879f9", taglineColor: "#d4d4d8" }
}

/**
 * The tear: "UNWATCHED" rips open as you scroll and a tiger looks through.
 * The point it makes: someone is always watching your bot's conversations — us.
 */
export function TearSection() {
  const colors = usePosterColors()
  return (
    <section aria-label="Someone is watching" className="relative border-t border-white/5">
      <TigerTearReveal word="UNWATCHED" tagline="YOUR AI AGENT, RIGHT NOW" {...colors} />
      <div className="flex min-h-[40svh] w-full items-center justify-center px-6 py-20 text-center" style={{ background: colors.paper }}>
        <p className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl" style={{ color: colors.taglineColor }}>
          Not anymore. AgentMinder keeps an eye on{" "}
          <span style={{ color: colors.ink }}>every conversation</span>, so you don't have to.
        </p>
      </div>
    </section>
  )
}
