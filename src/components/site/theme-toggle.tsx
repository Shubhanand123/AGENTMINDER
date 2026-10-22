import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type Theme = "light" | "dark"

const current = (): Theme => (document.documentElement.classList.contains("light") ? "light" : "dark")

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => (typeof document === "undefined" ? "dark" : current()))

  useEffect(() => {
    // follow the system setting until the visitor picks one
    const mq = matchMedia("(prefers-color-scheme: light)")
    const onChange = () => {
      let saved: string | null = null
      try { saved = localStorage.getItem("am-theme") } catch { /* ignore */ }
      if (!saved) apply(mq.matches ? "light" : "dark", false)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const apply = (t: Theme, save = true) => {
    const root = document.documentElement
    root.classList.add("theme-switching")
    root.classList.remove("light", "dark")
    root.classList.add(t)
    window.setTimeout(() => root.classList.remove("theme-switching"), 500)
    if (save) try { localStorage.setItem("am-theme", t) } catch { /* ignore */ }
    setTheme(t)
  }

  const light = theme === "light"
  return (
    <button
      type="button"
      onClick={() => apply(light ? "dark" : "light")}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      title={light ? "Dark mode" : "Light mode"}
      className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-white ring-1 ring-white/15 transition-colors hover:bg-white/10"
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
        animate={{ rotate: light ? 0 : 180 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        {/* sun rays fade in for light mode */}
        <motion.g animate={{ opacity: light ? 1 : 0, scale: light ? 1 : 0.5 }} style={{ originX: "12px", originY: "12px" }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />
          ))}
        </motion.g>
        <mask id="moon-cut">
          <rect width="24" height="24" fill="white" />
          <motion.circle r="5.5" fill="black" animate={{ cx: light ? 26 : 16, cy: light ? -2 : 8 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} />
        </mask>
        <motion.circle cx="12" cy="12" fill="currentColor" stroke="none" mask="url(#moon-cut)" animate={{ r: light ? 4.5 : 7.5 }} />
      </motion.svg>
    </button>
  )
}
