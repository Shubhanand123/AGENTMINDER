import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" aria-label="AgentMinder home" className={cn("flex items-center gap-2.5 text-white no-underline", className)}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="am-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#818cf8" />
            <stop offset="0.55" stopColor="#e879f9" />
            <stop offset="1" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="#18181b" />
        <circle cx="16" cy="16" r="7" fill="none" stroke="url(#am-g)" strokeWidth="3" />
        <circle cx="16" cy="16" r="2.4" fill="url(#am-g)" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">AgentMinder</span>
    </Link>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">{children}</p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  center = false,
}: {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  center?: boolean
}) {
  return (
    <div className={cn("flex flex-col gap-4", center && "items-center text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      {lead && <p className="max-w-[56ch] text-base leading-relaxed text-neutral-400 sm:text-lg">{lead}</p>}
    </div>
  )
}
