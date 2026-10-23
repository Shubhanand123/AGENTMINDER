// /api/proxy/openai/v1/…    → https://api.openai.com/v1/…
// /api/proxy/anthropic/v1/… → https://api.anthropic.com/v1/…
//
// The customer points their SDK's base URL here and adds one header:
//   x-agentminder-key: am_live_…
// Their own OpenAI / Anthropic key passes straight through and is never stored.
// Every chat completion is logged as a conversation and reviewed in the background.
// Fails open: if logging breaks, the customer's request still goes through.
import { waitUntil } from "@vercel/functions"
import { agentFor, CORS, fail, HttpError, normalize, review, saveConversation, sha256, type Agent, type Msg } from "./_lib.js"

const UPSTREAM: Record<string, string> = {
  openai: "https://api.openai.com",
  anthropic: "https://api.anthropic.com",
}

const DROP = new Set(["host", "x-agentminder-key", "x-agentminder-conversation", "content-length", "connection", "accept-encoding", "x-forwarded-for", "x-forwarded-host", "x-forwarded-proto", "x-real-ip", "x-vercel-id", "forwarded"])

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function GET(req: Request) {
  return forward(req)
}

export async function POST(req: Request) {
  return forward(req)
}

async function forward(req: Request) {
  try {
    const url = new URL(req.url)
    const path = (url.searchParams.get("path") ?? url.pathname.replace(/^\/api\/proxy\/?/, "")).replace(/^\/+/, "")
    const [provider, ...rest] = path.split("/")
    const base = UPSTREAM[provider]
    if (!base) throw new HttpError(404, "Use /api/proxy/openai/v1/… or /api/proxy/anthropic/v1/…")

    const agent = await agentFor(req)

    const headers = new Headers()
    req.headers.forEach((v, k) => {
      if (!DROP.has(k.toLowerCase())) headers.set(k, v)
    })
    url.searchParams.delete("path")
    const target = `${base}/${rest.join("/")}${url.search}`
    const bodyText = req.method === "POST" ? await req.text() : undefined

    const upstream = await fetch(target, { method: req.method, headers, body: bodyText })

    let reqBody: Record<string, unknown> | null = null
    try {
      reqBody = bodyText ? JSON.parse(bodyText) : null
    } catch {
      reqBody = null
    }
    const isChat = !!reqBody && Array.isArray(reqBody.messages)
    const streaming = !!reqBody?.stream
    const outHeaders = new Headers(upstream.headers)
    outHeaders.delete("content-encoding")
    outHeaders.delete("content-length")
    for (const [k, v] of Object.entries(CORS)) outHeaders.set(k, v)

    if (!isChat || !upstream.ok) return new Response(upstream.body, { status: upstream.status, headers: outHeaders })

    const convoHeader = req.headers.get("x-agentminder-conversation")

    if (streaming) {
      // Pass the stream through untouched; log what we can from the request.
      waitUntil(log(agent, provider, reqBody!, null, convoHeader))
      return new Response(upstream.body, { status: upstream.status, headers: outHeaders })
    }

    const text = await upstream.text()
    let resBody: Record<string, unknown> | null = null
    try {
      resBody = JSON.parse(text)
    } catch {
      resBody = null
    }
    waitUntil(log(agent, provider, reqBody!, resBody, convoHeader))
    return new Response(text, { status: upstream.status, headers: outHeaders })
  } catch (e) {
    return fail(e)
  }
}

async function log(agent: Agent, provider: string, reqBody: Record<string, unknown>, resBody: Record<string, unknown> | null, convoHeader: string | null) {
  try {
    const messages: Msg[] = normalize(reqBody.messages, reqBody.system)
    let reply = ""
    let inTok = 0
    let outTok = 0
    if (resBody) {
      if (provider === "openai") {
        const choice = (resBody.choices as { message?: { content?: unknown } }[] | undefined)?.[0]
        reply = normalize([{ role: "assistant", content: choice?.message?.content }])[0]?.content ?? ""
        const u = resBody.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined
        inTok = u?.prompt_tokens ?? 0
        outTok = u?.completion_tokens ?? 0
      } else {
        reply = normalize([{ role: "assistant", content: resBody.content }])[0]?.content ?? ""
        const u = resBody.usage as { input_tokens?: number; output_tokens?: number } | undefined
        inTok = u?.input_tokens ?? 0
        outTok = u?.output_tokens ?? 0
      }
    }
    if (reply) messages.push({ role: "assistant", content: reply })
    if (!messages.some((m) => m.role !== "system")) return

    // Group turns of the same chat: the caller's id if given, else the system prompt + first customer message.
    const firstUser = messages.find((m) => m.role === "user")?.content ?? ""
    const system = messages.find((m) => m.role === "system")?.content ?? ""
    const external_id = convoHeader?.slice(0, 200) || `auto_${(await sha256(system + "\n" + firstUser)).slice(0, 24)}`

    const id = await saveConversation(agent, {
      external_id,
      messages,
      model: String(reqBody.model ?? resBody?.model ?? ""),
      input_tokens: inTok,
      output_tokens: outTok,
    })
    // Review once the agent has replied (skip pure streaming requests until the next turn).
    if (reply) await review(id)
  } catch (e) {
    console.error("proxy logging failed (request was still forwarded)", e)
  }
}
