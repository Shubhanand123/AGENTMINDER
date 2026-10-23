// POST /api/review { conversation_id } — re-run the review of one conversation (signed-in owner only).
import { CORS, db, fail, HttpError, json, review } from "./_lib.js"

export function OPTIONS() {
  return new Response(null, { headers: CORS })
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? ""
    if (!auth.startsWith("Bearer ")) throw new HttpError(401, "Sign in first.")
    const { data: u } = await db().auth.getUser(auth.slice(7))
    if (!u.user) throw new HttpError(401, "Your session has expired. Sign in again.")
    const { conversation_id } = (await req.json().catch(() => ({}))) as { conversation_id?: string }
    if (!conversation_id) throw new HttpError(400, "conversation_id is required.")
    const { data } = await db().from("conversations").select("id").eq("id", conversation_id).eq("owner", u.user.id).maybeSingle()
    if (!data) throw new HttpError(404, "Conversation not found.")
    await review(data.id)
    const { data: after } = await db().from("conversations").select("status, review_error").eq("id", data.id).single()
    return json({ ok: after?.status === "reviewed", status: after?.status, error: after?.review_error ?? undefined })
  } catch (e) {
    return fail(e)
  }
}
