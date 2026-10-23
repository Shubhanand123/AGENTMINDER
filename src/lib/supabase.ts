import { createClient, type Session } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

// The publishable key is meant to be public; row level security protects the data.
const URL = import.meta.env.VITE_SUPABASE_URL ?? "https://yursclocrhtpqagekxbl.supabase.co"
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_7dkR21t41pVT5TlNIIep5g_CivBBo_O"

export const supabase = createClient(URL, KEY)

/** The current session: undefined while loading, null when signed out. */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  return session
}

/** Calls one of our /api functions with the signed-in user's token. */
export async function api<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify(body),
  })
  const out = await res.json().catch(() => ({ error: `The server answered ${res.status}.` }))
  if (!res.ok) throw new Error(out.error ?? `The server answered ${res.status}.`)
  return out as T
}

export type Agent = { id: string; name: string; kind: string; key_prefix: string; slack_webhook: string | null; created_at: string }
export type Conversation = {
  id: string
  agent_id: string
  external_id: string
  messages: { role: string; content: string }[]
  model: string | null
  input_tokens: number
  output_tokens: number
  cost_usd: number
  status: "pending" | "reviewed" | "error"
  resolved: boolean | null
  sentiment: string | null
  summary: string | null
  review_error: string | null
  started_at: string
  updated_at: string
}
export type Flag = {
  id: string
  conversation_id: string
  agent_id: string
  type: string
  severity: "low" | "medium" | "high"
  quote: string | null
  explanation: string
  suggested_fix: string | null
  dismissed: boolean
  created_at: string
}
export type Policy = { id: string; agent_id: string; rule: string; severity: "low" | "medium" | "high"; created_at: string }
