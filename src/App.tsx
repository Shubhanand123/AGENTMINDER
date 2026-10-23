import { useEffect, type MouseEvent } from "react"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { LayoutGroup } from "framer-motion"
import { Nav } from "@/components/sections/nav"
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer"
import HomePage from "@/pages/home-page"
import AgentsPage from "@/pages/agents-page"
import AgentPage from "@/pages/agent-page"
import ProductPage from "@/pages/product-page"
import FeaturesPage from "@/pages/features-page"
import PricingPage from "@/pages/pricing-page"
import DemoPage from "@/pages/demo-page"
import WaitlistPage from "@/pages/waitlist-page"
import NotFoundPage from "@/pages/not-found-page"
import AppShell from "@/app/app-shell"
import LoginPage from "@/app/login-page"
import DashboardPage from "@/app/dashboard-page"
import NewAgentPage from "@/app/new-agent-page"
import AgentAppPage from "@/app/agent-page"

const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "How it works", href: "/product" },
      { label: "Live demo", href: "/demo" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Agents",
    links: [
      { label: "Support desk", href: "/agents/support-desk" },
      { label: "Sales agent", href: "/agents/sales-agent" },
      { label: "Booking bot", href: "/agents/booking-bot" },
      { label: "All agents", href: "/agents" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Join the waitlist", href: "/waitlist" },
      { label: "Free agent audit", href: "/waitlist?plan=free" },
    ],
  },
]

/** Jump to the top of each new page (but keep in-page #anchors working). */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
  }, [pathname, hash])
  return null
}

export default function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const inApp = pathname.startsWith("/app") || pathname.startsWith("/login")

  // Plain <a href="/..."> links (footer, copy) navigate inside the app instead of reloading the page.
  const onClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest("a")
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return
    const href = a.getAttribute("href") ?? ""
    if (href === "#top") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (href.startsWith("/") && !a.dataset.discover) {
      e.preventDefault()
      navigate(href)
    }
  }

  if (inApp)
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="new" element={<NewAgentPage />} />
            <Route path="agents/:id" element={<AgentAppPage />} />
          </Route>
        </Routes>
      </>
    )

  return (
    <div className="min-h-screen bg-neutral-950" onClickCapture={onClickCapture}>
      <ScrollToTop />
      <Nav />
      <LayoutGroup>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:slug" element={<AgentPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </LayoutGroup>
      <HalftoneWordmarkFooter
        word="AGENTMINDER"
        studioLine={
          <>
            <span className="font-display text-base font-semibold text-white">AgentMinder</span>
            <br />
            Monitoring for AI agents, explained in plain language. Built in Goa, India.
          </>
        }
        groups={FOOTER_GROUPS}
        bottomLine="© 2026 AgentMinder · agentminder.ai"
      />
    </div>
  )
}
