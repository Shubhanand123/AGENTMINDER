import { Link, Navigate, NavLink, Outlet } from "react-router-dom"
import { supabase, useSession } from "@/lib/supabase"
import { Logo } from "@/components/sections/shared"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { cn } from "@/lib/utils"

/** Layout for the signed-in app: top bar, then the page. Redirects to /login when signed out. */
export default function AppShell() {
  const session = useSession()
  if (session === undefined) return <div className="min-h-screen bg-neutral-950" />
  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-6">
            <Logo />
            <nav aria-label="App" className="hidden items-center gap-1 text-sm sm:flex">
              {[
                ["/app", "Agents"],
                ["/app/new", "Add agent"],
              ].map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={({ isActive }) => cn("rounded-full px-3 py-1.5 transition-colors", isActive ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white")}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[16ch] truncate text-sm text-neutral-500 md:inline">{session.user.email}</span>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="min-h-11 rounded-full px-4 text-sm text-neutral-300 ring-1 ring-white/15 hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-5 pb-10 text-xs text-neutral-500">
        <Link to="/" className="hover:text-white">agentminder.ai</Link>
      </footer>
    </div>
  )
}
