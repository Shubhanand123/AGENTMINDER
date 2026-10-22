import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Logo } from "./shared"

const LINKS = [
  { to: "/agents", label: "Agents" },
  { to: "/product", label: "How it works" },
  { to: "/demo", label: "Live demo" },
  { to: "/pricing", label: "Pricing" },
]

export function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid || open ? "border-b border-white/10 bg-neutral-950/80 backdrop-blur-lg" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 text-sm md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="relative rounded-full px-4 py-2 text-neutral-300 transition-colors hover:text-white">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className={cn("relative", isActive && "text-white")}>{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <NavLink
            to="/waitlist"
            className="inline-flex min-h-11 items-center rounded-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-orange-300 px-5 text-sm font-semibold text-neutral-950 transition-transform hover:scale-[1.04]"
          >
            Join the waitlist
          </NavLink>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white md:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              <motion.path animate={{ d: open ? "M4 4L16 16" : "M3 6H17" }} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <motion.path animate={{ d: open ? "M4 16L16 4" : "M3 14H17" }} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 pb-6">
              {LINKS.map((l, i) => (
                <motion.li key={l.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <NavLink to={l.to} className="block py-3 font-display text-2xl font-semibold text-white">
                    {l.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
