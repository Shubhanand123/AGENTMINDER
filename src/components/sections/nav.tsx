import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "./shared"

const LINKS = [
  { href: "#problem", label: "Why" },
  { href: "#demo", label: "Live demo" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
]

export function Nav() {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        solid ? "border-b border-white/10 bg-neutral-950/80 backdrop-blur-lg" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 text-sm text-neutral-300 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#waitlist"
          className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-neutral-950 transition-transform hover:scale-[1.03]"
        >
          Join the waitlist
        </a>
      </div>
    </header>
  )
}
