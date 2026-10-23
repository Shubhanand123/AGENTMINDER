// GET /api/health — shows whether the backend is configured (no secrets are returned).
import { json } from "./_lib.js"

export function GET() {
  return json({
    ok: true,
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    reviewer: !!process.env.ANTHROPIC_API_KEY,
    judge_model: process.env.JUDGE_MODEL || "claude-haiku-4-5",
  })
}
