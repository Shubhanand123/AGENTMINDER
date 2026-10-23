import { useState, type FormEvent } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase, useSession } from "@/lib/supabase"
import { Logo } from "@/components/sections/shared"
import { Btn, Field } from "./ui"

export default function LoginPage() {
  const session = useSession()
  const location = useLocation()
  const [mode, setMode] = useState<"in" | "up">(new URLSearchParams(location.search).get("mode") === "signup" ? "up" : "in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  if (session) return <Navigate to="/app" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setNotice("")
    if (password.length < 8) return setError("Use at least 8 characters for your password.")
    setBusy(true)
    const res =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/app` } })
    setBusy(false)
    if (res.error) return setError(res.error.message)
    if (mode === "up" && !res.data.session) setNotice(`We sent a confirmation link to ${email}. Open it, then sign in.`)
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-neutral-950 px-5 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_30%_10%,rgba(129,140,248,0.22),transparent),radial-gradient(40%_40%_at_80%_90%,rgba(232,121,249,0.15),transparent)]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative flex w-full max-w-sm flex-col gap-8">
        <Logo />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">{mode === "in" ? "Sign in" : "Create your account"}</h1>
          <p className="mt-2 text-neutral-400">{mode === "in" ? "Welcome back. See what your agents did today." : "Free for one agent. No card needed."}</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field id="email" label="Work email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint={mode === "up" ? "At least 8 characters." : undefined}
          />
          {error && <p className="text-sm text-orange-300">{error}</p>}
          {notice && <p className="rounded-xl bg-indigo-400/10 p-3 text-sm text-indigo-200">{notice}</p>}
          <Btn type="submit" disabled={busy} className="h-12">
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
          </Btn>
        </form>
        <p className="text-sm text-neutral-400">
          {mode === "in" ? "New to AgentMinder? " : "Already have an account? "}
          <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="font-semibold text-white underline-offset-4 hover:underline">
            {mode === "in" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
