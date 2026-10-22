import { useRef, useState, type FormEvent } from "react"
import { AnimatePresence, motion } from "motion/react"
import confetti from "canvas-confetti"
import { Input } from "@/components/ui/input"
import { Confetti, type ConfettiRef } from "@/components/ui/confetti"
import { Button } from "@/components/ui/button"
import { Eyebrow } from "./shared"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Two side cannons, as in the confetti demo, in AgentMinder colours. */
function sideCannons() {
  const end = Date.now() + 1800
  const colors = ["#818cf8", "#e879f9", "#fb923c", "#38bdf8", "#f472b6"]
  const frame = () => {
    if (Date.now() > end) return
    confetti({ particleCount: 3, angle: 60, spread: 55, startVelocity: 60, origin: { x: 0, y: 0.6 }, colors })
    confetti({ particleCount: 3, angle: 120, spread: 55, startVelocity: 60, origin: { x: 1, y: 0.6 }, colors })
    requestAnimationFrame(frame)
  }
  frame()
}

/** Section 6 — waitlist with the animated-label inputs; confetti on success. */
export function WaitlistSection({ plan }: { plan?: string } = {}) {
  const confettiRef = useRef<ConfettiRef>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [error, setError] = useState("")
  const [joined, setJoined] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid work email so we can reach you.")
      return
    }
    setError("")
    setJoined(true)
    // TODO: send { name, email, company, plan } to your backend (e.g. a Supabase table or Resend audience).
    confettiRef.current?.fire({ particleCount: 140, spread: 100, origin: { y: 0.55 }, colors: ["#818cf8", "#e879f9", "#fb923c", "#38bdf8", "#f472b6"] })
    sideCannons()
  }

  return (
    <section id="waitlist" className="relative overflow-hidden border-t border-white/5 bg-neutral-950 py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(129,140,248,0.2),transparent)]" />
      <Confetti ref={confettiRef} manualstart className="pointer-events-none absolute inset-0 z-20 size-full" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Eyebrow>Early access</Eyebrow>
          <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl">
            Know what your AI agent said <span className="text-indigo-300">before your customers tell you.</span>
          </h2>
          {plan && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="self-start rounded-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-orange-300 px-3 py-1 text-sm font-semibold capitalize text-[#0a0a0a]"
            >
              Reserving the {plan} plan
            </motion.span>
          )}
          <p className="max-w-[46ch] text-lg leading-relaxed text-neutral-400">
            Join the waitlist for founding prices and a free agent audit: upload your bot's chats, get a risk report.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/50 backdrop-blur sm:p-10">
          <AnimatePresence mode="wait">
            {joined ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start gap-4"
                role="status"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-orange-300 text-[#0a0a0a]">
                  <svg viewBox="0 0 16 16" className="h-6 w-6" aria-hidden="true">
                    <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="font-display text-3xl font-bold text-white">You're on the list{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}.</h3>
                <p className="text-neutral-400">
                  We'll email <span className="text-neutral-200">{email}</span> when your spot opens, with a link to run your free audit.
                </p>
                <Button variant="outline" className="mt-2 rounded-xl bg-transparent" onClick={() => setJoined(false)}>
                  Add another email
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                onSubmit={onSubmit}
                noValidate
                className="flex flex-col gap-9"
              >
                <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-label="Your name" />
                <Input
                  label="Work email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  aria-label="Work email"
                  aria-invalid={Boolean(error)}
                />
                <Input
                  label="Company or agency (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  aria-label="Company or agency"
                />
                {error && <p className="-mt-5 text-sm text-orange-300">{error}</p>}
                <Button type="submit" size="lg" className="h-13 rounded-xl text-base font-semibold">
                  Get early access
                </Button>
                <p className="-mt-5 text-center text-xs text-neutral-500">Free plan for 1 agent. No credit card.</p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
