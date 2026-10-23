import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import type { Conversation, Flag } from "@/lib/supabase"

/* Small building blocks for the signed-in app. They use the site's neutral tokens, so they follow the theme. */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-white/[0.03] p-5", className)}>{children}</div>
}

export function Btn({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
        variant === "primary" && "bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-orange-300 text-[#0a0a0a] hover:brightness-105",
        variant === "ghost" && "text-white ring-1 ring-white/15 hover:bg-white/10",
        variant === "danger" && "text-orange-300 ring-1 ring-orange-300/30 hover:bg-orange-400/10",
        className,
      )}
    />
  )
}

const field = "w-full rounded-xl border border-white/15 bg-white/[0.03] px-3.5 py-2.5 text-[15px] text-white placeholder:text-neutral-500 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-300/30"

export function Field({ label, hint, id, ...p }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; id: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-200">{label}</span>
      <input id={id} {...p} className={field} />
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </label>
  )
}

export function Area({ label, id, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; id: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-200">{label}</span>
      <textarea id={id} {...p} className={cn(field, "min-h-24")} />
    </label>
  )
}

export function Select({ label, id, children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; id: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-200">{label}</span>
      <select id={id} {...p} className={cn(field, "appearance-none bg-neutral-950")}>
        {children}
      </select>
    </label>
  )
}

export const FLAG_LABEL: Record<string, string> = {
  risky_action: "Risky action",
  wrong_answer: "Wrong answer",
  data_leak: "Data leak",
  cost_spike: "Cost spike",
  policy_breach: "Rule broken",
  unresolved: "Not resolved",
  off_topic: "Off topic",
}

const FLAG_TONE: Record<string, string> = {
  risky_action: "bg-orange-400/15 text-orange-300",
  data_leak: "bg-fuchsia-400/15 text-fuchsia-200",
  wrong_answer: "bg-amber-300/15 text-amber-200",
  policy_breach: "bg-orange-400/15 text-orange-300",
  cost_spike: "bg-sky-400/15 text-sky-200",
  unresolved: "bg-indigo-400/15 text-indigo-200",
  off_topic: "bg-white/10 text-neutral-300",
}

export function FlagChip({ type }: { type: string }) {
  return <span className={cn("rounded-md px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider", FLAG_TONE[type] ?? "bg-white/10 text-neutral-300")}>{FLAG_LABEL[type] ?? type}</span>
}

export function Severity({ s }: { s: string }) {
  const tone = s === "high" ? "bg-orange-400" : s === "medium" ? "bg-amber-300" : "bg-neutral-500"
  return (
    <span className="inline-flex items-center gap-1.5 text-xs capitalize text-neutral-400">
      <span className={cn("h-2 w-2 rounded-full", tone)} /> {s}
    </span>
  )
}

export function StatusChip({ c }: { c: Pick<Conversation, "status" | "resolved"> }) {
  if (c.status === "pending") return <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-neutral-300">Reviewing…</span>
  if (c.status === "error") return <span className="rounded-md bg-orange-400/15 px-2 py-0.5 text-xs text-orange-300">Review failed</span>
  return c.resolved ? (
    <span className="rounded-md bg-indigo-400/15 px-2 py-0.5 text-xs text-indigo-200">Resolved</span>
  ) : (
    <span className="rounded-md bg-amber-300/15 px-2 py-0.5 text-xs text-amber-200">Not resolved</span>
  )
}

/** Health score, 0–100: resolution rate and how few chats needed a human look. */
export function healthScore(convs: Pick<Conversation, "id" | "status" | "resolved">[], flags: Pick<Flag, "conversation_id" | "severity" | "dismissed">[]) {
  const reviewed = convs.filter((c) => c.status === "reviewed")
  if (!reviewed.length) return null
  const resolved = reviewed.filter((c) => c.resolved).length / reviewed.length
  const live = flags.filter((f) => !f.dismissed)
  const flagged = new Set(live.map((f) => f.conversation_id))
  const high = new Set(live.filter((f) => f.severity === "high").map((f) => f.conversation_id))
  const clean = 1 - Math.min(1, (flagged.size + high.size) / reviewed.length)
  return Math.round(100 * (0.55 * resolved + 0.45 * clean))
}

export const usd = (n: number) => (n < 1 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`)
export const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-white/15 p-8">
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      <div className="text-sm leading-relaxed text-neutral-400">{children}</div>
    </div>
  )
}

/** Copy-to-clipboard code block. */
export function Code({ children, label }: { children: string; label?: string }) {
  return (
    <div className="relative min-w-0">
      {label && <p className="mb-1.5 text-xs font-medium text-neutral-400">{label}</p>}
      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 pr-20 font-mono text-[12.5px] leading-relaxed text-neutral-200">{children}</pre>
      <button
        type="button"
        onClick={(e) => {
          const b = e.currentTarget
          navigator.clipboard?.writeText(children).then(
            () => {
              b.textContent = "Copied"
              setTimeout(() => (b.textContent = "Copy"), 1400)
            },
            () => (b.textContent = "Select and copy"),
          )
        }}
        className={cn("absolute right-2 rounded-lg bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/20", label ? "top-8" : "top-2")}
      >
        Copy
      </button>
    </div>
  )
}
