import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import Papa from "papaparse"
import { api, supabase, type Agent, type Conversation, type Flag, type Policy } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { ago, Btn, Card, Code, Empty, Field, FlagChip, healthScore, Select, Severity, StatusChip, usd } from "./ui"

const TABS = [
  ["overview", "Overview"],
  ["chats", "Chats"],
  ["connect", "Connect"],
  ["rules", "Rules"],
  ["settings", "Settings"],
] as const
type Tab = (typeof TABS)[number][0]

export default function AgentPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = (params.get("tab") as Tab) || "overview"
  const [agent, setAgent] = useState<Agent | null | undefined>(undefined)
  const [convs, setConvs] = useState<Conversation[]>([])
  const [flags, setFlags] = useState<Flag[]>([])
  const [open, setOpen] = useState<Conversation | null>(null)

  const load = useCallback(async () => {
    const [a, c, f] = await Promise.all([
      supabase.from("agents").select("id, name, kind, key_prefix, slack_webhook, created_at").eq("id", id!).maybeSingle(),
      supabase.from("conversations").select("*").eq("agent_id", id!).order("updated_at", { ascending: false }).limit(300),
      supabase.from("flags").select("*").eq("agent_id", id!).order("created_at", { ascending: false }).limit(500),
    ])
    setAgent(a.data ?? null)
    setConvs((c.data as Conversation[]) ?? [])
    setFlags((f.data as Flag[]) ?? [])
  }, [id])

  useEffect(() => {
    load()
    // Refresh every 10 s while some chats are still being reviewed.
    const t = window.setInterval(() => {
      setConvs((cur) => {
        if (cur.some((c) => c.status === "pending")) load()
        return cur
      })
    }, 10_000)
    return () => window.clearInterval(t)
  }, [load])

  if (agent === undefined) return <p className="text-neutral-500">Loading…</p>
  if (!agent) return <Empty title="Agent not found"><Link to="/app" className="underline">Back to your agents</Link></Empty>

  const score = healthScore(convs, flags)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link to="/app" className="text-sm text-neutral-500 hover:text-white">← All agents</Link>
          <h1 className="mt-2 truncate font-display text-4xl font-bold tracking-tight text-white">{agent.name}</h1>
          <p className="capitalize text-neutral-500">{agent.kind} bot</p>
        </div>
        <div className="text-right">
          <p className="font-display text-5xl font-bold tabular-nums text-white">{score ?? "—"}</p>
          <p className="text-sm text-neutral-500">health score</p>
        </div>
      </div>

      <div role="tablist" aria-label="Agent sections" className="flex gap-1 overflow-x-auto border-b border-white/10">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setParams(k === "overview" ? {} : { tab: k })}
            className={cn("relative min-h-11 whitespace-nowrap px-4 text-sm transition-colors", tab === k ? "text-white" : "text-neutral-400 hover:text-white")}
          >
            {label}
            {tab === k && <motion.span layoutId="agent-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-orange-300" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === "overview" && <Overview convs={convs} flags={flags} onOpen={setOpen} onFlags={setFlags} />}
          {tab === "chats" && <Chats convs={convs} flags={flags} onOpen={setOpen} />}
          {tab === "connect" && <Connect agent={agent} onUploaded={load} />}
          {tab === "rules" && <Rules agentId={agent.id} />}
          {tab === "settings" && <Settings agent={agent} onSaved={load} />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>{open && <Transcript conv={open} flags={flags.filter((f) => f.conversation_id === open.id)} onClose={() => setOpen(null)} onReviewed={load} />}</AnimatePresence>
    </div>
  )
}

/* ───────── Overview ───────── */

function Overview({ convs, flags, onOpen, onFlags }: { convs: Conversation[]; flags: Flag[]; onOpen: (c: Conversation) => void; onFlags: (f: Flag[]) => void }) {
  const reviewed = convs.filter((c) => c.status === "reviewed")
  const resolved = reviewed.length ? Math.round((100 * reviewed.filter((c) => c.resolved).length) / reviewed.length) : null
  const spend = convs.reduce((n, c) => n + Number(c.cost_usd), 0)
  const resolvedCount = reviewed.filter((c) => c.resolved).length
  const live = flags.filter((f) => !f.dismissed)
  const byConv = new Map(convs.map((c) => [c.id, c]))

  const days = useMemo(() => {
    const out: { d: string; v: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400_000)
      const key = day.toISOString().slice(0, 10)
      out.push({ d: day.toLocaleDateString("en-IN", { weekday: "short" }), v: convs.filter((c) => c.updated_at.slice(0, 10) === key).reduce((n, c) => n + Number(c.cost_usd), 0) })
    }
    return out
  }, [convs])
  const max = Math.max(...days.map((d) => d.v), 0.000001)

  const dismiss = async (f: Flag) => {
    onFlags(flags.map((x) => (x.id === f.id ? { ...x, dismissed: true } : x)))
    await supabase.from("flags").update({ dismissed: true }).eq("id", f.id)
  }

  if (!convs.length)
    return (
      <Empty title="No chats yet">
        Open the <b className="text-white">Connect</b> tab to route your bot through AgentMinder or upload a CSV of past chats. Reviews appear here within a minute.
      </Empty>
    )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Chats", convs.length.toLocaleString("en-IN")],
          ["Resolved by the bot", resolved === null ? "—" : `${resolved}%`],
          ["Need a human look", String(new Set(live.map((f) => f.conversation_id)).size)],
          ["Cost per resolution", resolvedCount ? usd(spend / resolvedCount) : "—"],
        ].map(([k, v]) => (
          <Card key={k}>
            <p className="text-sm text-neutral-400">{k}</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums text-white">{v}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Needs your attention</h2>
            <span className="text-sm text-neutral-500">{live.length} open</span>
          </div>
          {live.length === 0 ? (
            <p className="text-sm text-neutral-400">Nothing flagged. Your agent is behaving.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {live.slice(0, 20).map((f) => {
                const c = byConv.get(f.conversation_id)
                return (
                  <li key={f.id} className="rounded-xl bg-white/[0.04] p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <FlagChip type={f.type} />
                      <Severity s={f.severity} />
                      <span className="ml-auto text-xs text-neutral-500">{ago(f.created_at)}</span>
                    </div>
                    {f.quote && <p className="mt-3 border-l-2 border-fuchsia-300/60 pl-3 text-[15px] text-neutral-100">“{f.quote}”</p>}
                    <p className="mt-2 text-sm leading-relaxed text-neutral-300">{f.explanation}</p>
                    {f.suggested_fix && <p className="mt-1 text-sm text-indigo-200">Fix: {f.suggested_fix}</p>}
                    <div className="mt-3 flex gap-2">
                      {c && (
                        <button type="button" onClick={() => onOpen(c)} className="min-h-9 rounded-lg px-3 text-sm text-white ring-1 ring-white/15 hover:bg-white/10">
                          Open chat
                        </button>
                      )}
                      <button type="button" onClick={() => dismiss(f)} className="min-h-9 rounded-lg px-3 text-sm text-neutral-400 hover:text-white">
                        Not a problem
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold text-white">AI spend, last 7 days</h2>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-white">{usd(days.reduce((n, d) => n + d.v, 0))}</p>
          <div className="mt-5 flex h-36 items-end gap-2">
            {days.map((d, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <motion.div
                  title={usd(d.v)}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(2, (d.v / max) * 100)}%` }}
                  transition={{ delay: i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-fuchsia-400"
                />
                <span className="text-[11px] text-neutral-500">{d.d}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">Estimated from token usage at list prices.</p>
        </Card>
      </div>
    </div>
  )
}

/* ───────── Chats ───────── */

function Chats({ convs, flags, onOpen }: { convs: Conversation[]; flags: Flag[]; onOpen: (c: Conversation) => void }) {
  const [filter, setFilter] = useState<"all" | "flagged" | "unresolved">("all")
  const flagged = new Set(flags.filter((f) => !f.dismissed).map((f) => f.conversation_id))
  const list = convs.filter((c) => (filter === "flagged" ? flagged.has(c.id) : filter === "unresolved" ? c.status === "reviewed" && !c.resolved : true))
  if (!convs.length) return <Empty title="No chats yet">Connect your bot or upload a CSV from the Connect tab.</Empty>
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "flagged", "unresolved"] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            className={cn("min-h-9 rounded-full px-4 text-sm capitalize ring-1", filter === k ? "bg-white/10 text-white ring-white/25" : "text-neutral-400 ring-white/10 hover:text-white")}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/[0.03] text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Chat</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Flags</th>
              <th className="px-4 py-3 text-right font-medium">Cost</th>
              <th className="px-4 py-3 text-right font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const n = flags.filter((f) => f.conversation_id === c.id && !f.dismissed).length
              return (
                <tr key={c.id} onClick={() => onOpen(c)} className="cursor-pointer border-t border-white/5 hover:bg-white/[0.04]">
                  <td className="max-w-[340px] px-4 py-3">
                    <p className="truncate text-neutral-100">{c.summary ?? c.messages.find((m) => m.role === "user")?.content ?? c.external_id}</p>
                    <p className="truncate font-mono text-xs text-neutral-500">{c.external_id}</p>
                  </td>
                  <td className="px-4 py-3"><StatusChip c={c} /></td>
                  <td className={cn("px-4 py-3 tabular-nums", n ? "text-orange-300" : "text-neutral-500")}>{n || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-300">{usd(Number(c.cost_usd))}</td>
                  <td className="px-4 py-3 text-right text-neutral-500">{ago(c.updated_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Transcript({ conv, flags, onClose, onReviewed }: { conv: Conversation; flags: Flag[]; onClose: () => void; onReviewed: () => void }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(conv.review_error ?? "")
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", k)
    return () => window.removeEventListener("keydown", k)
  }, [onClose])
  const rerun = async () => {
    setBusy(true)
    setMsg("")
    try {
      const r = await api<{ ok: boolean; error?: string }>("/api/review", { conversation_id: conv.id })
      setMsg(r.ok ? "Reviewed again." : r.error ?? "Review failed.")
      onReviewed()
    } catch (e) {
      setMsg((e as Error).message)
    }
    setBusy(false)
  }
  const quotes = flags.map((f) => f.quote).filter(Boolean) as string[]
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div className="absolute inset-0 bg-neutral-950/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Conversation"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="relative flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-white/10 bg-neutral-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-neutral-500">{conv.external_id}</p>
            <p className="mt-1 text-neutral-100">{conv.summary ?? "Not reviewed yet."}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              <StatusChip c={conv} />
              {conv.model && <span>{conv.model}</span>}
              <span>{usd(Number(conv.cost_usd))}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 flex-none place-items-center rounded-full text-xl text-neutral-300 ring-1 ring-white/15 hover:bg-white/10">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {flags.length > 0 && (
            <div className="mb-5 flex flex-col gap-2">
              {flags.map((f) => (
                <div key={f.id} className={cn("rounded-xl p-3", f.dismissed ? "bg-white/[0.02] opacity-60" : "bg-orange-400/[0.07]")}>
                  <div className="flex items-center gap-2"><FlagChip type={f.type} /><Severity s={f.severity} /></div>
                  <p className="mt-2 text-sm text-neutral-300">{f.explanation}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3">
            {conv.messages.map((m, i) =>
              m.role === "system" ? (
                <details key={i} className="rounded-xl bg-white/[0.03] p-3 text-xs text-neutral-500">
                  <summary className="cursor-pointer">Bot instructions</summary>
                  <p className="mt-2 whitespace-pre-wrap">{m.content}</p>
                </details>
              ) : (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed",
                    m.role === "assistant" ? "self-end rounded-tr-sm bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-[#fff]" : "self-start rounded-tl-sm bg-white/10 text-neutral-100",
                    m.role === "assistant" && quotes.some((q) => q && m.content.includes(q.slice(0, 40))) && "ring-2 ring-orange-300",
                  )}
                >
                  {m.content}
                </div>
              ),
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 p-4">
          <span className="text-sm text-neutral-400">{msg}</span>
          <Btn variant="ghost" onClick={rerun} disabled={busy}>{busy ? "Reviewing…" : "Review again"}</Btn>
        </div>
      </motion.aside>
    </div>
  )
}

/* ───────── Connect ───────── */

function Connect({ agent, onUploaded }: { agent: Agent; onUploaded: () => void }) {
  const origin = window.location.origin
  const [method, setMethod] = useState<"openai" | "anthropic" | "api" | "csv">("openai")
  return (
    <div className="flex flex-col gap-6">
      <p className="text-neutral-400">
        Use the key you saved when you added this agent. It starts with <code className="font-mono text-neutral-200">{agent.key_prefix}…</code>. Lost it? Make a new one in Settings.
      </p>
      <div className="flex flex-wrap gap-2">
        {([
          ["openai", "OpenAI SDK"],
          ["anthropic", "Anthropic SDK"],
          ["api", "Send chats (any platform)"],
          ["csv", "Upload CSV"],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            type="button"
            aria-pressed={method === k}
            onClick={() => setMethod(k)}
            className={cn("min-h-10 rounded-full px-4 text-sm ring-1", method === k ? "bg-white/10 text-white ring-white/25" : "text-neutral-400 ring-white/10 hover:text-white")}
          >
            {l}
          </button>
        ))}
      </div>

      {method === "openai" && (
        <Card className="flex flex-col gap-4">
          <p className="text-neutral-300">Change the base URL and add one header. Your OpenAI key stays the same and is never stored.</p>
          <Code label="Node / TypeScript">{`import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "${origin}/api/proxy/openai/v1",
  defaultHeaders: { "x-agentminder-key": process.env.AGENTMINDER_KEY },
})`}</Code>
          <Code label="Python">{`from openai import OpenAI

client = OpenAI(
    base_url="${origin}/api/proxy/openai/v1",
    default_headers={"x-agentminder-key": os.environ["AGENTMINDER_KEY"]},
)`}</Code>
          <p className="text-sm text-neutral-500">Tip: send <code className="font-mono">x-agentminder-conversation: &lt;your chat id&gt;</code> too, so every turn of a chat is grouped together.</p>
        </Card>
      )}

      {method === "anthropic" && (
        <Card className="flex flex-col gap-4">
          <p className="text-neutral-300">Same idea for Claude. Your Anthropic key stays the same and is never stored.</p>
          <Code label="Node / TypeScript">{`import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: "${origin}/api/proxy/anthropic",
  defaultHeaders: { "x-agentminder-key": process.env.AGENTMINDER_KEY },
})`}</Code>
          <Code label="Python">{`from anthropic import Anthropic

client = Anthropic(
    base_url="${origin}/api/proxy/anthropic",
    default_headers={"x-agentminder-key": os.environ["AGENTMINDER_KEY"]},
)`}</Code>
        </Card>
      )}

      {method === "api" && (
        <Card className="flex flex-col gap-4">
          <p className="text-neutral-300">
            For Intercom, Voiceflow, n8n, Zapier or your own backend: post each finished chat. Send the same <code className="font-mono">conversation_id</code> again to update a chat.
          </p>
          <Code label="curl">{`curl ${origin}/api/ingest \\
  -H "content-type: application/json" \\
  -H "x-agentminder-key: $AGENTMINDER_KEY" \\
  -d '{
    "conversation_id": "chat_123",
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "user", "content": "It arrived broken, I want a refund." },
      { "role": "assistant", "content": "Sorry about that! I have refunded the full amount." }
    ]
  }'`}</Code>
        </Card>
      )}

      {method === "csv" && <CsvUpload agentId={agent.id} onDone={onUploaded} />}
    </div>
  )
}

function CsvUpload({ agentId, onDone }: { agentId: string; onDone: () => void }) {
  const [status, setStatus] = useState("")
  const [busy, setBusy] = useState(false)

  const onFile = (file: File) => {
    setBusy(true)
    setStatus("Reading the file…")
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        try {
          const rows = res.data
          const pick = (r: Record<string, string>, ...keys: string[]) => {
            for (const k of Object.keys(r)) if (keys.includes(k.trim().toLowerCase())) return r[k]
            return undefined
          }
          const groups = new Map<string, { role: string; content: string }[]>()
          for (const r of rows) {
            const id = pick(r, "conversation_id", "conversation", "chat_id", "thread_id", "session_id")
            const role = (pick(r, "role", "sender", "author", "from") ?? "").toLowerCase()
            const content = pick(r, "content", "message", "text", "body")
            if (!id || !content) continue
            const norm = /assist|bot|agent|ai/.test(role) ? "assistant" : /system/.test(role) ? "system" : "user"
            if (!groups.has(id)) groups.set(id, [])
            groups.get(id)!.push({ role: norm, content })
          }
          if (!groups.size) throw new Error("No chats found. The file needs columns: conversation_id, role, content.")
          const all = [...groups.entries()].slice(0, 1000).map(([conversation_id, messages]) => ({ conversation_id, messages }))
          for (let i = 0; i < all.length; i += 100) {
            setStatus(`Uploading ${Math.min(i + 100, all.length)} of ${all.length} chats…`)
            await api("/api/ingest", { agent_id: agentId, conversations: all.slice(i, i + 100) })
          }
          setStatus(`Uploaded ${all.length} chats. Reviews will appear on the Overview tab over the next few minutes.`)
          onDone()
        } catch (e) {
          setStatus((e as Error).message)
        }
        setBusy(false)
      },
      error: (e) => {
        setStatus(e.message)
        setBusy(false)
      },
    })
  }

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-neutral-300">Upload past chats for a quick audit. One row per message, with these columns:</p>
      <Code>{`conversation_id,role,content
chat_1,user,It arrived broken. Can I get a refund?
chat_1,assistant,Of course! I've refunded the full amount.
chat_2,user,Are you open on Sunday?`}</Code>
      <label className={cn("flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 p-6 text-center hover:border-white/30", busy && "pointer-events-none opacity-60")}>
        <span className="font-semibold text-white">{busy ? "Working…" : "Choose a CSV file"}</span>
        <span className="text-sm text-neutral-500">Up to 1,000 chats per upload</span>
        <input id="csv-file" type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </label>
      {status && <p className="text-sm text-neutral-300">{status}</p>}
    </Card>
  )
}

/* ───────── Rules ───────── */

function Rules({ agentId }: { agentId: string }) {
  const [rules, setRules] = useState<Policy[] | null>(null)
  const [rule, setRule] = useState("")
  const [severity, setSeverity] = useState<Policy["severity"]>("high")
  const [error, setError] = useState("")
  const load = useCallback(() => {
    supabase.from("policies").select("*").eq("agent_id", agentId).order("created_at").then(({ data }) => setRules((data as Policy[]) ?? []))
  }, [agentId])
  useEffect(load, [load])

  const add = async (e: FormEvent) => {
    e.preventDefault()
    if (rule.trim().length < 3) return setError("Write the rule in a few words.")
    setError("")
    const { error: err } = await supabase.from("policies").insert({ agent_id: agentId, rule: rule.trim(), severity })
    if (err) return setError(err.message)
    setRule("")
    load()
  }
  const remove = async (p: Policy) => {
    setRules((r) => r?.filter((x) => x.id !== p.id) ?? null)
    await supabase.from("policies").delete().eq("id", p.id)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card>
        <h2 className="font-display text-lg font-semibold text-white">Add a rule</h2>
        <p className="mt-1 text-sm text-neutral-400">Write it the way you'd tell a new employee. Every new chat is checked against it.</p>
        <form onSubmit={add} className="mt-4 flex flex-col gap-4">
          <Field id="rule" label="Rule" placeholder="Never offer more than 15% discount" value={rule} onChange={(e) => setRule(e.target.value)} maxLength={300} />
          <Select id="rule-severity" label="How serious is breaking it?" value={severity} onChange={(e) => setSeverity(e.target.value as Policy["severity"])}>
            <option value="high">High: alert me right away</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          {error && <p className="text-sm text-orange-300">{error}</p>}
          <Btn type="submit">Add rule</Btn>
        </form>
      </Card>
      <div className="flex flex-col gap-3">
        {rules === null ? (
          <p className="text-neutral-500">Loading…</p>
        ) : rules.length === 0 ? (
          <Empty title="No rules yet">Examples: "Refunds only within 30 days", "Never share account details", "Hand off to a person after 5 messages".</Empty>
        ) : (
          <AnimatePresence initial={false}>
            {rules.map((p) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="min-w-0">
                  <p className="text-neutral-100">{p.rule}</p>
                  <Severity s={p.severity} />
                </div>
                <button type="button" onClick={() => remove(p)} className="min-h-9 flex-none rounded-lg px-3 text-sm text-neutral-400 hover:text-orange-300">Remove</button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

/* ───────── Settings ───────── */

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")
}

function Settings({ agent, onSaved }: { agent: Agent; onSaved: () => void }) {
  const navigate = useNavigate()
  const [name, setName] = useState(agent.name)
  const [hook, setHook] = useState(agent.slack_webhook ?? "")
  const [msg, setMsg] = useState("")
  const [newKey, setNewKey] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (hook && !hook.startsWith("https://hooks.slack.com/")) return setMsg("Slack webhook URLs start with https://hooks.slack.com/")
    const { error } = await supabase.from("agents").update({ name: name.trim() || agent.name, slack_webhook: hook.trim() || null }).eq("id", agent.id)
    setMsg(error ? error.message : "Saved.")
    onSaved()
  }
  const rotate = async () => {
    const bytes = crypto.getRandomValues(new Uint8Array(24))
    const key = "am_live_" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")
    const { error } = await supabase.from("agents").update({ key_hash: await sha256(key), key_prefix: key.slice(0, 12) }).eq("id", agent.id)
    if (error) return setMsg(error.message)
    setNewKey(key)
    onSaved()
  }
  const remove = async () => {
    await supabase.from("agents").delete().eq("id", agent.id)
    navigate("/app")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <form onSubmit={save} className="flex flex-col gap-4">
          <Field id="set-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          <Field
            id="set-slack"
            label="Slack alerts"
            placeholder="https://hooks.slack.com/services/…"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            hint="High-severity flags are posted here within a minute. Create an Incoming Webhook in Slack and paste its URL."
          />
          {msg && <p className="text-sm text-neutral-300">{msg}</p>}
          <Btn type="submit">Save</Btn>
        </form>
      </Card>
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-white">Connection key</h2>
          <p className="text-sm text-neutral-400">
            Current key starts with <code className="font-mono text-neutral-200">{agent.key_prefix}…</code>. Making a new one stops the old key straight away.
          </p>
          {newKey ? <Code label="New key, shown once">{newKey}</Code> : <Btn variant="ghost" onClick={rotate}>Make a new key</Btn>}
        </Card>
        <Card className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-white">Delete agent</h2>
          <p className="text-sm text-neutral-400">Removes this agent with all its chats, flags and rules. This can't be undone.</p>
          {confirmDelete ? (
            <div className="flex gap-2">
              <Btn variant="danger" onClick={remove}>Yes, delete everything</Btn>
              <Btn variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Btn>
            </div>
          ) : (
            <Btn variant="danger" onClick={() => setConfirmDelete(true)}>Delete agent</Btn>
          )}
        </Card>
      </div>
    </div>
  )
}
