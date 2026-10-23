import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase, type Agent, type Conversation, type Flag } from "@/lib/supabase"
import { Card, Empty, healthScore, usd } from "./ui"

type Row = Agent & { convs: Pick<Conversation, "id" | "agent_id" | "status" | "resolved" | "cost_usd">[]; flags: Pick<Flag, "conversation_id" | "agent_id" | "severity" | "dismissed">[] }

export default function DashboardPage() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const since = new Date(Date.now() - 7 * 86400_000).toISOString()
    Promise.all([
      supabase.from("agents").select("id, name, kind, key_prefix, slack_webhook, created_at").order("created_at"),
      supabase.from("conversations").select("id, agent_id, status, resolved, cost_usd").gte("updated_at", since).limit(5000),
      supabase.from("flags").select("conversation_id, agent_id, severity, dismissed").gte("created_at", since).limit(5000),
    ]).then(([a, c, f]) => {
      const err = a.error ?? c.error ?? f.error
      if (err) return setError(err.message.includes("does not exist") ? "The database isn't set up yet. Run supabase/schema.sql in the Supabase SQL Editor." : err.message)
      setRows(
        (a.data ?? []).map((ag) => ({
          ...ag,
          convs: (c.data ?? []).filter((x) => x.agent_id === ag.id),
          flags: (f.data ?? []).filter((x) => x.agent_id === ag.id),
        })),
      )
    })
  }, [])

  if (error) return <Empty title="Couldn't load your agents">{error}</Empty>
  if (!rows) return <p className="text-neutral-500">Loading…</p>

  const totalChats = rows.reduce((n, r) => n + r.convs.length, 0)
  const needYou = rows.reduce((n, r) => n + new Set(r.flags.filter((f) => !f.dismissed).map((f) => f.conversation_id)).size, 0)
  const spend = rows.reduce((n, r) => n + r.convs.reduce((m, c) => m + Number(c.cost_usd), 0), 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300">Last 7 days</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white">Your agents</h1>
        </div>
        <Link to="/app/new" className="inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-orange-300 px-4 text-sm font-semibold text-[#0a0a0a]">
          + Add agent
        </Link>
      </div>

      {rows.length === 0 ? (
        <Empty title="No agents yet">
          Add your first agent to get a connection key. Then route your bot through AgentMinder, send chats from your code, or upload a CSV of past
          conversations for a quick audit.
          <div className="mt-4">
            <Link to="/app/new" className="font-semibold text-white underline underline-offset-4">Add your first agent →</Link>
          </div>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Chats reviewed", totalChats.toLocaleString("en-IN")],
              ["Need a human look", String(needYou)],
              ["AI spend", usd(spend)],
            ].map(([k, v]) => (
              <Card key={k}>
                <p className="text-sm text-neutral-400">{k}</p>
                <p className="mt-1 font-display text-4xl font-bold tabular-nums text-white">{v}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((r, i) => {
              const score = healthScore(r.convs, r.flags)
              const open = new Set(r.flags.filter((f) => !f.dismissed).map((f) => f.conversation_id)).size
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/app/agents/${r.id}`} className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-xl font-semibold text-white">{r.name}</h2>
                        <p className="text-sm capitalize text-neutral-500">{r.kind} bot</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-3xl font-bold tabular-nums text-white">{score ?? "—"}</p>
                        <p className="text-xs text-neutral-500">health</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-400">
                      <span>{r.convs.length} chats</span>
                      <span className={open ? "text-orange-300" : ""}>{open} need you</span>
                      <span>{usd(r.convs.reduce((m, c) => m + Number(c.cost_usd), 0))}</span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
