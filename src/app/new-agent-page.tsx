import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Btn, Card, Code, Field, Select } from "./ui"

const KINDS = ["support", "sales", "booking", "helpdesk", "onboarding", "billing", "shopping", "lead qualifier", "voice"]

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")
}

function newKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return "am_live_" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")
}

export default function NewAgentPage() {
  const [name, setName] = useState("")
  const [kind, setKind] = useState("support")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState<{ id: string; key: string } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError("Give your agent a name.")
    setBusy(true)
    setError("")
    // The key is made in your browser; only its fingerprint is saved, so nobody (us included) can read it later.
    const key = newKey()
    const { data, error: err } = await supabase
      .from("agents")
      .insert({ name: name.trim(), kind, key_hash: await sha256(key), key_prefix: key.slice(0, 12) })
      .select("id")
      .single()
    setBusy(false)
    if (err) return setError(err.message)
    setCreated({ id: data.id, key })
  }

  if (created)
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">Agent added</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white">Save your key now</h1>
          <p className="mt-2 text-neutral-400">This is the only time we can show it. Keep it with your bot's settings, like a password.</p>
        </div>
        <Code label="AgentMinder key">{created.key}</Code>
        <div className="flex flex-wrap gap-3">
          <Link to={`/app/agents/${created.id}?tab=connect`} className="inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-orange-300 px-4 text-sm font-semibold text-[#0a0a0a]">
            I've saved it. Connect my bot →
          </Link>
        </div>
      </motion.div>
    )

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">Add an agent</h1>
        <p className="mt-2 text-neutral-400">One agent per bot. You'll get a key to connect it.</p>
      </div>
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-5">
          <Field id="agent-name" label="Name" placeholder="Website support bot" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          <Select id="agent-kind" label="What does it do?" value={kind} onChange={(e) => setKind(e.target.value)}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k[0].toUpperCase() + k.slice(1)}
              </option>
            ))}
          </Select>
          {error && <p className="text-sm text-orange-300">{error}</p>}
          <Btn type="submit" disabled={busy}>{busy ? "Adding…" : "Add agent"}</Btn>
        </form>
      </Card>
    </div>
  )
}
