// POST /api/ingest — send conversations to AgentMinder directly (SDK, webhook, or the app's CSV upload).
//
// Auth: header `x-agentminder-key: am_live_…`, or a signed-in user's token plus `agent_id` in the body.
// Body, one conversation:
//   { "conversation_id": "chat_123", "messages": [{ "role": "user", "content": "…" }, …],
//     "model": "gpt-4o-mini", "usage": { "input_tokens": 120, "output_tokens": 40 } }
// Or many at once: { "conversations": [ …same shape… ] }   (max 200)
import { waitUntil } from "@vercel/functions"
import { agentFor, CORS, fail, HttpError, json, normalize, review, saveConversation, type Incoming } from "./_lib.js"

type Raw = {
  conversation_id?: string
  id?: string
  messages?: unknown
  system?: unknown
  model?: string
  usage?: { input_tokens?: number; output_tokens?: number; prompt_tokens?: number; completion_tokens?: number }
}

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as (Raw & { conversations?: Raw[]; agent_id?: string }) | null
    if (!body) throw new HttpError(400, "Send a JSON body.")
    const agent = await agentFor(req, body.agent_id)

    const raws = Array.isArray(body.conversations) ? body.conversations : [body]
    if (raws.length > 200) throw new HttpError(413, "Send at most 200 conversations per request.")

    const items: Incoming[] = raws.map((r, i) => {
      const messages = normalize(r.messages, r.system)
      if (!messages.length) throw new HttpError(400, `Conversation ${i + 1} has no messages.`)
      return {
        external_id: String(r.conversation_id ?? r.id ?? crypto.randomUUID()).slice(0, 200),
        messages,
        model: r.model,
        input_tokens: r.usage?.input_tokens ?? r.usage?.prompt_tokens,
        output_tokens: r.usage?.output_tokens ?? r.usage?.completion_tokens,
      }
    })

    const ids: string[] = []
    for (const it of items) ids.push(await saveConversation(agent, it))

    // Review after responding, a few at a time.
    waitUntil(
      (async () => {
        for (let i = 0; i < ids.length; i += 4) await Promise.all(ids.slice(i, i + 4).map((id) => review(id)))
      })(),
    )
    return json({ ok: true, received: ids.length, conversation_ids: ids })
  } catch (e) {
    return fail(e)
  }
}
