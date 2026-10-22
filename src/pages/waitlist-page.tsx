import { useSearchParams } from "react-router-dom"
import { Page } from "@/components/site/motion"
import { WaitlistSection } from "@/components/sections/waitlist-section"

export default function WaitlistPage() {
  const [params] = useSearchParams()
  return (
    <Page className="min-h-screen pt-16">
      <WaitlistSection plan={params.get("plan") ?? undefined} />
    </Page>
  )
}
