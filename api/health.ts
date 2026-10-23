// GET /api/health — shows whether the backend is configured (no secrets are returned).
import { judgeConfig, json } from "./_lib.js"

export function GET() {
  const j = judgeConfig()
  return json({
    ok: true,
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    reviewer: !!j.key,
    reviewer_provider: j.provider,
    judge_model: j.model,
  })
}
